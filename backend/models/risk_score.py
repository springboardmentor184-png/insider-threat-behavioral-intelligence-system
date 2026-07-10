from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from database import Base
from datetime import datetime


class RiskScore(Base):

    __tablename__ = "risk_scores"

    risk_id = Column(Integer, primary_key=True, autoincrement=True)

    employee_id = Column(
        Integer,
        ForeignKey("employee_profiles.employee_id"),
        nullable=False
    )

    risk_score = Column(Float, default=0)

    last_updated = Column(DateTime, default=datetime.utcnow)