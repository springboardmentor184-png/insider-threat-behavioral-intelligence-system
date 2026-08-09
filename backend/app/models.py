from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.sql import func
from datetime import datetime

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)
    department = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        unique=True
    )

    employee_id = Column(String(50), unique=True, nullable=False)
    designation = Column(String(100))
    department = Column(String(100))
    manager = Column(String(100))
    device_info = Column(String(255))
    access_privileges = Column(String(255))
    phone = Column(String(20))
    address = Column(String(255))
    risk_score = Column(Float, default=0)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), nullable=False, index=True)
    risk_score_at_creation = Column(Float, nullable=False)
    risk_category = Column(String(30), nullable=False)
    status = Column(String(50), default="Open")
    assigned_analyst = Column(String(150), nullable=True)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    employee = Column(String(150))
    severity = Column(String(30))
    description = Column(String(255))
    status = Column(String(50))
    assigned_analyst = Column(String(150), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(String(255), nullable=True)
    incident_id = Column(
        Integer,
        ForeignKey("incidents.id"),
        nullable=True
    )


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    employee = Column(String(150))
    activity = Column(String(255))
    device = Column(String(100))
    ip_address = Column(String(100))
    timestamp = Column(DateTime, default=datetime.utcnow)


class RiskScoreHistory(Base):
    __tablename__ = "risk_score_history"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)
    risk_category = Column(String(30), nullable=False)
    department = Column(String(100))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    notification_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(String(500), nullable=False)
    severity = Column(String(30), default="Informational")
    related_employee_id = Column(String(50), nullable=True)
    related_alert_id = Column(Integer, nullable=True)
    related_incident_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PsychometricProfile(Base):
    __tablename__ = "psychometric_profiles"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    employee_name = Column(String(150), nullable=True)

    openness = Column(Float, nullable=True)
    conscientiousness = Column(Float, nullable=True)
    extraversion = Column(Float, nullable=True)
    agreeableness = Column(Float, nullable=True)
    neuroticism = Column(Float, nullable=True)