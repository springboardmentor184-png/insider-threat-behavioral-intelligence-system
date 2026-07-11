from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, or_, func, and_
from fastapi import HTTPException, status
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.models.activity import ActivityLog, ActivityType, Severity
from app.models.employee import Employee
from app.models.risk import RiskAssessment
from app.schemas.activity import PaginatedActivityResponse, ActivityDetailResponse, ActivityStatisticsResponse
import math

def _coerce_uuid(value: str | UUID) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


def get_activities(
    db: Session, 
    page: int = 1, 
    limit: int = 20, 
    employee_id: Optional[str] = None, 
    department_id: Optional[str] = None,
    activity_type: Optional[str] = None,
    severity: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None,
    sort_by: str = "timestamp",
    sort_order: str = "desc"
):
    query = db.query(ActivityLog)

    if employee_id:
        query = query.filter(ActivityLog.employee_id == _coerce_uuid(employee_id))
        
    if department_id:
        query = query.join(Employee).filter(Employee.department_id == department_id)

    if activity_type:
        query = query.filter(ActivityLog.activity_type == activity_type)

    if severity:
        query = query.filter(ActivityLog.severity == severity)
        
    if start_date:
        query = query.filter(ActivityLog.timestamp >= start_date)
        
    if end_date:
        query = query.filter(ActivityLog.timestamp <= end_date)

    if search:
        search_filter = or_(
            ActivityLog.description.ilike(f"%{search}%"),
            ActivityLog.ip_address.ilike(f"%{search}%"),
            ActivityLog.device_name.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    total = query.count()
    
    # Sorting
    if sort_order.lower() == "asc":
        query = query.order_by(asc(getattr(ActivityLog, sort_by, ActivityLog.timestamp)))
    else:
        query = query.order_by(desc(getattr(ActivityLog, sort_by, ActivityLog.timestamp)))

    items = query.offset((page - 1) * limit).limit(limit).all()
    total_pages = math.ceil(total / limit) if limit > 0 else 1
    
    return PaginatedActivityResponse(
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        items=items
    )

def get_activity_by_id(db: Session, activity_id: str):
    activity = db.query(ActivityLog).options(
        joinedload(ActivityLog.employee).joinedload(Employee.department),
        joinedload(ActivityLog.employee).joinedload(Employee.role)
    ).filter(ActivityLog.id == activity_id).first()
    
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")

    # Fetch latest risk score for the employee
    latest_risk = db.query(RiskAssessment).filter(RiskAssessment.employee_id == activity.employee_id).order_by(desc(RiskAssessment.created_at)).first()
    risk_score = latest_risk.risk_score if latest_risk else None

    return ActivityDetailResponse(
        **activity.__dict__,
        employee=activity.employee,
        department=activity.employee.department if activity.employee else None,
        role=activity.employee.role if activity.employee else None,
        risk_score=risk_score
    )

def get_employee_activities(db: Session, employee_id: str):
    activities = db.query(ActivityLog).filter(ActivityLog.employee_id == _coerce_uuid(employee_id)).order_by(desc(ActivityLog.timestamp)).all()
    return activities

def get_recent_activities(db: Session):
    return db.query(ActivityLog).order_by(desc(ActivityLog.timestamp)).limit(20).all()

def get_activity_statistics(db: Session):
    total_activities = db.query(ActivityLog).count()
    
    today = datetime.now(timezone.utc).date()
    today_activities = db.query(ActivityLog).filter(func.date(ActivityLog.timestamp) == today).count()
    
    failed_logins = db.query(ActivityLog).filter(ActivityLog.activity_type == ActivityType.FAILED_LOGIN).count()
    successful_logins = db.query(ActivityLog).filter(ActivityLog.activity_type == ActivityType.LOGIN).count()
    usb_events = db.query(ActivityLog).filter(ActivityLog.activity_type.in_([ActivityType.USB_CONNECTED, ActivityType.USB_REMOVED])).count()
    policy_violations = db.query(ActivityLog).filter(ActivityLog.activity_type == ActivityType.POLICY_VIOLATION).count()
    suspicious_activities = db.query(ActivityLog).filter(ActivityLog.severity.in_([Severity.HIGH, Severity.CRITICAL])).count()
    critical_alerts = db.query(ActivityLog).filter(ActivityLog.severity == Severity.CRITICAL).count()
    
    # Group by activity type
    grouped = db.query(ActivityLog.activity_type, func.count(ActivityLog.id)).group_by(ActivityLog.activity_type).all()
    grouped_by_type = [{"name": act_type.value, "value": count} for act_type, count in grouped]
    
    return ActivityStatisticsResponse(
        total_activities=total_activities,
        today_activities=today_activities,
        failed_logins=failed_logins,
        successful_logins=successful_logins,
        usb_events=usb_events,
        policy_violations=policy_violations,
        suspicious_activities=suspicious_activities,
        critical_alerts=critical_alerts,
        grouped_by_type=grouped_by_type
    )
