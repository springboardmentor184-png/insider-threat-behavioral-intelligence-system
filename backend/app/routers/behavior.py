from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app import models
from app.services.risk_score import risk_score_calculator
from app.services.alert_system import alert_system
from app.services.anomaly_detection import AnomalyDetection
from app.dependencies import get_current_user, require_role
import pandas as pd


router = APIRouter(
    prefix="/behavior",
    tags=["Behavior"]
)

ANALYST_ROLES = (
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst"
)


@router.get("/analyze/{employee_id}")
def analyze_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(*ANALYST_ROLES))
):
    logs = (
        db.query(models.ActivityLog)
        .filter(models.ActivityLog.employee == employee_id)
        .all()
    )

    if not logs:
        raise HTTPException(
            status_code=404,
            detail="No activity found for this employee"
        )

    total_logs = len(logs)
    unusual_login = 0
    usb_activity = 0
    email_count = 0
    web_access_count = 0
    file_access_count = 0

    for log in logs:
        activity = log.activity

        if activity == "Login":
            hour = log.timestamp.hour

            if hour < 6 or hour >= 15:
                unusual_login += 1

        elif activity in ["USB Connect", "USB Disconnect"]:
            usb_activity += 1

        elif activity == "Email Received":
            email_count += 1

        elif activity == "Web Access":
            web_access_count += 1

        elif activity == "File Access":
            file_access_count += 1

    return {
        "employee": employee_id,
        "total_logs": total_logs,
        "unusual_login": unusual_login,
        "usb_activity": usb_activity,
        "email_count": email_count,
        "web_access_count": web_access_count,
        "file_access_count": file_access_count,
    }


_anomaly_model_cache = None
_trained_model_cache = None


@router.get("/anomalies")
def get_all_risk_scores(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(*ANALYST_ROLES))
):
    employees = db.query(models.UserProfile).all()
    employee_ids = [e.employee_id for e in employees]

    if not employee_ids:
        return []

    results = (
        db.query(
            models.ActivityLog.employee.label("employee"),

            func.count(
                models.ActivityLog.id
            ).label("total_logs"),

            func.sum(
                case(
                    (
                        models.ActivityLog.activity.in_(
                            ["USB Connect", "USB Disconnect"]
                        ),
                        1
                    ),
                    else_=0
                )
            ).label("usb_activity"),

            func.sum(
                case(
                    (
                        models.ActivityLog.activity == "Email Received",
                        1
                    ),
                    else_=0
                )
            ).label("email_count"),

            func.sum(
                case(
                    (
                        models.ActivityLog.activity == "Web Access",
                        1
                    ),
                    else_=0
                )
            ).label("web_access_count"),

            func.sum(
                case(
                    (
                        models.ActivityLog.activity == "File Access",
                        1
                    ),
                    else_=0
                )
            ).label("file_access_count"),

            func.sum(
                case(
                    (
                        (models.ActivityLog.activity == "Login")
                        & (
                            (func.hour(models.ActivityLog.timestamp) < 6)
                            |
                            (func.hour(models.ActivityLog.timestamp) >= 15)
                        ),
                        1
                    ),
                    else_=0
                )
            ).label("unusual_login"),
        )
        .filter(
            models.ActivityLog.employee.in_(employee_ids)
        )
        .group_by(
            models.ActivityLog.employee
        )
        .all()
    )

    raw_data = []

    for row in results:

        if row.total_logs == 0:
            continue

        raw_data.append({
            "employee": row.employee,
            "total_logs": row.total_logs,
            "usb_count": row.usb_activity,
            "file_access_count": row.file_access_count,

            "unusual_login_ratio":
                float(row.unusual_login)
                / float(row.total_logs),

            "usb_ratio":
                float(row.usb_activity)
                / float(row.total_logs),

            "email_ratio":
                float(row.email_count)
                / float(row.total_logs),

            "web_ratio":
                float(row.web_access_count)
                / float(row.total_logs),

            "file_access_ratio":
                float(row.file_access_count)
                / float(row.total_logs),
        })

    if not raw_data:
        return []

    df = pd.DataFrame(raw_data)

    feature_columns = [
        "unusual_login_ratio",
        "usb_ratio",
        "email_ratio",
        "web_ratio",
        "file_access_ratio",
    ]

    if len(df) < 2:
        return []

    global _anomaly_model_cache, _trained_model_cache

    if _anomaly_model_cache is None:
        _anomaly_model_cache = AnomalyDetection()

        _trained_model_cache = (
            _anomaly_model_cache.train(
                df[feature_columns]
            )
        )

    anomaly_scores = (
        _anomaly_model_cache.get_anomaly_score(
            _trained_model_cache,
            df[feature_columns],
            df["employee"]
        )
    )

    score_map = {
        r["employee_id"]: r["risk_score"]
        for r in anomaly_scores
    }

    df["anomaly_score"] = (
        df["employee"].map(score_map)
    )

    final_results = []

    for index, row in df.iterrows():

        score = risk_score_calculator.calculate(
            anomaly_score=row["anomaly_score"],
            unusual_login_ratio=row["unusual_login_ratio"],
            usb_ratio=row["usb_ratio"],
            email_ratio=row["email_ratio"],
            web_ratio=row["web_ratio"],
            file_access_ratio=row["file_access_ratio"],
        )

        alert = alert_system.generate_alert(
            employee=row["employee"],
            risk_score=score,
            usb_count=row["usb_count"],
            db=db,
            background_tasks=background_tasks,
            behavior_details={
                "unusual_login_ratio":  row["unusual_login_ratio"],
                "usb_ratio": row["usb_ratio"],
                "email_ratio": row["email_ratio"],
                "web_ratio": row["web_ratio"],
                "file_access_ratio": row["file_access_ratio"],
            }
        )

        final_results.append({
            "employee": row["employee"],
            "total_logs": int(row["total_logs"]),
            "usb_count": int(row["usb_count"]),
            "file_access_count": int(
                row["file_access_count"]
            ),
            "anomaly_score": round(
                row["anomaly_score"],
                2
            ),
            "risk_score": score,
            "severity": alert["severity"]
        })

    results_sorted = sorted(
        final_results,
        key=lambda x: x["risk_score"],
        reverse=True
    )

    return results_sorted


@router.get("/risk_summary")
def get_risk_summary(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(*ANALYST_ROLES))
):
    all_scores = get_all_risk_scores(
        background_tasks,
        db,
        current_user
    )

    summary = {
        "Low": 0,
        "Medium": 0,
        "High": 0,
        "Critical": 0
    }

    for item in all_scores:
        severity = item["severity"]

        if severity in summary:
            summary[severity] += 1

    return [
        {
            "category": k,
            "count": v
        }
        for k, v in summary.items()
    ]


@router.get("/anomaly_report")
def get_anomaly_report(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(*ANALYST_ROLES))
):
    all_scores = get_all_risk_scores(
        background_tasks,
        db,
        current_user
    )

    total_employees_analyzed = len(all_scores)

    severity_breakdown = {
        "Low": 0,
        "Medium": 0,
        "High": 0,
        "Critical": 0
    }

    for item in all_scores:
        severity = item["severity"]

        if severity in severity_breakdown:
            severity_breakdown[severity] += 1

    total_flagged = sum(
        severity_breakdown[s]
        for s in [
            "Medium",
            "High",
            "Critical"
        ]
    )

    top_5_highest_risk = all_scores[:5]

    return {
        "total_employees_analyzed":
            total_employees_analyzed,

        "total_flagged":
            total_flagged,

        "severity_breakdown":
            severity_breakdown,

        "top_5_highest_risk":
            top_5_highest_risk
    }