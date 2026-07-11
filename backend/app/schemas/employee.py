from pydantic import BaseModel, EmailStr


class EmployeeCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str = "employee"

class EmployeeResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True