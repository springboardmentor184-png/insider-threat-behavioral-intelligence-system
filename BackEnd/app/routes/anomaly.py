from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.models import AnomalyResult


router = APIRouter(
    prefix="/anomaly",
    tags=["Anomaly Detection"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


@router.get("/results")
def get_anomaly_results(
    db: Session = Depends(get_db)
):
    results = (
        db.query(AnomalyResult)
        .order_by(
            AnomalyResult.risk_score.desc()
        )
        .all()
    )

    return [
        {
            "id": result.id,
            "user": result.user,
            "login_count": result.login_count,
            "unique_devices": result.unique_devices,
            "after_hours_logins": result.after_hours_logins,
            "weekend_logins": result.weekend_logins,
            "after_hours_ratio": result.after_hours_ratio,
            "weekend_ratio": result.weekend_ratio,
            "anomaly_prediction": result.anomaly_prediction,
            "anomaly_score": result.anomaly_score,
            "anomaly": result.anomaly,
            "risk_score": result.risk_score,
            "risk_level": result.risk_level
        }
        for result in results
    ]


@router.get("/summary")
def get_anomaly_summary(
    db: Session = Depends(get_db)
):
    total_users = db.query(
        AnomalyResult
    ).count()

    total_anomalies = db.query(
        AnomalyResult
    ).filter(
        AnomalyResult.anomaly == 1
    ).count()

    critical_risk = db.query(
        AnomalyResult
    ).filter(
        AnomalyResult.risk_level == "Critical"
    ).count()

    high_risk = db.query(
        AnomalyResult
    ).filter(
        AnomalyResult.risk_level == "High"
    ).count()

    medium_risk = db.query(
        AnomalyResult
    ).filter(
        AnomalyResult.risk_level == "Medium"
    ).count()

    low_risk = db.query(
        AnomalyResult
    ).filter(
        AnomalyResult.risk_level == "Low"
    ).count()

    return {
        "total_users": total_users,
        "total_anomalies": total_anomalies,
        "risk_distribution": {
            "critical": critical_risk,
            "high": high_risk,
            "medium": medium_risk,
            "low": low_risk
        }
    }


@router.get("/top-risk")
def get_top_risk_users(
    db: Session = Depends(get_db)
):
    results = (
        db.query(AnomalyResult)
        .order_by(
            AnomalyResult.risk_score.desc()
        )
        .limit(10)
        .all()
    )

    return [
        {
            "user": result.user,
            "risk_score": result.risk_score,
            "risk_level": result.risk_level,
            "anomaly_score": result.anomaly_score
        }
        for result in results
    ]