from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import LoginActivity, FileAccess

router = APIRouter(
    prefix="/activity",
    tags=["Activity Logs"]
)


@router.get("/")
def get_activity_logs(
    db: Session = Depends(get_db)
):
    login_logs = (
        db.query(LoginActivity)
        .order_by(LoginActivity.login_time.desc())
        .limit(500)
        .all()
    )

    file_logs = (
        db.query(FileAccess)
        .order_by(FileAccess.access_time.desc())
        .limit(500)
        .all()
    )

    activities = []

    for log in login_logs:
        activities.append(
            {
                "id": log.id,
                "user": log.user,
                "type": "Login",
                "activity": log.activity,
                "pc": log.pc,
                "timestamp": log.login_time,
                "is_anomaly": log.is_anomaly,
                "anomaly_score": log.anomaly_score
            }
        )

    for log in file_logs:
        activities.append(
            {
                "id": log.id,
                "user": log.user,
                "type": "File Access",
                "activity": log.action,
                "pc": log.pc,
                "filename": log.filename,
                "timestamp": log.access_time,
                "is_anomaly": log.is_anomaly,
                "anomaly_score": log.anomaly_score
            }
        )

    activities.sort(
        key=lambda activity: activity["timestamp"],
        reverse=True
    )

    return activities[:1000]