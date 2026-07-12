from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# ----------------- JWT Token Schemas -----------------
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# ----------------- User Schemas -----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "Security Analyst" # Administrator, Security Analyst, SOC Engineer, Security Manager

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# ----------------- Device Schemas -----------------
class DeviceCreate(BaseModel):
    device_name: str
    ip_address: str
    mac_address: Optional[str] = None
    status: str = "Active"

class DeviceResponse(BaseModel):
    id: int
    employee_id: str
    device_name: str
    ip_address: str
    mac_address: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

# ----------------- Asset Schemas -----------------
class AssetCreate(BaseModel):
    asset_name: str
    asset_type: str
    access_level: str = "Read"

class AssetResponse(BaseModel):
    id: int
    employee_id: str
    asset_name: str
    asset_type: str
    access_level: str
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

# ----------------- Employee Schemas -----------------
class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    department: str
    designation: str
    manager: Optional[str] = None
    access_privileges: Optional[str] = None # Comma-separated access lists
    status: str = "Active"
    user_id: Optional[int] = None

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    manager: Optional[str] = None
    access_privileges: Optional[str] = None
    status: Optional[str] = None

class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    department: str
    designation: str
    manager: Optional[str] = None
    access_privileges: Optional[str] = None
    status: str
    user_id: Optional[int] = None
    created_at: datetime
    devices: List[DeviceResponse] = []
    assets: List[AssetResponse] = []

    class Config:
        from_attributes = True
        orm_mode = True

# ----------------- Audit Log Schemas -----------------
class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    user_email: str
    action: str
    status: str
    ip_address: Optional[str] = None

    class Config:
        from_attributes = True
        orm_mode = True
