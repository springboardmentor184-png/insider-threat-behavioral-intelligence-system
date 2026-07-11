from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class EmployeeBase(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    department_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    job_title: Optional[str] = None
    manager_name: Optional[str] = None
    status: str = "Active"

class EmployeeCreate(EmployeeBase):
    password: str = Field(..., min_length=8)

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    job_title: Optional[str] = None
    manager_name: Optional[str] = None
    status: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: UUID
    is_active: bool
    failed_login_attempts: int
    last_password_change: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    date_joined: Optional[datetime] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedEmployeeResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[EmployeeResponse]

class DepartmentBase(BaseModel):
    id: UUID
    department_name: str
    department_code: str
    model_config = ConfigDict(from_attributes=True)

class RoleBase(BaseModel):
    id: UUID
    role_name: str
    model_config = ConfigDict(from_attributes=True)

class EmployeeDetailResponse(EmployeeResponse):
    department: Optional[DepartmentBase] = None
    role: Optional[RoleBase] = None
    risk_score: Optional[float] = None
