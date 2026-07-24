from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LoginActivityResponse(BaseModel):
    id: int
    employee_id: Optional[int] = None
    username: Optional[str] = None
    pc: Optional[str] = None
    activity: Optional[str] = None
    login_time: datetime
    ip_address: Optional[str] = None
    location: Optional[str] = None
    success: bool
    is_anomaly: bool
    anomaly_score: float

    class Config:
        from_attributes = True


class FileAccessResponse(BaseModel):
    id: int
    employee_id: Optional[int] = None
    username: Optional[str] = None
    pc: Optional[str] = None
    filename: Optional[str] = None
    content: Optional[str] = None
    access_time: datetime
    action: str
    is_anomaly: bool
    anomaly_score: float

    class Config:
        from_attributes = True