"""
SQLAlchemy database models for the CERT Insider Threat Dataset.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    employee_id = Column(String(50), primary_key=True, index=True)  # user_id in LDAP (e.g. CEL0561)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    role = Column(String(150), nullable=True)
    department = Column(String(150), nullable=True)
    designation = Column(String(150), nullable=True)
    manager = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    risk_score = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    logons = relationship("LogonEvent", back_populates="employee", cascade="all, delete-orphan")
    devices = relationship("DeviceEvent", back_populates="employee", cascade="all, delete-orphan")
    files = relationship("FileEvent", back_populates="employee", cascade="all, delete-orphan")
    emails = relationship("EmailEvent", back_populates="employee", cascade="all, delete-orphan")
    http_logs = relationship("HttpEvent", back_populates="employee", cascade="all, delete-orphan")


class LogonEvent(Base):
    __tablename__ = "logon_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(100), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    employee_id = Column(String(50), ForeignKey("employees.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    pc = Column(String(50), nullable=False)
    activity = Column(String(50), nullable=False, index=True)  # Logon, Logoff

    employee = relationship("Employee", back_populates="logons")


class DeviceEvent(Base):
    __tablename__ = "device_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(100), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    employee_id = Column(String(50), ForeignKey("employees.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    pc = Column(String(50), nullable=False)
    activity = Column(String(50), nullable=False, index=True)  # Connect, Disconnect

    employee = relationship("Employee", back_populates="devices")


class FileEvent(Base):
    __tablename__ = "file_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(100), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    employee_id = Column(String(50), ForeignKey("employees.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    pc = Column(String(50), nullable=False)
    filename = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=True)

    employee = relationship("Employee", back_populates="files")


class EmailEvent(Base):
    __tablename__ = "email_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(100), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    employee_id = Column(String(50), ForeignKey("employees.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    pc = Column(String(50), nullable=False)
    to_address = Column(Text, nullable=False)
    from_address = Column(String(255), nullable=False)
    size = Column(Integer, nullable=False)
    attachments = Column(Integer, default=0, nullable=False)
    content = Column(Text, nullable=True)

    employee = relationship("Employee", back_populates="emails")


class HttpEvent(Base):
    __tablename__ = "http_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String(100), unique=True, index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    employee_id = Column(String(50), ForeignKey("employees.employee_id", ondelete="CASCADE"), nullable=False, index=True)
    pc = Column(String(50), nullable=False)
    url = Column(Text, nullable=False)
    content = Column(Text, nullable=True)

    employee = relationship("Employee", back_populates="http_logs")
