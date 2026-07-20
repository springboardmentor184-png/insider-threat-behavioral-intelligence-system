from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "security_analyst"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class EmployeeCreate(BaseModel):
    user_id: int
    employee_code: str
    department: str
    designation: str
    manager_name: str | None = None
    device_info: str | None = None
    access_privileges: str | None = None


class EmployeeUpdate(BaseModel):
    department: str | None = None
    designation: str | None = None
    manager_name: str | None = None
    device_info: str | None = None
    access_privileges: str | None = None


class EmployeeOut(BaseModel):
    id: int
    user_id: int
    employee_code: str
    department: str
    designation: str
    manager_name: str | None
    device_info: str | None
    access_privileges: str | None
    created_at: datetime

    class Config:
        from_attributes = True