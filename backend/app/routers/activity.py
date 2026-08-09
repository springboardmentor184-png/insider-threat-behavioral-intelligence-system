from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.dependencies import require_role


router = APIRouter(
    prefix="/activity",
    tags=["Activity"]
)


ANALYST_ROLES = (
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst"
)


# =========================================================
# CREATE ACTIVITY
# =========================================================

@router.post("/")
def create_activity(
    activity: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(*ANALYST_ROLES)
    )
):
    new_activity = models.ActivityLog(
        **activity.model_dump()
    )

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return new_activity


# =========================================================
# GET ALL ACTIVITIES
# =========================================================

@router.get("/")
def get_all_activities(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(*ANALYST_ROLES)
    )
):
    return (
        db.query(models.ActivityLog)
        .order_by(
            models.ActivityLog.timestamp.desc()
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


# =========================================================
# GET ACTIVITY BY ID
# =========================================================

@router.get("/{activity_id}")
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(*ANALYST_ROLES)
    )
):
    activity = (
        db.query(models.ActivityLog)
        .filter(
            models.ActivityLog.id == activity_id
        )
        .first()
    )

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    return activity


# =========================================================
# DELETE ACTIVITY
# Administrator only
# =========================================================

@router.delete("/{activity_id}")
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("Administrator")
    )
):
    activity = (
        db.query(models.ActivityLog)
        .filter(
            models.ActivityLog.id == activity_id
        )
        .first()
    )

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    db.delete(activity)
    db.commit()

    return {
        "message": "Activity deleted"
    }


# =========================================================
# UPDATE ACTIVITY
# Administrator only
# =========================================================

@router.put("/{activity_id}")
def update_activity(
    activity_id: int,
    updated_activity: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role("Administrator")
    )
):
    activity = (
        db.query(models.ActivityLog)
        .filter(
            models.ActivityLog.id == activity_id
        )
        .first()
    )

    if not activity:
        raise HTTPException(
            status_code=404,
            detail="Activity not found"
        )

    activity.employee = (
        updated_activity.employee
    )

    activity.activity = (
        updated_activity.activity
    )

    activity.device = (
        updated_activity.device
    )

    activity.ip_address = (
        updated_activity.ip_address
    )

    db.commit()
    db.refresh(activity)

    return activity