from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AlertCreate(BaseModel):
    employee_id: str
    activity_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    severity: str
    category: str
    status: Optional[str] = "Open"
    assigned_to: Optional[str] = None

class AlertUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    employee_id: str
    activity_id: Optional[int]
    title: str
    description: Optional[str]
    severity: str
    status: str
    category: str
    timestamp: datetime
    assigned_to: Optional[str]
    resolution_notes: Optional[str]

    class Config:
        from_attributes = True
