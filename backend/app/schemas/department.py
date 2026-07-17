from pydantic import BaseModel


class DepartmentCreate(BaseModel):
    name: str
    description: str


class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        from_attributes = True