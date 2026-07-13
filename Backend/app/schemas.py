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