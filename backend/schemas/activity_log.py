"""
Pydantic schemas for activity log entries.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ActivityLogCreate(BaseModel):
    user_id: int
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None


class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
