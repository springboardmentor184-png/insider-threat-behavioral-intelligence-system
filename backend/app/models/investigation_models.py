# backend/app/models/investigation_models.py

from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.dialects.mysql import ENUM
from ..core.database import Base
import uuid

class Investigation(Base):
    __tablename__ = "investigations"

    investigation_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String(36), ForeignKey("employees.employee_id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(ENUM("Open", "In Progress", "Under Review", "Closed", "False Positive"), default="Open")
    priority = Column(ENUM("Low", "Medium", "High", "Critical"), default="Medium")
    assigned_to = Column(String(50), nullable=True)
    created_by = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)
    risk_score_at_creation = Column(String(10), nullable=True)
    
    def to_dict(self):
        return {
            "investigation_id": self.investigation_id,
            "employee_id": self.employee_id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "assigned_to": self.assigned_to,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
            "risk_score_at_creation": self.risk_score_at_creation
        }


class InvestigationNote(Base):
    __tablename__ = "investigation_notes"

    note_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.investigation_id"), nullable=False)
    content = Column(Text, nullable=False)
    created_by = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self):
        return {
            "note_id": self.note_id,
            "investigation_id": self.investigation_id,
            "content": self.content,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class InvestigationEvidence(Base):
    __tablename__ = "investigation_evidence"

    evidence_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(String(36), ForeignKey("investigations.investigation_id"), nullable=False)
    evidence_type = Column(Enum("Activity", "Anomaly", "Risk Factor", "Pattern", "Other"), default="Activity")
    evidence_reference = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    added_by = Column(String(50), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())