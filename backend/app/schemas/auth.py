import re
from pydantic import BaseModel, EmailStr, validator, ConfigDict
from typing import Optional
from uuid import UUID

class RegisterRequest(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    department_id: Optional[UUID] = None
    role_id: Optional[UUID] = None

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one number")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenPayload(BaseModel):
    sub: str
    exp: int

class EmployeeDetails(BaseModel):
    id: UUID
    employee_id: str
    first_name: str
    last_name: str
    email: str
    department_id: Optional[UUID] = None
    role_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    employee: EmployeeDetails

class CurrentUser(EmployeeDetails):
    is_active: bool
    status: str
