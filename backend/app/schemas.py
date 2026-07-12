from pydantic import BaseModel, EmailStr
from typing import Optional

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
    department: str

    class Config:
        from_attributes = True


class AlertResponse(BaseModel):
    id: int
    employee: str
    severity: str
    description: str
    status: str

    class Config:
        from_attributes = True
        
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
    employee_id: str
    designation: str
    department: Optional[str] = None
    manager: Optional[str] = None
    device_info: Optional[str] = None
    access_privileges:Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    class Config:
        from_attributes = True


class ProfileOut(BaseModel):

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