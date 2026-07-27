from pydantic import BaseModel, EmailStr


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
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr

    class Config:
        from_attributes = True


# ==========================
# LOGIN RESPONSE
# ==========================

class Token(BaseModel):
    access_token: str
    token_type: str


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
    avg_failed_logins: int
    avg_files_downloaded: int
    avg_emails_sent: int
    avg_login_hour: int
    usb_usage_rate: int
    after_hours_rate: int


class AIPredictResponse(BaseModel):
    prediction: str
    risk: str

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