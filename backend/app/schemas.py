from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# =========================================================
# USER SCHEMAS
# =========================================================

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str
    department: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    department: Optional[str] = None

    class Config:
        from_attributes = True


# =========================================================
# ALERT SCHEMAS
# =========================================================

class AlertResponse(BaseModel):
    id: int
    employee: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

    class Config:
        from_attributes = True


# =========================================================
# PROFILE SCHEMAS
# =========================================================

class ProfileCreate(BaseModel):
    employee_id: str
    designation: str
    department: Optional[str] = None
    manager: Optional[str] = None
    device_info: Optional[str] = None
    access_privileges: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    employee_id: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    manager: Optional[str] = None
    device_info: Optional[str] = None
    access_privileges: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileOut(BaseModel):
    employee_id: str
    designation: Optional[str] = None
    department: Optional[str] = None
    manager: Optional[str] = None
    device_info: Optional[str] = None
    access_privileges: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True


# =========================================================
# ACTIVITY LOG SCHEMAS
# =========================================================

class ActivityLogBase(BaseModel):
    employee: str
    activity: str
    device: str
    ip_address: Optional[str] = None


class ActivityCreate(ActivityLogBase):
    pass


class ActivityLogOut(ActivityLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


# =========================================================
# RISK SCORE SCHEMAS
# =========================================================

class RiskScoreOut(BaseModel):
    employee_id: str
    risk_score: float
    risk_category: str

    class Config:
        from_attributes = True


class RiskDistributionOut(BaseModel):
    category: str
    count: int

class PsychometricOut(BaseModel):
    employee_id: str
    employee_name: Optional[str] = None
    openness: Optional[float] = None
    conscientiousness: Optional[float] = None
    extraversion: Optional[float] = None
    agreeableness: Optional[float] = None
    neuroticism: Optional[float] = None

    class Config:
        from_attributes = True