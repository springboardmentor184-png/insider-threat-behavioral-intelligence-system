from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str  # security_analyst, soc_engineer, security_manager, administrator


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


class EmployeeProfileCreate(BaseModel):
    employee_id: str
    department: Optional[str] = None
    designation: Optional[str] = None
    manager: Optional[str] = None
    device_info: Optional[str] = None
    access_privileges: Optional[str] = None


class EmployeeProfileUpdate(BaseModel):
    department: Optional[str] = None
    designation: Optional[str] = None
    manager: Optional[str] = None
    device_info: Optional[str] = None
    access_privileges: Optional[str] = None


class EmployeeProfileOut(BaseModel):
    id: int
    employee_id: str
    department: Optional[str] = None
    designation: Optional[str] = None
    manager: Optional[str] = None
    device_info: Optional[str] = None
    access_privileges: Optional[str] = None

    class Config:
        from_attributes = True

class ActivityLogCreate(BaseModel):
    employee_id: str
    event_type: str  # 'login', 'file_access', 'app_usage'
    event_detail: Optional[str] = None
    ip_address: Optional[str] = None
    device: Optional[str] = None


class ActivityLogOut(BaseModel):
    id: int
    employee_id: str
    event_type: str
    event_detail: Optional[str] = None
    ip_address: Optional[str] = None
    device: Optional[str] = None

    class Config:
        from_attributes = True