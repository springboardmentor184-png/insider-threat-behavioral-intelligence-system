from pydantic import BaseModel
from datetime import datetime


class ActivityCreate(BaseModel):
    employee_id: int
    activity_type: str
    ip_address: str
    device: str


class ActivityResponse(BaseModel):
    id: int
    employee_id: int
    activity_type: str
    ip_address: str
    device: str
    timestamp: datetime

    class Config:
        from_attributes = True