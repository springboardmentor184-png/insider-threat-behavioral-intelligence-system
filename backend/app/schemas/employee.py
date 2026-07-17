from pydantic import BaseModel


class EmployeeProfileCreate(BaseModel):
    employee_id: str
    department_id: int
    designation: str
    manager: str
    device_information: str
    access_privileges: str

class EmployeeProfileUpdate(BaseModel):
    department_id: int
    designation: str
    manager: str
    device_information: str
    access_privileges: str

class EmployeeProfileResponse(BaseModel):
    id: int
    employee_id: str
    department_id: int
    designation: str
    manager: str
    device_information: str
    access_privileges: str

    class Config:
        from_attributes = True