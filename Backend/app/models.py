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