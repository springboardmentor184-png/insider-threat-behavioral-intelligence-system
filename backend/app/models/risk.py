import uuid
import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base
from app.database.types import GUID


class RiskLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class RiskAssessment(Base):
    """
    Enterprise Risk Assessment Model.
    Stores historical risk scores, weighted component scores, and Explainable AI (XAI) breakdown.
    Designed for continuous recalculation without overwriting historical trend entries.
    """
    __tablename__ = "risk_assessments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)

    # Core Calculated Scores (0.0 - 100.0)
    risk_score = Column(Float, nullable=False, default=0.0, index=True)
    risk_level = Column(Enum(RiskLevel), nullable=False, default=RiskLevel.LOW, index=True)

    # Weighted Sub-Scores (Enterprise XAI Components)
    anomaly_score = Column(Float, nullable=False, default=0.0)        # 35% weight: Behavioral Anomalies
    privilege_score = Column(Float, nullable=False, default=0.0)      # 25% weight: Privilege Misuse
    data_access_score = Column(Float, nullable=False, default=0.0)    # 20% weight: Data Access Violations
    access_pattern_score = Column(Float, nullable=False, default=0.0) # 10% weight: Access Pattern Deviations
    history_score = Column(Float, nullable=False, default=0.0)       # 10% weight: Historical Security Events

    # Explainable AI (XAI) & Auditability
    confidence_score = Column(Float, nullable=False, default=0.95)   # Confidence rating (0.0 - 1.0)
    reasons = Column(JSON, nullable=True)                              # Structured list of triggering reasons
    triggering_events = Column(JSON, nullable=True)                    # List of referenced log/event IDs
    recommendation = Column(Text, nullable=True)                       # Actionable AI recommendations
    risk_trend = Column(String(20), nullable=False, default="STABLE")  # Trend direction: UP, DOWN, STABLE

    # Legacy & Auxiliary Fields
    anomaly_detected = Column(Boolean, nullable=False, default=False)
    risk_reason = Column(Text, nullable=True)
    last_analyzed = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", back_populates="risk_assessments", lazy="select")
