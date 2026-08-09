from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    ForeignKey
)
from datetime import datetime

from app.database import Base


# ==========================
# EMPLOYEE MODEL
# ==========================
class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(String, unique=True, nullable=False)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)

    department = Column(String, nullable=False)

    role = Column(String, nullable=False)

    # This will be automatically updated by the
    # Threat Detection Engine in Milestone 2
    risk_score = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)


# ==========================
# USER MODEL
# ==========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False, index=True)

    password = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)


# ==========================
# BEHAVIOR LOG MODEL
# ==========================
class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(Integer, primary_key=True, index=True)

    # Employee Reference
    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    # Behavioral Analytics Parameters
    failed_logins = Column(Integer, default=0)

    usb_used = Column(Boolean, default=False)

    after_hours_login = Column(Boolean, default=False)

    files_downloaded = Column(Integer, default=0)

    emails_sent = Column(Integer, default=0)

    login_hour = Column(Integer, default=9)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
    # ==========================
# BEHAVIOR BASELINE MODEL
# ==========================
class BehaviorBaseline(Base):
    __tablename__ = "behavior_baselines"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        unique=True,
        nullable=False
    )

    avg_failed_logins = Column(Integer, default=0)

    avg_files_downloaded = Column(Integer, default=0)

    avg_emails_sent = Column(Integer, default=0)

    avg_login_hour = Column(Integer, default=9)

    usb_usage_rate = Column(Integer, default=0)

    after_hours_rate = Column(Integer, default=0)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # ==========================
# THREAT INVESTIGATION MODEL
# ==========================
class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    incident_title = Column(String, nullable=False)

    threat_severity = Column(String, nullable=False)

    status = Column(
        String,
        default="Open"
    )

    assigned_analyst = Column(
        String,
        default="Unassigned"
    )

    investigation_notes = Column(
        String,
        default=""
    )

    recommendation = Column(
        String,
        default=""
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

# ==========================
# THREAT ALERT MODEL
# ==========================
class ThreatAlert(Base):
    __tablename__ = "threat_alerts"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    alert_title = Column(String, nullable=False)

    severity = Column(String, nullable=False)

    status = Column(
        String,
        default="Open"
    )

    escalation_level = Column(
        Integer,
        default=1
    )

    assigned_analyst = Column(
        String,
        default="Unassigned"
    )

    resolution_notes = Column(
        String,
        default=""
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    resolved_at = Column(
        DateTime,
        nullable=True
    )

# ==========================================
# NOTIFICATION MODEL
# ==========================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )

    notification_type = Column(
        String,
        nullable=False
    )

    title = Column(
        String,
        nullable=False
    )

    message = Column(
        String,
        nullable=False
    )

    severity = Column(
        String,
        default="Informational"
    )

    is_read = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )