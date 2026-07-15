from pydantic import BaseModel, EmailStr


class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    role: str
    risk_score: int = 0


class EmployeeResponse(EmployeeCreate):
    id: int

    class Config:
        from_attributes = True

# ==========================
# USER SCHEMAS
# ==========================

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr

    class Config:
        from_attributes = True
# ==========================
# LOGIN RESPONSE
# ==========================

class Token(BaseModel):
    access_token: str
    token_type: str