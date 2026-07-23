from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.activity import ActivityType, Severity
from app.schemas.employee import EmployeeResponse, DepartmentBase, RoleBase


class ActivityCreate(BaseModel):
    """Schema for creating new activity logs"""
    activity_type: ActivityType
    description: Optional[str] = None
    severity: Severity = Severity.LOW
    device_name: Optional[str] = None
    device_id: Optional[str] = None
    browser: Optional[str] = None
    operating_system: Optional[str] = None
    application_name: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[str] = None
    vpn_used: Optional[bool] = False
    is_after_hours: Optional[bool] = False
    is_weekend: Optional[bool] = False
    session_id: Optional[str] = None
    session_duration: Optional[int] = None
    resource_name: Optional[str] = None
    upload_size: Optional[int] = None
    download_size: Optional[int] = None
    data_transferred: Optional[int] = None
    privilege_level: Optional[str] = None
    failed_login_count: Optional[int] = 0


class ActivityResponse(BaseModel):
    """Schema for returning activity data"""
    id: UUID
    employee_id: UUID
    activity_type: ActivityType
    description: Optional[str] = None
    severity: Severity
    timestamp: datetime
    
    # Device & System
    device_name: Optional[str] = None
    device_id: Optional[str] = None
    browser: Optional[str] = None
    operating_system: Optional[str] = None
    application_name: Optional[str] = None
    
    # Network
    ip_address: Optional[str] = None
    location: Optional[str] = None
    vpn_used: Optional[bool] = None
    is_after_hours: Optional[bool] = None
    is_weekend: Optional[bool] = None
    
    # Session
    session_id: Optional[str] = None
    session_duration: Optional[int] = None
    
    # Data Transfer
    resource_name: Optional[str] = None
    upload_size: Optional[int] = None
    download_size: Optional[int] = None
    data_transferred: Optional[int] = None
    
    # Security
    privilege_level: Optional[str] = None
    failed_login_count: Optional[int] = None
    anomaly_score: Optional[float] = None
    
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedActivityResponse(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    items: List[ActivityResponse]

class ActivityDetailResponse(ActivityResponse):
    employee: Optional[EmployeeResponse] = None
    department: Optional[DepartmentBase] = None
    role: Optional[RoleBase] = None
    risk_score: Optional[float] = None

class ActivityStatisticsResponse(BaseModel):
    total_activities: int
    today_activities: int
    failed_logins: int
    successful_logins: int
    usb_events: int
    policy_violations: int
    suspicious_activities: int
    critical_alerts: int
    grouped_by_type: List[Dict[str, Any]]
