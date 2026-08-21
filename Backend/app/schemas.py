from pydantic import BaseModel, EmailStr, Field, field_validator
import re
from datetime import datetime


# ==========================
# EMPLOYEE SCHEMAS
# ==========================

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    role: str
    risk_score: int = 0


class EmployeeResponse(EmployeeCreate):
    id: int

    class Config:
        from_attributes = True


# ==========================
# USER SCHEMAS
# ==========================

class UserRegister(BaseModel):

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=72
    )

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value):

        value = value.strip()

        if not value:
            raise ValueError(
                "Full name is required"
            )

        if not re.fullmatch(
            r"[A-Za-z ]+",
            value
        ):
            raise ValueError(
                "Full name must contain only letters and spaces"
            )

        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):

        if not re.search(r"[A-Z]", value):
            raise ValueError(
                "Password must contain at least one uppercase letter"
            )

        if not re.search(r"[a-z]", value):
            raise ValueError(
                "Password must contain at least one lowercase letter"
            )

        if not re.search(r"\d", value):
            raise ValueError(
                "Password must contain at least one number"
            )

        if not re.search(
            r"[!@#$%^&*(),.?\":{}|<>_\-+=]",
            value
        ):
            raise ValueError(
                "Password must contain at least one special character"
            )

        return value


class UserLogin(BaseModel):

    email: EmailStr

    password: str


# ==========================
# USER RESPONSE
# ==========================

class UserResponse(BaseModel):

    id: int

    full_name: str

    email: EmailStr

    role: str

    class Config:
        from_attributes = True


# ==========================
# LOGIN RESPONSE
# ==========================

class Token(BaseModel):

    access_token: str

    token_type: str

# =====================================================
# PASSWORD RESET / OTP SCHEMAS
# =====================================================

class ForgotPasswordRequest(BaseModel):

    email: EmailStr


class VerifyOTPRequest(BaseModel):

    email: EmailStr

    otp: str = Field(
        ...,
        min_length=6,
        max_length=6
    )

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value):

        if not value.isdigit():
            raise ValueError(
                "OTP must contain only numbers"
            )

        return value


class ResetPasswordRequest(BaseModel):

    email: EmailStr

    otp: str = Field(
        ...,
        min_length=6,
        max_length=6
    )

    new_password: str = Field(
        ...,
        min_length=8,
        max_length=72
    )

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value):

        if not value.isdigit():
            raise ValueError(
                "OTP must contain only numbers"
            )

        return value

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value):

        if not re.search(r"[A-Z]", value):
            raise ValueError(
                "Password must contain at least one uppercase letter"
            )

        if not re.search(r"[a-z]", value):
            raise ValueError(
                "Password must contain at least one lowercase letter"
            )

        if not re.search(r"\d", value):
            raise ValueError(
                "Password must contain at least one number"
            )

        if not re.search(
            r"[!@#$%^&*(),.?\":{}|<>_\-+=]",
            value
        ):
            raise ValueError(
                "Password must contain at least one special character"
            )

        return value


# ==========================
# BEHAVIOR SCHEMAS
# ==========================

class BehaviorCreate(BaseModel):
    employee_id: int
    failed_logins: int = 0
    usb_used: bool = False
    after_hours_login: bool = False
    files_downloaded: int = 0
    emails_sent: int = 0
    login_hour: int = 9


class BehaviorUpdate(BaseModel):
    failed_logins: int
    usb_used: bool
    after_hours_login: bool
    files_downloaded: int
    emails_sent: int
    login_hour: int


class BehaviorResponse(BaseModel):
    id: int
    employee_id: int
    failed_logins: int
    usb_used: bool
    after_hours_login: bool
    files_downloaded: int
    emails_sent: int
    login_hour: int

    class Config:
        from_attributes = True

# ==========================
# ALERT SCHEMAS
# ==========================

class AlertResponse(BaseModel):
    employee_id: int
    risk_score: int
    risk_level: str
    message: str


class EmployeeRiskResponse(BaseModel):
    employee_id: str
    full_name: str
    department: str
    risk_score: int
    risk_level: str

    class Config:
        from_attributes = True

# ==========================
# AI PREDICTION SCHEMAS
# ==========================

class AIPredictRequest(BaseModel):
    employee_id: int

    avg_failed_logins: int
    avg_files_downloaded: int
    avg_emails_sent: int
    avg_login_hour: int
    usb_usage_rate: int
    after_hours_rate: int


class AIPredictResponse(BaseModel):
    prediction: str

    risk_score: int

    risk_level: str

    threat_severity: str

    risk_trend: str

    recommendation: str

    risk_summary: str

    detection_method: str

    triggered_rules: list[str]

# ==========================
# ALERT LIST SCHEMA
# ==========================

class AlertListResponse(BaseModel):
    employee_id: int
    full_name: str
    risk_score: int
    risk_level: str
    message: str

class ActivityLogResponse(BaseModel):
    employee_id: str
    full_name: str
    department: str
    role: str
    failed_logins: int
    usb_used: bool
    after_hours_login: bool
    files_downloaded: int
    emails_sent: int
    login_hour: int

    class Config:
        from_attributes = True

class BaselineResponse(BaseModel):
    employee_id: int
    avg_failed_logins: int
    avg_files_downloaded: int
    avg_emails_sent: int
    avg_login_hour: int
    usb_usage_rate: int
    after_hours_rate: int

    class Config:
        from_attributes = True

# ==========================
# BASELINE RESPONSE SCHEMA
# ==========================

class BaselineResponse(BaseModel):
    employee_id: int
    avg_failed_logins: int
    avg_files_downloaded: int
    avg_emails_sent: int
    avg_login_hour: int
    usb_usage_rate: int
    after_hours_rate: int

    class Config:
        from_attributes = True

# ==========================
# UEBA INTELLIGENCE SCHEMA
# ==========================

class UEBAResponse(BaseModel):
    employee_id: str
    full_name: str
    department: str
    role: str

    behaviour_status: str
    behaviour_score: int
    behaviour_trend: str

    department_risk: str
    peer_group_status: str

    prediction: str
    risk_level: str
    threat_severity: str
    detection_method: str

    # ==========================
# THREAT INVESTIGATION SCHEMAS
# ==========================

class InvestigationCreate(BaseModel):
    employee_id: int
    incident_title: str
    threat_severity: str


class InvestigationUpdate(BaseModel):
    status: str
    assigned_analyst: str
    investigation_notes: str
    recommendation: str


class InvestigationResponse(BaseModel):
    id: int
    employee_id: int
    incident_title: str
    threat_severity: str
    status: str
    assigned_analyst: str
    investigation_notes: str
    recommendation: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ==========================
# INVESTIGATION DASHBOARD
# ==========================

class InvestigationDashboardResponse(BaseModel):
    id: int

    employee_id: int

    employee_code: str

    full_name: str

    department: str

    role: str

    incident_title: str

    threat_severity: str

    status: str

    assigned_analyst: str

    created_at: datetime

    class Config:
        from_attributes = True


# ==========================
# Investigation Details
# ==========================

class InvestigationDetailsResponse(BaseModel):

    id: int

    employee_id: int

    employee_code: str

    full_name: str

    department: str

    role: str

    incident_title: str

    threat_severity: str

    status: str

    assigned_analyst: str

    investigation_notes: str

    recommendation: str

    created_at: datetime

    class Config:
        from_attributes = True

# ==========================
# Activity Timeline
# ==========================

class TimelineEvent(BaseModel):

    time: str

    title: str

    description: str

    severity: str

    icon: str


class InvestigationTimelineResponse(BaseModel):

    events: list[TimelineEvent]

# =====================================================
# Threat Evidence Collection
# =====================================================

class InvestigationEvidenceResponse(BaseModel):

    failed_logins: int

    files_downloaded: int

    emails_sent: int

    usb_used: bool

    after_hours_login: bool

    risk_level: str

    detection_method: str

# =====================================================
# Device Analysis
# =====================================================

class DeviceAnalysisResponse(BaseModel):

    login_hour: int

    usb_used: bool

    after_hours_login: bool

    files_downloaded: int

    emails_sent: int

    device_risk: str

# =====================================================
# User Risk History
# =====================================================

class RiskHistoryResponse(BaseModel):

    employee_name: str

    current_risk: str

    previous_risk: str

    total_incidents: int

    average_risk_score: int

    behaviour_trend: str

# =====================================================
# Event Correlation
# =====================================================

class CorrelationEvent(BaseModel):

    event: str

    severity: str

    correlated: bool


class EventCorrelationResponse(BaseModel):

    employee_name: str

    total_events: int

    risk_level: str

    correlation_score: int

    events: list[CorrelationEvent]

# =====================================================
# Investigation Workflow
# =====================================================

class InvestigationWorkflowUpdate(BaseModel):

    assigned_analyst: str

    status: str

    investigation_notes: str

    recommendation: str


class InvestigationWorkflowResponse(BaseModel):

    message: str

    investigation_id: int

    assigned_analyst: str

    status: str

# =====================================================
# ALERT MANAGEMENT
# =====================================================

class AlertDashboardResponse(BaseModel):

    id: int

    employee_id: int

    employee_code: str

    full_name: str

    department: str

    alert_title: str

    severity: str

    status: str

    escalation_level: int

    assigned_analyst: str

    created_at: datetime

    class Config:
        from_attributes = True


class AssignAnalystRequest(BaseModel):

    assigned_analyst: str


class EscalateAlertResponse(BaseModel):

    message: str

    escalation_level: int


class ResolveAlertRequest(BaseModel):

    resolution_notes: str


class ResolveAlertResponse(BaseModel):

    message: str

    status: str

# ==========================================
# NOTIFICATION SCHEMAS
# ==========================================

class NotificationResponse(BaseModel):
    id: int
    employee_id: int | None
    notification_type: str
    title: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationReadResponse(BaseModel):
    message: str
    notification_id: int
    is_read: bool