from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.risk import RiskLevel

class RiskResponse(BaseModel):
    id: UUID
    employee_id: UUID
    risk_score: float
    risk_level: RiskLevel
    anomaly_detected: bool
    recommendation: Optional[str] = None
    last_analyzed: Optional[datetime] = None
    risk_reason: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
