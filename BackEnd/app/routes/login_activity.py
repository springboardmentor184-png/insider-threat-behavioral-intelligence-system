from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import LoginActivity

router = APIRouter(
    prefix="/login-activity",
    tags=["Login Activity"]
)


@router.get("/")
def get_login_activity(
    db: Session = Depends(get_db)
):
    activities = (
        db.query(LoginActivity)
        .order_by(LoginActivity.login_time.desc())
        .limit(1000)
        .all()
    )

    return [
        {
            "id": activity.id,
            "employee_id": activity.employee_id,

            # LoginActivity model uses "user"
            # Frontend expects "username"
            "username": activity.user,

            "pc": activity.pc,
            "activity": activity.activity,
            "login_time": activity.login_time,
            "ip_address": activity.ip_address,
            "location": activity.location,
            "success": activity.success,
            "is_anomaly": activity.is_anomaly,
            "anomaly_score": activity.anomaly_score
        }
        for activity in activities
    ]


@router.get("/anomalies")
def get_login_anomalies(
    db: Session = Depends(get_db)
):
    activities = (
        db.query(LoginActivity)
        .filter(LoginActivity.is_anomaly == True)
        .order_by(LoginActivity.anomaly_score.desc())
        .limit(1000)
        .all()
    )

    return [
        {
            "id": activity.id,
            "employee_id": activity.employee_id,
            "username": activity.user,
            "pc": activity.pc,
            "activity": activity.activity,
            "login_time": activity.login_time,
            "anomaly_score": activity.anomaly_score
        }
        for activity in activities
    ]


@router.get("/{activity_id}")
def get_single_login_activity(
    activity_id: int,
    db: Session = Depends(get_db)
):
    activity = (
        db.query(LoginActivity)
        .filter(LoginActivity.id == activity_id)
        .first()
    )

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Login activity not found"
        )

    return {
        "id": activity.id,
        "employee_id": activity.employee_id,
        "username": activity.user,
        "pc": activity.pc,
        "activity": activity.activity,
        "login_time": activity.login_time,
        "ip_address": activity.ip_address,
        "location": activity.location,
        "success": activity.success,
        "is_anomaly": activity.is_anomaly,
        "anomaly_score": activity.anomaly_score
    }