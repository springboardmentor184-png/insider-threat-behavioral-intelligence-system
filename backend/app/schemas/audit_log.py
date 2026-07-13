from datetime import datetime
from pydantic import BaseModel


class AuditLogResponse(BaseModel):

    id: int
    user_id: int | None
    action: str
    status: str
    description: str | None
    timestamp: datetime

    class Config:
        from_attributes = True