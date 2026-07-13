from datetime import datetime

from pydantic import BaseModel


class ActivityCreate(BaseModel):

    activity_name: str
    performed_by: str
    status: str
    description: str


class ActivityResponse(BaseModel):

    id: int
    activity_name: str
    performed_by: str
    status: str
    description: str
    timestamp: datetime

    class Config:
        from_attributes = True