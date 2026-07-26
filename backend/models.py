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


class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    designation = Column(String, nullable=True)
    department = Column(String, nullable=True)
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