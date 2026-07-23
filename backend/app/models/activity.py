import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text, Boolean, Integer, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base
from app.database.types import GUID


class ActivityType(str, enum.Enum):
    # Account Management
    REGISTER = "Register"
    EMPLOYEE_CREATED = "Employee Created"
    EMPLOYEE_UPDATED = "Employee Updated"
    EMPLOYEE_DEACTIVATED = "Employee Deactivated"
    EMPLOYEE_VIEWED = "Employee Viewed"

    # Authentication Events
    LOGIN = "Login"
    LOGOUT = "Logout"
    FAILED_LOGIN = "Failed Login"
    ACCOUNT_LOCKED = "Account Locked"
    PASSWORD_CHANGED = "Password Changed"
    PASSWORD_RESET = "Password Reset"
    PRIVILEGE_ESCALATION = "Privilege Escalation"

    # Device & Network
    USB_CONNECTED = "USB Connected"
    USB_REMOVED = "USB Removed"
    EXTERNAL_DEVICE_CONNECTED = "External Device Connected"
    VPN_CONNECTED = "VPN Connected"
    VPN_DISCONNECTED = "VPN Disconnected"

    # File & Data Operations
    FILE_ACCESS = "File Access"
    FILE_UPLOAD = "File Upload"
    FILE_DOWNLOAD = "File Download"
    SENSITIVE_FILE_ACCESS = "Sensitive File Access"
    SHARED_FOLDER_ACCESS = "Shared Folder Access"
    DATA_TRANSFER = "Data Transfer"

    # Application & Web
    APP_LAUNCH = "Application Launch"
    WEBSITE_ACCESS = "Website Access"
    EMAIL_ACTIVITY = "Email Activity"
    CLOUD_UPLOAD = "Cloud Upload"
    CLOUD_DOWNLOAD = "Cloud Download"

    # Security Events
    POLICY_VIOLATION = "Policy Violation"
    SECURITY_ALERT = "Security Alert"
    SUSPICIOUS_ACTIVITY = "Suspicious Activity"

class Severity(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class ActivityLog(Base):
    """
    Activity log model representing employee telemetry and behavioral events.
    Captures extensive forensic metadata including device fingerprints, network details,
    and session information for comprehensive insider threat analysis.
    """
    __tablename__ = "activity_logs"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(GUID(), ForeignKey("employees.id"), nullable=False, index=True)
    
    # Core Event Information
    activity_type = Column(Enum(ActivityType), nullable=False, index=True)
    description = Column(Text, nullable=True)
    severity = Column(Enum(Severity), nullable=False, default=Severity.LOW, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Device & System Information
    device_name = Column(String(150), nullable=True)
    device_id = Column(String(255), nullable=True, index=True)
    browser = Column(String(150), nullable=True)
    operating_system = Column(String(100), nullable=True)
    application_name = Column(String(255), nullable=True)

    # Network Information
    ip_address = Column(String(50), nullable=True, index=True)
    location = Column(String(150), nullable=True)
    vpn_used = Column(Boolean, default=False, nullable=True)
    is_after_hours = Column(Boolean, default=False, nullable=True)
    is_weekend = Column(Boolean, default=False, nullable=True)

    # Session Information
    session_id = Column(String(255), nullable=True)
    session_duration = Column(Integer, nullable=True)  # seconds
    
    # Data Transfer Information
    resource_name = Column(String(255), nullable=True)
    upload_size = Column(Integer, nullable=True)  # bytes
    download_size = Column(Integer, nullable=True)  # bytes
    data_transferred = Column(Integer, nullable=True)  # bytes
    
    # Security Context
    privilege_level = Column(String(50), nullable=True)
    failed_login_count = Column(Integer, default=0, nullable=True)
    
    # Anomaly tracking score field for future models
    anomaly_score = Column(Float, nullable=True)  # 0.0-1.0, for future ML models
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", back_populates="activities", lazy="select")
