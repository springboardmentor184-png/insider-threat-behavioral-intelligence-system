from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="employee")
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