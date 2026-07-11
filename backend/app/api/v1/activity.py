from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from app.core.dependencies import get_db, get_current_user, require_roles
from app.schemas.activity import PaginatedActivityResponse, ActivityDetailResponse, ActivityResponse, ActivityStatisticsResponse
from app.services import activity_service
from app.models.employee import Employee

router = APIRouter()

@router.get("/statistics", response_model=ActivityStatisticsResponse, summary="Get Activity Statistics")
def get_activity_statistics(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Return global activity statistics grouped by types"""
    return activity_service.get_activity_statistics(db)

@router.get("/recent", response_model=List[ActivityResponse], summary="Get Recent Activities")
def get_recent_activities(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Return latest 20 activities for live feeds"""
    return activity_service.get_recent_activities(db)

@router.get("/employee/{employee_id}", response_model=List[ActivityResponse], summary="Get Employee Activities")
def get_employee_activities(employee_id: str, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    """Return all activity history for a specific employee"""
    # Employees can only view their own activities unless they are admin/analyst
    if str(current_user.id) != employee_id and current_user.role.role_name not in ["Administrator", "Security Analyst"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these activities")
        
    return activity_service.get_employee_activities(db, employee_id)

@router.get("/{activity_id}", response_model=ActivityDetailResponse, summary="Get Activity Details")
def get_activity_detail(activity_id: str, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    """Return full forensic details of a specific activity log"""
    return activity_service.get_activity_by_id(db, activity_id)

@router.get("/", response_model=PaginatedActivityResponse, summary="Get Paginated Activities")
def get_activities(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    employee_id: Optional[str] = None,
    department_id: Optional[str] = None,
    activity_type: Optional[str] = None,
    severity: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    search: Optional[str] = None,
    sort_by: str = Query("timestamp"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))
):
    """Return paginated, filterable activity logs"""
    return activity_service.get_activities(db, page, limit, employee_id, department_id, activity_type, severity, start_date, end_date, search, sort_by, sort_order)
