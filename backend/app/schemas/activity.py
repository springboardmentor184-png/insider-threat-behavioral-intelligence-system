from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.activity import ActivityType, Severity
from app.schemas.employee import EmployeeResponse, DepartmentBase, RoleBase

class ActivityResponse(BaseModel):
    id: UUID
    employee_id: UUID
    activity_type: ActivityType
    device_name: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    severity: Severity
    timestamp: datetime
    device_id: Optional[str] = None
    browser: Optional[str] = None
    operating_system: Optional[str] = None
    session_id: Optional[str] = None
    resource_name: Optional[str] = None
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
