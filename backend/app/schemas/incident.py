from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str
    employee_id: str
    assigned_to: Optional[str] = None
    timeline: Optional[str] = "[]"
    evidence: Optional[str] = "[]"

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    timeline: Optional[str] = None
    evidence: Optional[str] = None

class IncidentResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    severity: str
    status: str
    employee_id: str
    assigned_to: Optional[str]
    timeline: Optional[str]
    evidence: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
