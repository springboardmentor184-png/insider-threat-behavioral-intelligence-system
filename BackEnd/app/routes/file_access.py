from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import FileAccess

router = APIRouter(
    prefix="/file-access",
    tags=["File Access"]
)


@router.get("/")
def get_file_access(
    db: Session = Depends(get_db)
):
    activities = (
        db.query(FileAccess)
        .order_by(FileAccess.access_time.desc())
        .limit(1000)
        .all()
    )

    return [
        {
            "id": activity.id,
            "employee_id": activity.employee_id,

            # FileAccess model uses "user"
            # Frontend expects "username"
            "username": activity.user,

            "pc": activity.pc,
            "filename": activity.filename,
            "content": activity.content,
            "access_time": activity.access_time,
            "action": activity.action,
            "is_anomaly": activity.is_anomaly,
            "anomaly_score": activity.anomaly_score
        }
        for activity in activities
    ]


@router.get("/anomalies")
def get_file_access_anomalies(
    db: Session = Depends(get_db)
):
    activities = (
        db.query(FileAccess)
        .filter(FileAccess.is_anomaly == True)
        .order_by(FileAccess.anomaly_score.desc())
        .limit(1000)
        .all()
    )

    return [
        {
            "id": activity.id,
            "employee_id": activity.employee_id,
            "username": activity.user,
            "pc": activity.pc,
            "filename": activity.filename,
            "access_time": activity.access_time,
            "action": activity.action,
            "anomaly_score": activity.anomaly_score
        }
        for activity in activities
    ]


@router.get("/{access_id}")
def get_single_file_access(
    access_id: int,
    db: Session = Depends(get_db)
):
    activity = (
        db.query(FileAccess)
        .filter(FileAccess.id == access_id)
        .first()
    )

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="File access activity not found"
        )

    return {
        "id": activity.id,
        "employee_id": activity.employee_id,
        "username": activity.user,
        "pc": activity.pc,
        "filename": activity.filename,
        "content": activity.content,
        "access_time": activity.access_time,
        "action": activity.action,
        "is_anomaly": activity.is_anomaly,
        "anomaly_score": activity.anomaly_score
    }