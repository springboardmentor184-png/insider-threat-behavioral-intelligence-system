import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..models import User, UserProfile, ActivityLog, RiskScoreHistory
from ..services.risk_score import risk_score_calculator
from ..schemas import RiskScoreOut, RiskDistributionOut
from ..services.preprocessing import DataPreprocessing
from ..services.anomaly_detection import AnomalyDetection

preprocessor = DataPreprocessing()
anomaly_service = AnomalyDetection()

router = APIRouter(prefix="/risk", tags=["Risk Scoring"])

def _compute_ratios(employee_id: str, db: Session):
   
    logs = db.query(ActivityLog).filter(ActivityLog.employee == employee_id).all()
    total = len(logs) or 1  # avoid divide-by-zero

    usb_count = sum(1 for l in logs if "usb" in l.activity.lower())
    email_count = sum(1 for l in logs if "email" in l.activity.lower())
    web_count = sum(1 for l in logs if "web" in l.activity.lower() or "download" in l.activity.lower())
    login_count = sum(1 for l in logs if "login" in l.activity.lower())

    return {
        "anomaly_score": 0,  # placeholder until anomaly_detection.py is wired in
        "unusual_login_ratio": login_count / total,
        "usb_ratio": usb_count / total,
        "email_ratio": email_count / total,
        "web_ratio": web_count / total,
    }

@router.get("/{employee_id}", response_model=RiskScoreOut)
def get_employee_risk(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(UserProfile).filter(UserProfile.employee_id == employee_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Employee profile not found")

    ratios = _compute_ratios(employee_id, db)
    score = risk_score_calculator.calculate(
        anomaly_score=ratios["anomaly_score"],
        unusual_login_ratio=ratios["unusual_login_ratio"],
        usb_ratio=ratios["usb_ratio"],
        email_ratio=ratios["email_ratio"],
        web_ratio=ratios["web_ratio"],
    )
    category = risk_score_calculator.categorize(score)

    profile.risk_score = score
    db.commit()
    db.refresh(profile)

    return RiskScoreOut(employee_id=employee_id, risk_score=score, risk_category=category)

@router.get("/", response_model=list[RiskDistributionOut])
def get_risk_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profiles = db.query(UserProfile).all()
    results = [
        {"risk_score": p.risk_score, "risk_category": risk_score_calculator.categorize(p.risk_score)}
        for p in profiles
    ]
    return risk_score_calculator.get_risk_distribution(results)

def _get_all_features(db: Session):
   
    logs = db.query(ActivityLog).all()
    df = pd.DataFrame([{
        "employee_id": l.employee,
        "action": l.activity,
        "device_id": l.device,
        "timestamp": l.timestamp
    } for l in logs])

    features = preprocessor.build_employee_features(df)
    employee_ids = features["employee_id"].tolist()

    model = anomaly_service.load_model()
    feature_cols = features.drop(columns=["employee_id"])
    anomaly_results = anomaly_service.get_anomaly_score(model, feature_cols, employee_ids)

    anomaly_map = {r["employee_id"]: r["risk_score"] for r in anomaly_results}
    features["anomaly_score"] = features["employee_id"].map(anomaly_map)
    return features


def _build_features_and_anomaly(db: Session):
    """Pull ALL activity logs efficiently, build per-employee features, run anomaly model."""
    raw = pd.read_sql(
        db.query(
            ActivityLog.employee.label("employee_id"),
            ActivityLog.activity.label("action"),
            ActivityLog.device.label("device_id"),
            ActivityLog.timestamp.label("timestamp"),
        ).statement,
        db.bind
    )

    if raw.empty:
        return pd.DataFrame()

    features = preprocessor.build_employee_features(raw)

    model = anomaly_service.load_model()
    employee_ids = features["employee_id"].tolist()
    feature_cols = features.drop(columns=["employee_id"])

    anomaly_results = anomaly_service.get_anomaly_score(model, feature_cols, employee_ids)
    anomaly_map = {r["employee_id"]: r["risk_score"] for r in anomaly_results}

    features["anomaly_score"] = features["employee_id"].map(anomaly_map).fillna(0)

    total_events = (
        features["file_downloads"] + features["file_uploads"] +
        features["usb_events"] + features["failed_logins"]
    ).replace(0, 1)

    features["usb_ratio"] = features["usb_events"] / total_events
    features["email_ratio"] = features["file_uploads"] / total_events
    features["web_ratio"] = features["file_downloads"] / total_events
    features["unusual_login_ratio"] = features["after_hours_ratio"]

    return features
@router.post("/recalculate-all")
def recalculate_all_risk_scores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    features = _build_features_and_anomaly(db)
    if features.empty:
        raise HTTPException(status_code=404, detail="No activity logs found")

    profiles = {p.employee_id: p for p in db.query(UserProfile).all()}
    updated = 0

    for _, row in features.iterrows():
        profile = profiles.get(row["employee_id"])
        if not profile:
            continue

        score = risk_score_calculator.calculate(
            anomaly_score=row["anomaly_score"],
            unusual_login_ratio=row["unusual_login_ratio"],
            usb_ratio=row["usb_ratio"],
            email_ratio=row["email_ratio"],
            web_ratio=row["web_ratio"],
        )
        profile.risk_score = score
        db.add(RiskScoreHistory(
            employee_id=row["employee_id"],
            risk_score=score,
            risk_category=risk_score_calculator.categorize(score),
            department=profile.department,
        ))
        updated += 1

    db.commit()
    return {"message": f"Recalculated risk scores for {updated} employees"}