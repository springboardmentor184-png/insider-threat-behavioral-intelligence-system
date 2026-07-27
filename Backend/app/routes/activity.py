from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BehaviorLog, Employee, User
from app.schemas import (
    BehaviorCreate,
    BehaviorUpdate,
    BehaviorResponse,
    ActivityLogResponse
)
from app.security import get_current_user

router = APIRouter(
    prefix="/activity",
    tags=["Behavior Monitoring"]
)


# ==========================================
# CREATE Behavior Log
# ==========================================
@router.post("/", response_model=BehaviorResponse)
def create_behavior(
    behavior: BehaviorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_behavior = BehaviorLog(**behavior.model_dump())

    db.add(db_behavior)
    db.commit()
    db.refresh(db_behavior)

    return db_behavior


# ==========================================
# GET ALL Behavior Logs
# ==========================================
@router.get("/", response_model=list[BehaviorResponse])
def get_all_behavior(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(BehaviorLog).all()


# ==========================================
# DASHBOARD ACTIVITY LOGS
# ==========================================
@router.get("/dashboard", response_model=list[ActivityLogResponse])
def get_dashboard_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = (
        db.query(Employee, BehaviorLog)
        .join(
            BehaviorLog,
            Employee.id == BehaviorLog.employee_id
        )
        .all()
    )

    activity_logs = []

    for employee, behavior in results:
        activity_logs.append({
            "employee_id": employee.employee_id,
            "full_name": employee.full_name,
            "department": employee.department,
            "role": employee.role,
            "failed_logins": behavior.failed_logins,
            "usb_used": behavior.usb_used,
            "after_hours_login": behavior.after_hours_login,
            "files_downloaded": behavior.files_downloaded,
            "emails_sent": behavior.emails_sent,
            "login_hour": behavior.login_hour,
        })

    return activity_logs


# ==========================================
# GET Behavior Log By ID
# ==========================================
@router.get("/{behavior_id}", response_model=BehaviorResponse)
def get_behavior(
    behavior_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    behavior = (
        db.query(BehaviorLog)
        .filter(BehaviorLog.id == behavior_id)
        .first()
    )

    if not behavior:
        raise HTTPException(
            status_code=404,
            detail="Behavior log not found"
        )

    return behavior


# ==========================================
# UPDATE Behavior Log
# ==========================================
@router.put("/{behavior_id}", response_model=BehaviorResponse)
def update_behavior(
    behavior_id: int,
    updated_behavior: BehaviorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    behavior = (
        db.query(BehaviorLog)
        .filter(BehaviorLog.id == behavior_id)
        .first()
    )

    if not behavior:
        raise HTTPException(
            status_code=404,
            detail="Behavior log not found"
        )

    for key, value in updated_behavior.model_dump().items():
        setattr(behavior, key, value)

    db.commit()
    db.refresh(behavior)

    return behavior


# ==========================================
# DELETE Behavior Log
# ==========================================
@router.delete("/{behavior_id}")
def delete_behavior(
    behavior_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    behavior = (
        db.query(BehaviorLog)
        .filter(BehaviorLog.id == behavior_id)
        .first()
    )

    if not behavior:
        raise HTTPException(
            status_code=404,
            detail="Behavior log not found"
        )

    db.delete(behavior)
    db.commit()

    return {
        "message": "Behavior log deleted successfully"
    }