from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import ActivityLog, Employee, Device
from app.schemas.schemas import ActivityLogCreate, ActivityLogResponse
from app.core.dependencies import require_roles

router = APIRouter(prefix="/activities", tags=["Activity Monitoring"])

@router.get("", response_model=List[ActivityLogResponse])
def get_activities(
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    employee_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"]))
):
    query = db.query(ActivityLog)
    if event_type:
        query = query.filter(ActivityLog.event_type == event_type)
    if severity:
        query = query.filter(ActivityLog.severity == severity)
    if employee_id:
        query = query.filter(ActivityLog.employee_id == employee_id)
    return query.order_by(ActivityLog.timestamp.desc()).all()

@router.post("", response_model=ActivityLogResponse, status_code=status.HTTP_201_CREATED)
def create_activity_log(
    log_in: ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Administrator", "SOC Engineer"]))
):
    # Check if employee exists
    emp = db.query(Employee).filter(Employee.id == log_in.employee_id).first()
    if not emp:
        raise HTTPException(status_code=400, detail="Employee does not exist")
        
    # Check if device exists if specified
    if log_in.device_id:
        dev = db.query(Device).filter(Device.id == log_in.device_id).first()
        if not dev:
            raise HTTPException(status_code=400, detail="Device does not exist")
            
    db_log = ActivityLog(
        employee_id=log_in.employee_id,
        device_id=log_in.device_id,
        event_type=log_in.event_type,
        severity=log_in.severity,
        details=log_in.details
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
