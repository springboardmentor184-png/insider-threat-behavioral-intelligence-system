from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


# What the client sends when registering
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "employee"


# What the client sends when logging in
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# What we send back after successful login (never send password back!)
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


# What we send back to represent a user (no password_hash exposed)
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# What the client sends to create/update a profile
class ProfileUpdate(BaseModel):
    designation: Optional[str] = None
    department: Optional[str] = None
    join_date: Optional[date] = None
    device_ids: Optional[str] = None


# What we send back to represent a profile
class ProfileOut(BaseModel):
    id: int
    user_id: int
    designation: Optional[str] = None
    department: Optional[str] = None
    join_date: Optional[date] = None
    device_ids: Optional[str] = None

    class Config:
        from_attributes = True 