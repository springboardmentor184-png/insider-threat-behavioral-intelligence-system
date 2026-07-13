from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.schemas.activity import ActivityCreate

from app.services.audit_service import create_audit_log


def create_activity(db: Session, activity: ActivityCreate):

    db_activity = Activity(
        activity_name=activity.activity_name,
        performed_by=activity.performed_by,
        status=activity.status,
        description=activity.description
    )

    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    create_audit_log(
        db=db,
        user_id=None,
        action="CREATE_ACTIVITY",
        status="SUCCESS",
        description=f"Activity '{activity.activity_name}' created."
    )

    return db_activity


def get_all_activities(db: Session):

    return db.query(Activity).order_by(
        Activity.timestamp.desc()
    ).all()