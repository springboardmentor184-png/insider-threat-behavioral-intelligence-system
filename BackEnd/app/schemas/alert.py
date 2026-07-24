from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertCreate(BaseModel):
    employee_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    severity: str = "Medium"
    risk_score: float = 0
    alert_type: Optional[str] = None


class AlertUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None


class AlertResponse(BaseModel):
    id: int
    employee_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    risk_score: float
    alert_type: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True