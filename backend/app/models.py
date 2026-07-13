from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False)  # 'security_analyst','soc_engineer','security_manager','administrator'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    profile = relationship("EmployeeProfile", back_populates="user", uselist=False)


class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    employee_id = Column(String(20), unique=True, nullable=False, index=True)
    department = Column(String(100))
    designation = Column(String(100))
    manager = Column(String(100))
    device_info = Column(Text)
    access_privileges = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="profile")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(20), ForeignKey("employee_profiles.employee_id"), index=True)
    event_type = Column(String(50), nullable=False)  # 'login','file_access','app_usage'
    event_detail = Column(Text)
    ip_address = Column(String(50))
    device = Column(String(100))
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)  