import uuid
import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base
from app.database.types import GUID


class CaseStatus(str, enum.Enum):
    OPEN = "Open"
    ASSIGNED = "Assigned"
    INVESTIGATING = "Investigating"
    ESCALATED = "Escalated"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class CaseSeverity(str, enum.Enum):
    INFORMATIONAL = "Informational"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class CasePriority(str, enum.Enum):
    P1 = "P1 - Immediate"
    P2 = "P2 - High"
    P3 = "P3 - Moderate"
    P4 = "P4 - Routine"


class Investigation(Base):
    """
    Primary Investigation Case Model for SOC Security Operations.
    """
    __tablename__ = "investigations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    case_number = Column(String(50), unique=True, nullable=False, index=True) # e.g. "CAS-2026-001"
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)
    assigned_analyst_id = Column(GUID(), ForeignKey("employees.id"), nullable=True, index=True)

    status = Column(Enum(CaseStatus), nullable=False, default=CaseStatus.OPEN, index=True)
    severity = Column(Enum(CaseSeverity), nullable=False, default=CaseSeverity.MEDIUM, index=True)
    priority = Column(Enum(CasePriority), nullable=False, default=CasePriority.P3)

    root_cause = Column(Text, nullable=True)
    resolution_summary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    employee = relationship("Employee", foreign_keys=[employee_id], lazy="select")
    assigned_analyst = relationship("Employee", foreign_keys=[assigned_analyst_id], lazy="select")
    evidence_items = relationship("InvestigationEvidence", back_populates="investigation", cascade="all, delete-orphan", lazy="select")
    timeline_events = relationship("InvestigationTimeline", back_populates="investigation", cascade="all, delete-orphan", lazy="select")
    notes = relationship("InvestigationNote", back_populates="investigation", cascade="all, delete-orphan", lazy="select")
    audit_logs = relationship("InvestigationAudit", back_populates="investigation", cascade="all, delete-orphan", lazy="select")


class InvestigationEvidence(Base):
    """
    Evidence collected for an investigation referencing telemetry sources without data duplication.
    """
    __tablename__ = "investigation_evidence"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    investigation_id = Column(GUID(), ForeignKey("investigations.id"), nullable=False, index=True)

    evidence_type = Column(String(100), nullable=False) # e.g. "Activity Log", "Behavior Deviation", "Threat Alert"
    source_module = Column(String(100), nullable=False) # "Activity Monitoring", "Threat Detection", "Risk Engine", "UEBA", "Entity Analytics"
    severity = Column(Enum(CaseSeverity), nullable=False, default=CaseSeverity.LOW)
    
    description = Column(Text, nullable=False)
    linked_employee_id = Column(GUID(), nullable=True)
    linked_entity_name = Column(String(150), nullable=True)
    evidence_data = Column(JSON, nullable=True) # Metadata / original record IDs

    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    investigation = relationship("Investigation", back_populates="evidence_items")


class InvestigationTimeline(Base):
    """
    Unified Chronological Timeline feed aggregating events from all 5 source modules.
    """
    __tablename__ = "investigation_timelines"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    investigation_id = Column(GUID(), ForeignKey("investigations.id"), nullable=False, index=True)

    event_timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    event_type = Column(String(100), nullable=False) # e.g. "Login", "USB Connected", "File Download", "Risk Increased"
    source_module = Column(String(100), nullable=False)
    severity = Column(Enum(CaseSeverity), nullable=False, default=CaseSeverity.LOW)
    
    description = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    investigation = relationship("Investigation", back_populates="timeline_events")


class InvestigationNote(Base):
    """
    Collaborative analyst notes and investigation updates.
    """
    __tablename__ = "investigation_notes"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    investigation_id = Column(GUID(), ForeignKey("investigations.id"), nullable=False, index=True)

    author_id = Column(GUID(), ForeignKey("employees.id"), nullable=True)
    author_name = Column(String(150), nullable=False, default="SOC Analyst")
    comment = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    investigation = relationship("Investigation", back_populates="notes")


class InvestigationAudit(Base):
    """
    Audit log of case status updates, analyst assignments, and severity changes.
    """
    __tablename__ = "investigation_audits"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    investigation_id = Column(GUID(), ForeignKey("investigations.id"), nullable=False, index=True)

    action = Column(String(100), nullable=False) # "Status Change", "Analyst Assignment", "Severity Change"
    performed_by = Column(String(150), nullable=False, default="System")
    details = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    investigation = relationship("Investigation", back_populates="audit_logs")
