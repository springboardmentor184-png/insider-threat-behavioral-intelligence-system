from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class InvestigationCreate(BaseModel):
    employee_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    priority: str = "Medium"
    assigned_to: Optional[str] = None


class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    evidence: Optional[str] = None


class InvestigationResponse(BaseModel):
    id: int
    employee_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    assigned_to: Optional[str] = None
    evidence: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True