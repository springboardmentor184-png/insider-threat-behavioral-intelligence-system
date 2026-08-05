import uuid
import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base
from app.database.types import GUID


class AlertStatus(str, enum.Enum):
    ACTIVE = "Active"
    TRIAGED = "Triaged"
    RESOLVED = "Resolved"
    SUPPRESSED = "Suppressed"


class IncidentStatus(str, enum.Enum):
    NEW = "New"
    IN_PROGRESS = "In Progress"
    CONTAINED = "Contained"
    MITIGATED = "Mitigated"
    CLOSED = "Closed"


class IncidentSeverity(str, enum.Enum):
    INFORMATIONAL = "Informational"
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class SOARActionType(str, enum.Enum):
    SUSPEND_ACCOUNT = "SUSPEND_USER_ACCOUNT"
    REVOKE_SESSIONS = "REVOKE_ACTIVE_SESSIONS"
    ISOLATE_ENTITY = "ISOLATE_ENTITY"
    REVOKE_USB = "REVOKE_USB_ACCESS"
    NOTIFY_SOC = "NOTIFY_SOC_LEAD"


class Alert(Base):
    """
    Security Alert triggered from Activity Monitoring, Threat Engine, Risk Engine, or UEBA.
    """
    __tablename__ = "alerts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    alert_name = Column(String(255), nullable=False)
    alert_type = Column(String(100), nullable=False)
    severity = Column(Enum(IncidentSeverity), nullable=False, default=IncidentSeverity.MEDIUM, index=True)
    source_module = Column(String(100), nullable=False) # Activity, Threat, Risk, UEBA, Entity
    
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=True, index=True)
    entity_name = Column(String(150), nullable=True)
    
    status = Column(Enum(AlertStatus), nullable=False, default=AlertStatus.ACTIVE, index=True)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    employee = relationship("Employee", lazy="select")


class Incident(Base):
    """
    Aggregated Security Incident consolidating multiple triggered alerts.
    """
    __tablename__ = "incidents"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    incident_number = Column(String(50), unique=True, nullable=False, index=True) # e.g. INC-2026-001
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    severity = Column(Enum(IncidentSeverity), nullable=False, default=IncidentSeverity.HIGH, index=True)
    status = Column(Enum(IncidentStatus), nullable=False, default=IncidentStatus.NEW, index=True)
    assigned_team = Column(String(100), nullable=False, default="SOC Level-2 Response")

    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    employee = relationship("Employee", lazy="select")
    execution_logs = relationship("PlaybookExecutionLog", back_populates="incident", cascade="all, delete-orphan", lazy="select")


class SOARPlaybook(Base):
    """
    Security Orchestration, Automation, and Response (SOAR) Playbook.
    """
    __tablename__ = "soar_playbooks"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    playbook_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    trigger_condition = Column(String(255), nullable=False) # e.g. "Risk Score > 80", "Critical Outlier"
    action_type = Column(Enum(SOARActionType), nullable=False)
    
    is_automated = Column(Boolean, default=True)
    execution_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PlaybookExecutionLog(Base):
    """
    Audit log of executed automated SOAR response containment actions.
    """
    __tablename__ = "playbook_execution_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    playbook_id = Column(GUID(), ForeignKey("soar_playbooks.id"), nullable=True)
    incident_id = Column(GUID(), ForeignKey("incidents.id"), nullable=True, index=True)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=True, index=True)

    action_type = Column(Enum(SOARActionType), nullable=False)
    status = Column(String(50), nullable=False, default="SUCCESS") # SUCCESS, FAILED, PENDING
    result_details = Column(Text, nullable=False)

    executed_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    incident = relationship("Incident", back_populates="execution_logs")
    employee = relationship("Employee", lazy="select")
    playbook = relationship("SOARPlaybook", lazy="select")
