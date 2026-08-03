from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import LoginActivity, FileAccess


router = APIRouter(
    prefix="/activity",
    tags=["Activity Logs"]
)


def check_anomaly(score):
    if score is None:
        return False

    return float(score) >= 0.5



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

        score = log.anomaly_score or 0


        activities.append(
            {
                "id": log.id,

                "username": log.user,

                "log_type": "Login",

                "event": log.activity,

                "device": log.pc,

                "event_time": log.login_time,

                "is_anomaly": (
                    True
                    if log.is_anomaly
                    else check_anomaly(score)
                ),

                "anomaly_score": score
            }
        )



    for log in file_logs:

        score = log.anomaly_score or 0


        activities.append(
            {
                "id": log.id,

                "username": log.user,

                "log_type": "File Access",

                "event": (
                    log.filename
                    if log.filename
                    else "File Access"
                ),

                "device": log.pc,

                "event_time": log.access_time,

                "is_anomaly": (
                    True
                    if log.is_anomaly
                    else check_anomaly(score)
                ),

                "anomaly_score": score
            }
        )



    activities.sort(
        key=lambda x:
        x["event_time"] or "",
        reverse=True
    )


    return activities[:1000]