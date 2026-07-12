from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
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
    user_id =Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)

    employee_id = Column(String(50), unique=True, nullable=False)

    designation = Column(String(100))
    department = Column(String(100))
    manager = Column(String(100))
    device_info = Column(String(255))
    access_privileges = Column(String(255))

    phone = Column(String(20))

    address = Column(String(255))

    risk_score = Column(Float, default=0)
   
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    employee = Column(String(150))

    severity = Column(String(30))

    description = Column(String(255))

    status = Column(String(50))

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)

    employee = Column(String(150))

    activity = Column(String(255))

    device = Column(String(100))

    ip_address = Column(String(100))

    timestamp = Column(DateTime(timezone=True), server_default=func.now())