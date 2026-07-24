from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="Security Analyst")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user = Column(String(150), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=True)
    email = Column(String(150), nullable=True)
    department = Column(String(150), nullable=True)
    designation = Column(String(150), nullable=True)
    manager = Column(String(150), nullable=True)
    login_count = Column(Integer, default=0)
    unique_devices = Column(Integer, default=0)
    after_hours_logins = Column(Integer, default=0)
    weekend_logins = Column(Integer, default=0)
    after_hours_ratio = Column(Float, default=0)
    weekend_ratio = Column(Float, default=0)
    anomaly_prediction = Column(Integer, default=1)
    anomaly_score = Column(Float, default=0)
    anomaly = Column(Integer, default=0)
    risk_score = Column(Float, default=0)
    risk_level = Column(String(50), default="Low")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    login_activities = relationship(
        "LoginActivity",
        back_populates="employee",
        cascade="all, delete-orphan"
    )

    file_accesses = relationship(
        "FileAccess",
        back_populates="employee",
        cascade="all, delete-orphan"
    )


class LoginActivity(Base):
    __tablename__ = "login_activity"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    user = Column(String(150), nullable=True)
    pc = Column(String(150), nullable=True)
    activity = Column(String(100), nullable=True)
    login_time = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(100), nullable=True)
    location = Column(String(150), nullable=True)
    success = Column(Boolean, default=True)
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0)

    employee = relationship(
        "Employee",
        back_populates="login_activities"
    )


class FileAccess(Base):
    __tablename__ = "file_access"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    user = Column(String(150), nullable=True)
    pc = Column(String(150), nullable=True)
    filename = Column(String(500), nullable=True)
    content = Column(String(100), nullable=True)
    access_time = Column(DateTime, default=datetime.utcnow)
    action = Column(String(100), default="Access")
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0)

    employee = relationship(
        "Employee",
        back_populates="file_accesses"
    )


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(50), default="Medium")
    status = Column(String(50), default="Open")
    risk_score = Column(Float, default=0)
    alert_type = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(50), default="Medium")
    status = Column(String(50), default="Open")
    assigned_to = Column(String(150), nullable=True)
    evidence = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class AnomalyResult(Base):
    __tablename__ = "anomaly_results"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(Integer, nullable=False)

    anomaly_score = Column(Float, nullable=False)

    risk_level = Column(String(50), nullable=False)

    detected_at = Column(
        DateTime,
        default=datetime.utcnow
    )