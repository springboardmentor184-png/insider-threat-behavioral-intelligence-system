from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.activity import ActivityLog
from app.schemas.activity import ActivityCreate, ActivityResponse

router = APIRouter(
    prefix="/activities",
    tags=["Activities"]
)


@router.post("/", response_model=ActivityResponse)
def create_activity(
    activity: ActivityCreate,
    db: Session = Depends(get_db)
):

    db_activity = ActivityLog(
        employee_id=activity.employee_id,
        activity_type=activity.activity_type,
        ip_address=activity.ip_address,
        device=activity.device
    )

    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    return db_activity


@router.get("/", response_model=list[ActivityResponse])
def get_activities(db: Session = Depends(get_db)):
    return db.query(ActivityLog).all()