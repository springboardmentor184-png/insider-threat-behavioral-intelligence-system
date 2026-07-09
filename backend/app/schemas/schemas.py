from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import re

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    refresh_token: str
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
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: EmailStr
    profile_picture: Optional[str] = None
    auth_provider: str = "local"

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    username: Optional[str] = None
    password: str
    confirm_password: str
    role_name: str = "Security Analyst"

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z\s]+$", v):
            raise ValueError("Full Name can only contain letters and spaces")
        return v

    @field_validator('email')
    @classmethod
    def clean_email(cls, v: EmailStr) -> EmailStr:
        return v.strip().lower()

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        v = v.strip()
        if len(v) < 3 or len(v) > 30:
            raise ValueError("Username must be between 3 and 30 characters")
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8 or len(v) > 64:
            raise ValueError("Password must be between 8 and 64 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;':\",./<>?`~" for c in v):
            raise ValueError("Password must contain at least one special character")
        if " " in v:
            raise ValueError("Password cannot contain spaces")
        
        weak_passwords = ["password", "password123", "12345678", "qwerty", "admin", "welcome", "letmein"]
        if v.lower() in weak_passwords:
            raise ValueError("Password is too weak or common")
        return v

    @model_validator(mode='after')
    def verify_passwords_match(self) -> 'UserCreate':
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

class UserResponse(UserBase):
    id: int
    role: RoleResponse
    is_active: bool
    email_verified: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    password: str
    confirm_password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8 or len(v) > 64:
            raise ValueError("Password must be between 8 and 64 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;':\",./<>?`~" for c in v):
            raise ValueError("Password must contain at least one special character")
        if " " in v:
            raise ValueError("Password cannot contain spaces")
        return v

    @model_validator(mode='after')
    def verify_passwords_match(self) -> 'ResetPasswordRequest':
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    profile_picture: Optional[str] = None

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not re.match(r"^[a-zA-Z\s]+$", v):
            raise ValueError("Full Name can only contain letters and spaces")
        return v

    @field_validator('username')
    @classmethod
    def validate_username(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        v = v.strip()
        if len(v) < 3 or len(v) > 30:
            raise ValueError("Username must be between 3 and 30 characters")
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v

class TokenRefreshRequest(BaseModel):
    refresh_token: str

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

