"""
Pydantic schemas for user registration, login, profile, and token responses.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from backend.models.enums import UserRole


# --- Auth Schemas ---

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: UserRole = UserRole.SECURITY_ANALYST


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Profile Schemas ---

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    manager: Optional[str] = None
    profile_image: Optional[str] = None


class RoleUpdate(BaseModel):
    role: UserRole


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    role: UserRole
    department: Optional[str] = None
    designation: Optional[str] = None
    manager: Optional[str] = None
    profile_image: Optional[str] = None
    is_active: bool
    is_mfa_enabled: bool
    approval_status: str
    oauth_provider: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
