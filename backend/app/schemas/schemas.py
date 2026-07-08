from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# --- Role Schemas ---
class RoleBase(BaseModel):
    name: str
    description: str

class RoleResponse(RoleBase):
    id: int
    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role_name: str  # Role name: Administrator, Security Manager, SOC Engineer, Security Analyst

class UserResponse(UserBase):
    id: int
    role: RoleResponse
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

# --- Department Schemas ---
class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentResponse(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

# --- Device Schemas ---
class DeviceBase(BaseModel):
    device_id: str
    device_name: str
    device_type: str
    ip_address: Optional[str] = None
    mac_address: Optional[str] = None
    status: str = "Active"

class DeviceCreate(DeviceBase):
    pass

class DeviceResponse(DeviceBase):
    id: int
    employee_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Employee Schemas ---
class EmployeeBase(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    department_id: int
    designation: str
    manager_id: Optional[int] = None
    access_privileges: str  # Comma-separated list

class EmployeeCreate(EmployeeBase):
    devices: Optional[List[DeviceCreate]] = []

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    manager_id: Optional[int] = None
    access_privileges: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeBriefResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    email: EmailStr
    class Config:
        from_attributes = True

class EmployeeResponse(EmployeeBase):
    id: int
    is_active: bool
    created_at: datetime
    department: DepartmentResponse
    manager: Optional[EmployeeBriefResponse] = None
    devices: List[DeviceResponse] = []

    class Config:
        from_attributes = True

# --- Activity Log Schemas ---
class ActivityLogBase(BaseModel):
    event_type: str  # Login, File Access, File Upload, File Download, USB Usage, Network Activity, Email Activity
    severity: str    # Low, Medium, High, Critical
    details: Dict[str, Any]

class ActivityLogCreate(ActivityLogBase):
    employee_id: int
    device_id: Optional[int] = None

class ActivityLogResponse(ActivityLogBase):
    id: int
    employee_id: Optional[int] = None
    device_id: Optional[int] = None
    timestamp: datetime
    employee: Optional[EmployeeBriefResponse] = None
    device: Optional[DeviceResponse] = None

    class Config:
        from_attributes = True

class GoogleLoginRequest(BaseModel):
    credential: str

