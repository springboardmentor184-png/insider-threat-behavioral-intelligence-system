from pydantic import BaseModel, EmailStr


class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    designation: str
    manager: str | None = None


class EmployeeUpdate(BaseModel):
    full_name: str
    department: str
    designation: str
    manager: str | None = None
    risk_score: int
    is_active: bool


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    designation: str
    manager: str | None = None
    risk_score: int
    is_active: bool

    class Config:
        from_attributes = True