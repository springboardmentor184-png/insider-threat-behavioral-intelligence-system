from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ThreatAssessmentResponse(BaseModel):
    employee_id: UUID
    threat_score: float
    threat_level: str
    confidence_score: float | None = None
    explanation: str | None = None
    recommendation: str | None = None
    last_analyzed: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ThreatHistoryResponse(ThreatAssessmentResponse):
    pass


class HighRiskEmployeeResponse(BaseModel):
    employee_id: UUID
    employee_name: str
    threat_score: float
    threat_level: str
    last_analyzed: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
