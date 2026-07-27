from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from app.database import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    source_user_id = Column(String, nullable=False, index=True, unique=True)

    risk_score = Column(Float, nullable=False)
    risk_category = Column(String, nullable=False)

    total_events = Column(Integer)
    unique_days_active = Column(Integer)
    avg_login_hour = Column(Float)
    std_login_hour = Column(Float)

    computed_at = Column(DateTime, default=datetime.utcnow)