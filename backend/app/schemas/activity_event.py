from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel


class ActivityEventCreate(BaseModel):
    employee_id: int
    event_type: str
    timestamp: datetime
    source: str = "live"
    details: Optional[Dict[str, Any]] = None


class ActivityEventResponse(BaseModel):
    id: int
    source_user_id: str
    employee_id: Optional[int]
    event_type: str
    timestamp: datetime
    source: str
    details: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class BulkIngestResponse(BaseModel):
    message: str
    inserted: int
    skipped: int
    errors: List[str] = []