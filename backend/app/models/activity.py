import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class ActivityType(str, enum.Enum):
    REGISTER = "Register"
    EMPLOYEE_CREATED = "Employee Created"
    EMPLOYEE_UPDATED = "Employee Updated"
    EMPLOYEE_DEACTIVATED = "Employee Deactivated"
    EMPLOYEE_VIEWED = "Employee Viewed"

    LOGIN = "Login"
    LOGOUT = "Logout"
    FAILED_LOGIN = "Failed Login"
    ACCOUNT_LOCKED = "Account Locked"
    PASSWORD_CHANGED = "Password Changed"
    PASSWORD_RESET = "Password Reset"
    USB_CONNECTED = "USB Connected"
    USB_REMOVED = "USB Removed"
    FILE_ACCESS = "File Access"
    FILE_UPLOAD = "File Upload"
    FILE_DOWNLOAD = "File Download"
    APP_LAUNCH = "Application Launch"
    WEBSITE_ACCESS = "Website Access"
    EMAIL_ACTIVITY = "Email Activity"
    POLICY_VIOLATION = "Policy Violation"

class Severity(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class ActivityLog(Base):
    """
    Activity log model representing employee telemetry and behavioral events.
    Captures extensive forensic metadata including device fingerprints and session hashes.
    """
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False, index=True)
    
    activity_type = Column(Enum(ActivityType), nullable=False, index=True)
    device_name = Column(String(150), nullable=True)
    ip_address = Column(String(50), nullable=True)
    location = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    severity = Column(Enum(Severity), nullable=False, default=Severity.LOW)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Advanced Forensic Fields
    device_id = Column(String(255), nullable=True)
    browser = Column(String(150), nullable=True)
    operating_system = Column(String(100), nullable=True)
    session_id = Column(String(255), nullable=True)
    resource_name = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", back_populates="activities", lazy="select")
