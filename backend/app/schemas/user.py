from enum import Enum

from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    security_analyst = "Security Analyst"
    soc_engineer = "SOC Engineer"
    security_manager = "Security Manager"
    administrator = "Administrator"


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str