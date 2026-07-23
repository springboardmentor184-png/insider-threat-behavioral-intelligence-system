import re
from pydantic import BaseModel, field_validator, ConfigDict, Field
from typing import Optional
from uuid import UUID

class RegisterRequest(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    email: str = Field(..., json_schema_extra={"example": "user@example.com"})
    password: str
    department_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    department: Optional[str] = None
    role: Optional[str] = None

    @field_validator("email", mode="after")
    @classmethod
    def validate_email(cls, v):
        # Allow both standard emails and .local domains for dev
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$'
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("password")
    @classmethod
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
    email: str = Field(..., json_schema_extra={"example": "user@example.com"})
    password: str

    @field_validator("email", mode="after")
    @classmethod
    def validate_email(cls, v):
        # Allow both standard emails and .local domains for dev
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+$'
        if not re.match(pattern, v):
            raise ValueError("Invalid email format")
        return v

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
