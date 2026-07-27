from datetime import datetime
from pydantic import BaseModel


class RiskScoreResponse(BaseModel):
    id: int
    source_user_id: str
    risk_score: float
    risk_category: str
    total_events: int
    unique_days_active: int
    avg_login_hour: float
    std_login_hour: float
    computed_at: datetime

    class Config:
        from_attributes = True


class ComputeResponse(BaseModel):
    message: str
    users_processed: int
    category_counts: dict