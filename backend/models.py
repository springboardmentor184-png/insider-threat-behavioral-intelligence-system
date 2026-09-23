from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class UserRole(str, enum.Enum):
    SECURITY_ANALYST = "security_analyst"
    SOC_ENGINEER = "soc_engineer"
    SECURITY_MANAGER = "security_manager"
    ADMINISTRATOR = "administrator"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default=UserRole.SECURITY_ANALYST.value, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PasswordResetToken(Base):
    """One-time, short-lived password reset token. Only its digest is persisted."""
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="password_reset_tokens")


class NotificationRead(Base):
    """Per-user read state for notification items derived from live security data."""
    __tablename__ = "notification_reads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    notification_key = Column(String, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="notification_reads")


class EmployeeProfile(Base):
    """Demo HR context keyed by the CERT activity identifier, not a console login."""
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)
    # Kept nullable for compatibility with the pre-existing optional console-user
    # profile endpoint. Dataset profiles use employee_id, just like activity_logs.
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    employee_id = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    manager = Column(String, nullable=True)
    device_information = Column(String, nullable=True)
    access_privileges = Column(String, nullable=True)
    join_date = Column(Date, nullable=True)
    device_ids = Column(String, nullable=True)

    user = relationship("User", backref="profile")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True, nullable=False)
    event_type = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    pc = Column(String, nullable=True)
    source_file = Column(String, nullable=False)


class ActivitySummary(Base):
    """Daily, privacy-preserving aggregate used by the activity API."""
    __tablename__ = "activity_summaries"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True, nullable=False)
    activity_date = Column(Date, index=True, nullable=False)
    logon_count = Column(Integer, default=0, nullable=False)
    device_connect_count = Column(Integer, default=0, nullable=False)
    after_hours_count = Column(Integer, default=0, nullable=False)
    anomaly_count = Column(Integer, default=0, nullable=False)


class BehavioralBaseline(Base):
    """
    One row per employee - stores their 'normal' behavior pattern.
    Anomaly detection compares live activity against this baseline.
    """
    __tablename__ = "behavioral_baselines"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True, unique=True, nullable=False)

    avg_logon_hour = Column(Float, nullable=True)       # e.g. 9.5 = 9:30 AM average
    std_logon_hour = Column(Float, nullable=True)       # spread of logon times
    avg_daily_logons = Column(Float, nullable=True)
    avg_device_connects = Column(Float, nullable=True)
    std_device_connects = Column(Float, nullable=True)

    total_logon_events = Column(Integer, default=0)
    total_device_events = Column(Integer, default=0)

    computed_at = Column(DateTime(timezone=True), server_default=func.now())


class Anomaly(Base):
    """
    Individual anomaly detected when an activity deviates from the baseline.
    """
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True, nullable=False)

    anomaly_type = Column(String, nullable=False)        # e.g. "unusual_login_time"
    severity = Column(String, default="low", nullable=False)  # low/medium/high/critical
    description = Column(Text, nullable=True)

    detected_value = Column(Float, nullable=True)
    baseline_value = Column(Float, nullable=True)
    deviation_score = Column(Float, nullable=True)       # z-score

    event_timestamp = Column(DateTime, nullable=True)    # when the anomalous activity happened
    detected_at = Column(DateTime(timezone=True), server_default=func.now())

    status = Column(String, default="open", nullable=False)  # open/reviewed/resolved


class ThreatDetection(Base):
    """
    Escalated record created from one or more anomalies - what SOC/Analyst investigates.
    """
    __tablename__ = "threat_detections"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True, nullable=False)
    anomaly_id = Column(Integer, ForeignKey("anomalies.id"), nullable=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    risk_level = Column(String, default="low", nullable=False)  # low/medium/high/critical

    status = Column(String, default="open", nullable=False)     # open/investigating/closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    anomaly = relationship("Anomaly", backref="threats")


class RiskScore(Base):
    """
    Stores computed risk scores for each employee, generated by the
    ML-based risk scoring engine.
    """
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True, nullable=False)

    risk_score = Column(Float, nullable=False)             # 0-100 scale
    risk_level = Column(String, nullable=False)             # low/medium/high/critical
    threat_probability = Column(Float, nullable=False)      # 0.0 - 1.0

    # Weighted component scores (from the spec)
    behavioral_anomaly_score = Column(Float, default=0.0)   # 35% weight
    privilege_misuse_score = Column(Float, default=0.0)      # 25% weight
    data_access_score = Column(Float, default=0.0)           # 20% weight
    access_pattern_score = Column(Float, default=0.0)        # 10% weight
    historical_events_score = Column(Float, default=0.0)     # 10% weight

    computed_at = Column(DateTime(timezone=True), server_default=func.now())


class Alert(Base):
    """
    Security alerts generated automatically when risk thresholds are crossed
    or anomalies are detected.
    """
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True, nullable=False)

    alert_type = Column(String, nullable=False)              # e.g. "high_risk_score", "anomaly_cluster"
    severity = Column(String, default="medium", nullable=False)  # informational/low/medium/high/critical
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    source_anomaly_id = Column(Integer, ForeignKey("anomalies.id"), nullable=True)
    source_risk_score_id = Column(Integer, ForeignKey("risk_scores.id"), nullable=True)

    status = Column(String, default="new", nullable=False)   # new/acknowledged/investigating/resolved/dismissed
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    source_anomaly = relationship("Anomaly", backref="alerts")
    source_risk_score = relationship("RiskScore", backref="alerts")
    assigned_user = relationship("User", backref="assigned_alerts")


class Investigation(Base):
    """Analyst-owned incident state for a flagged employee investigation."""
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, index=True, unique=True, nullable=False)
    status = Column(String, default="Open", nullable=False)  # Open/In Progress/Resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
