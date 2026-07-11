from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Request
from datetime import datetime, timezone, timedelta
from app.models.employee import Employee
from app.models.department import Department
from app.models.role import Role
from app.models.activity import ActivityLog, ActivityType, Severity
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings

def get_client_info(request: Request):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", "")
    return ip_address, user_agent

def log_activity(db: Session, employee_id: str, activity_type: ActivityType, severity: Severity, description: str, request: Request = None):
    ip_address, browser = None, None
    if request:
        ip_address, browser = get_client_info(request)
        
    activity = ActivityLog(
        employee_id=employee_id,
        activity_type=activity_type,
        severity=severity,
        description=description,
        ip_address=ip_address,
        browser=browser
    )
    db.add(activity)
    db.commit()

def register_employee(db: Session, req: RegisterRequest, request: Request):
    # Validations
    if db.query(Employee).filter(Employee.email == req.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    
    if db.query(Employee).filter(Employee.employee_id == req.employee_id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee ID already exists")

    if req.department_id and not db.query(Department).filter(Department.id == req.department_id).first():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Department does not exist")
        
    if req.role_id and not db.query(Role).filter(Role.id == req.role_id).first():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Role does not exist")

    new_employee = Employee(
        employee_id=req.employee_id,
        first_name=req.first_name,
        last_name=req.last_name,
        email=req.email,
        password_hash=get_password_hash(req.password),
        department_id=req.department_id,
        role_id=req.role_id,
        is_active=True,
        failed_login_attempts=0,
        last_password_change=datetime.now(timezone.utc)
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    # Log Activity
    log_activity(db, new_employee.id, ActivityType.REGISTER, Severity.LOW, "Employee registered successfully", request)
    
    return new_employee

def login_employee(db: Session, req: LoginRequest, request: Request) -> TokenResponse:
    employee = db.query(Employee).filter(Employee.email == req.email).first()
    
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee Not Found")
        
    if not employee.is_active:
        log_activity(db, employee.id, ActivityType.FAILED_LOGIN, Severity.MEDIUM, "Attempted login to inactive account", request)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive Account")
        
    if not verify_password(req.password, employee.password_hash):
        employee.failed_login_attempts += 1
        log_activity(db, employee.id, ActivityType.FAILED_LOGIN, Severity.MEDIUM, f"Invalid password. Attempt {employee.failed_login_attempts}", request)
        
        if employee.failed_login_attempts >= 5:
            employee.is_active = False
            log_activity(db, employee.id, ActivityType.ACCOUNT_LOCKED, Severity.HIGH, "Account locked due to excessive failed login attempts", request)
            
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")
        
    # Success
    employee.failed_login_attempts = 0
    employee.last_login = datetime.now(timezone.utc)
    db.commit()
    
    access_token = create_access_token(subject=str(employee.id))
    log_activity(db, employee.id, ActivityType.LOGIN, Severity.LOW, "Employee logged in successfully", request)
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        employee=employee
    )

def logout_employee(db: Session, employee_id: str, request: Request):
    log_activity(db, employee_id, ActivityType.LOGOUT, Severity.LOW, "Employee logged out", request)
    return {"message": "Logged out successfully"}
