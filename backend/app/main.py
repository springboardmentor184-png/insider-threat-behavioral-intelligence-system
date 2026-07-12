from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from app.config import settings
from app.database import engine, get_db, Base
from app.models import User, EmployeeProfile, Device, Asset, AuditLog
from app.schemas import (
    UserCreate, UserResponse, Token, EmployeeCreate, EmployeeUpdate,
    EmployeeResponse, DeviceCreate, DeviceResponse, AssetCreate, AssetResponse,
    AuditLogResponse
)
from app.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, RoleChecker, verify_google_token
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to log actions in AuditLog table
def create_audit_log(db: Session, email: str, action: str, status: str, ip: str = None):
    log = AuditLog(user_email=email, action=action, status=status, ip_address=ip)
    db.add(log)
    db.commit()

# Database pre-seeding function
@app.on_event("startup")
def seed_data():
    db = Session(bind=engine)
    try:
        # Check if users table is empty
        if db.query(User).count() == 0:
            print("Seeding initial user roles...")
            users_to_seed = [
                ("admin@company.com", "admin123", "System Administrator", "Administrator"),
                ("analyst@company.com", "analyst123", "Security Analyst One", "Security Analyst"),
                ("soc@company.com", "soc123", "SOC Engineer One", "SOC Engineer"),
                ("manager@company.com", "manager123", "Security Manager One", "Security Manager")
            ]
            for email, password, name, role in users_to_seed:
                hashed = get_password_hash(password)
                user = User(email=email, hashed_password=hashed, full_name=name, role=role)
                db.add(user)
            db.commit()
            
        # Check if employees table is empty, seed a sample employee
        if db.query(EmployeeProfile).count() == 0:
            print("Seeding sample employee profiles...")
            emp = EmployeeProfile(
                employee_id="EMP-7082",
                full_name="John Doe",
                department="Engineering",
                designation="Senior Backend Engineer",
                manager="Security Manager One",
                access_privileges="SSH_ACCESS,DB_READ,REPO_WRITE",
                status="Active"
            )
            db.add(emp)
            db.commit()
            
            # Seed associated device and asset
            dev = Device(
                employee_id="EMP-7082",
                device_name="Workplace macOS Laptop",
                ip_address="192.168.1.15",
                mac_address="3A:B4:C5:D6:E7:F8",
                status="Active"
            )
            asset = Asset(
                employee_id="EMP-7082",
                asset_name="Core SQL Database",
                asset_type="SQL Database",
                access_level="Read"
            )
            db.add(dev)
            db.add(asset)
            db.commit()
            
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

# ----------------- AUTH ROUTES -----------------

@app.post("/api/auth/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        create_audit_log(db, user_in.email, f"REGISTRATION_ATTEMPT (Role: {user_in.role})", "FAILED: Email exists")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    create_audit_log(db, new_user.email, f"USER_REGISTERED (Role: {new_user.role})", "SUCCESS")
    return new_user

@app.post("/api/auth/login", response_model=Token)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Standard OAuth2 endpoint compatible with FastAPI docs and headers
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        create_audit_log(db, form_data.username, "LOGIN_ATTEMPT", "FAILED")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = {"sub": user.email, "role": user.role}
    access_token = create_access_token(data=token_data)
    
    create_audit_log(db, user.email, f"LOGIN_SUCCESS (Role: {user.role})", "SUCCESS", request.client.host if request.client else None)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login-json", response_model=Token)
def login_json(request: Request, body: dict, db: Session = Depends(get_db)):
    # Alternative login endpoint handling JSON payloads directly from JSON request bodies
    email = body.get("email")
    password = body.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
        
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        create_audit_log(db, email, "LOGIN_JSON_ATTEMPT", "FAILED")
        raise HTTPException(status_code=401, detail="Incorrect email or password")
        
    token_data = {"sub": user.email, "role": user.role}
    access_token = create_access_token(data=token_data)
    
    create_audit_log(db, user.email, f"LOGIN_JSON_SUCCESS (Role: {user.role})", "SUCCESS", request.client.host if request.client else None)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/google", response_model=Token)
def google_auth(request: Request, body: dict, db: Session = Depends(get_db)):
    # Receive Google Credential Token from frontend for LOGIN
    credential = body.get("credential")
    if not credential:
        raise HTTPException(status_code=400, detail="Google credential token missing")
        
    token_info = verify_google_token(credential)
    email = token_info.get("email")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email field missing in Google Token")
        
    # Check if user already exists in DB (Option A: restrict login to registered accounts only)
    user = db.query(User).filter(User.email == email).first()
    if not user:
        create_audit_log(db, email, "GOOGLE_SSO_LOGIN_ATTEMPT", "FAILED: Account not registered")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account not registered. Please register first under the Register tab."
        )
        
    create_audit_log(db, email, f"GOOGLE_SSO_LOGIN (Role: {user.role})", "SUCCESS", request.client.host if request.client else None)
    
    token_data = {"sub": user.email, "role": user.role}
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/google-register", response_model=Token)
def google_register(request: Request, body: dict, db: Session = Depends(get_db)):
    # Register a new user using Google credential with a selected Role
    credential = body.get("credential")
    role = body.get("role", "Security Analyst")
    
    if not credential:
        raise HTTPException(status_code=400, detail="Google credential token missing")
        
    token_info = verify_google_token(credential)
    email = token_info.get("email")
    name = token_info.get("name", "Google User")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email field missing in Google Token")
        
    # Validate selected role
    valid_roles = ["Administrator", "Security Analyst", "SOC Engineer", "Security Manager"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid system role selected")
        
    # Check if user already exists
    user = db.query(User).filter(User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")
        
    # Create new user bound to the selected role
    fallback_password = f"google_sso_{email}_fallback_secure_123!"
    hashed_pwd = get_password_hash(fallback_password)
    user = User(
        email=email,
        hashed_password=hashed_pwd,
        full_name=name,
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    create_audit_log(db, email, f"GOOGLE_SSO_REGISTER (Role: {role})", "SUCCESS", request.client.host if request.client else None)
    
    token_data = {"sub": user.email, "role": user.role}
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/google-client-id")
def get_google_client_id():
    return {"client_id": settings.GOOGLE_CLIENT_ID}

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ----------------- EMPLOYEE IDENTITY & PROFILE ROUTES -----------------

# Define access roles per operations
require_write = RoleChecker(["Administrator", "Security Manager"])
require_read = RoleChecker(["Administrator", "Security Analyst", "SOC Engineer", "Security Manager"])
require_admin = RoleChecker(["Administrator"])

@app.post("/api/employees/onboard", response_model=EmployeeResponse)
def onboard_employee(
    emp_in: EmployeeCreate, 
    current_user: User = Depends(require_write), 
    db: Session = Depends(get_db)
):
    # Verify Employee ID uniqueness
    db_emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == emp_in.employee_id).first()
    if db_emp:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
        
    new_emp = EmployeeProfile(
        employee_id=emp_in.employee_id,
        full_name=emp_in.full_name,
        department=emp_in.department,
        designation=emp_in.designation,
        manager=emp_in.manager,
        access_privileges=emp_in.access_privileges,
        status=emp_in.status,
        user_id=emp_in.user_id
    )
    db.add(new_emp)
    db.commit()
    db.refresh(new_emp)
    
    create_audit_log(db, current_user.email, f"ONBOARD_EMPLOYEE (ID: {new_emp.employee_id})", "SUCCESS")
    return new_emp

@app.get("/api/employees", response_model=List[EmployeeResponse])
def get_employees(
    current_user: User = Depends(require_read), 
    db: Session = Depends(get_db)
):
    return db.query(EmployeeProfile).all()

@app.get("/api/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: str, 
    current_user: User = Depends(require_read), 
    db: Session = Depends(get_db)
):
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    return emp

@app.put("/api/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str, 
    emp_in: EmployeeUpdate, 
    current_user: User = Depends(require_write), 
    db: Session = Depends(get_db)
):
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
        
    update_data = emp_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(emp, key, value)
        
    db.commit()
    db.refresh(emp)
    create_audit_log(db, current_user.email, f"UPDATE_EMPLOYEE (ID: {employee_id})", "SUCCESS")
    return emp

@app.delete("/api/employees/{employee_id}")
def delete_employee(
    employee_id: str, 
    current_user: User = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
        
    db.delete(emp)
    db.commit()
    create_audit_log(db, current_user.email, f"DELETE_EMPLOYEE (ID: {employee_id})", "SUCCESS")
    return {"message": f"Employee {employee_id} deleted successfully"}

# ----------------- DEVICE ASSOCIATION ROUTES -----------------

@app.post("/api/employees/{employee_id}/devices", response_model=DeviceResponse)
def add_device(
    employee_id: str, 
    device_in: DeviceCreate, 
    current_user: User = Depends(require_write), 
    db: Session = Depends(get_db)
):
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
        
    new_device = Device(
        employee_id=employee_id,
        device_name=device_in.device_name,
        ip_address=device_in.ip_address,
        mac_address=device_in.mac_address,
        status=device_in.status
    )
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    
    create_audit_log(db, current_user.email, f"ADD_DEVICE (ID: {employee_id}, Dev: {new_device.device_name})", "SUCCESS")
    return new_device

@app.delete("/api/employees/{employee_id}/devices/{device_id}")
def remove_device(
    employee_id: str,
    device_id: int,
    current_user: User = Depends(require_write),
    db: Session = Depends(get_db)
):
    device = db.query(Device).filter(Device.id == device_id, Device.employee_id == employee_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device mapping not found")
        
    db.delete(device)
    db.commit()
    create_audit_log(db, current_user.email, f"REMOVE_DEVICE (ID: {employee_id}, DevID: {device_id})", "SUCCESS")
    return {"message": "Device mapping removed successfully"}

# ----------------- ASSET ASSOCIATION ROUTES -----------------

@app.post("/api/employees/{employee_id}/assets", response_model=AssetResponse)
def add_asset(
    employee_id: str, 
    asset_in: AssetCreate, 
    current_user: User = Depends(require_write), 
    db: Session = Depends(get_db)
):
    emp = db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")
        
    new_asset = Asset(
        employee_id=employee_id,
        asset_name=asset_in.asset_name,
        asset_type=asset_in.asset_type,
        access_level=asset_in.access_level
    )
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    
    create_audit_log(db, current_user.email, f"ADD_ASSET (ID: {employee_id}, Asset: {new_asset.asset_name})", "SUCCESS")
    return new_asset

@app.delete("/api/employees/{employee_id}/assets/{asset_id}")
def remove_asset(
    employee_id: str,
    asset_id: int,
    current_user: User = Depends(require_write),
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id, Asset.employee_id == employee_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset mapping not found")
        
    db.delete(asset)
    db.commit()
    create_audit_log(db, current_user.email, f"REMOVE_ASSET (ID: {employee_id}, AssetID: {asset_id})", "SUCCESS")
    return {"message": "Asset mapping removed successfully"}

# ----------------- AUDIT LOG ROUTES -----------------

@app.get("/api/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    current_user: User = Depends(require_read), 
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
