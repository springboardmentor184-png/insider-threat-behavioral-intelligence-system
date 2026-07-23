import uuid
import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Float, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base
from app.database.types import GUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class RiskLevel(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class RiskAssessment(Base):
    """
    Risk assessment model representing AI-calculated anomalies and scores.
    Designed for integration with future machine learning classification pipelines.
    """
    __tablename__ = "risk_assessments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)
    
    risk_score = Column(Float, nullable=False, default=0.0, index=True)
    risk_level = Column(Enum(RiskLevel), nullable=False, default=RiskLevel.LOW)
    anomaly_detected = Column(Boolean, nullable=False, default=False)
    recommendation = Column(Text, nullable=True)
    last_analyzed = Column(DateTime(timezone=True), nullable=True)
    
    # AI Support Fields
    risk_reason = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", back_populates="risk_assessments", lazy="select")
