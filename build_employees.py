import os
import re

base = r'c:\Users\Dhanush\Desktop\insider-threat-behavioral-intelligence-system\backend'
files = {}

# 1. Update ActivityType Enum in app/models/activity.py
# First read existing, then replace
with open(os.path.join(base, 'app/models/activity.py'), 'r', encoding='utf-8') as f:
    activity_code = f.read()

if "EMPLOYEE_CREATED" not in activity_code:
    new_types = """    EMPLOYEE_CREATED = "Employee Created"
    EMPLOYEE_UPDATED = "Employee Updated"
    EMPLOYEE_DEACTIVATED = "Employee Deactivated"
    EMPLOYEE_VIEWED = "Employee Viewed"
"""
    # Insert new types before LOGIN
    activity_code = activity_code.replace('    REGISTER = "Register"', '    REGISTER = "Register"\n' + new_types)
    files['app/models/activity.py'] = activity_code


# 2. Update Schemas in app/schemas/employee.py
files['app/schemas/employee.py'] = """from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class EmployeeBase(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    department_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    job_title: Optional[str] = None
    manager_name: Optional[str] = None
    status: str = "Active"

class EmployeeCreate(EmployeeBase):
    password: str = Field(..., min_length=8)

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department_id: Optional[UUID] = None
    role_id: Optional[UUID] = None
    job_title: Optional[str] = None
    manager_name: Optional[str] = None
    status: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: UUID
    is_active: bool
    failed_login_attempts: int
    last_password_change: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    date_joined: Optional[datetime] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedEmployeeResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[EmployeeResponse]

class DepartmentBase(BaseModel):
    id: UUID
    department_name: str
    department_code: str
    model_config = ConfigDict(from_attributes=True)

class RoleBase(BaseModel):
    id: UUID
    role_name: str
    model_config = ConfigDict(from_attributes=True)

class EmployeeDetailResponse(EmployeeResponse):
    department: Optional[DepartmentBase] = None
    role: Optional[RoleBase] = None
    risk_score: Optional[float] = None
"""

# 3. Employee Service in app/services/employee_service.py
files['app/services/employee_service.py'] = """from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, or_, and_
from fastapi import HTTPException, status, Request
from datetime import datetime, timezone
from app.models.employee import Employee
from app.models.department import Department
from app.models.role import Role
from app.models.risk import RiskAssessment
from app.models.activity import ActivityType, Severity
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, PaginatedEmployeeResponse, EmployeeDetailResponse
from app.services.auth_service import log_activity, get_password_hash

def get_employees(db: Session, request: Request, current_user: Employee, page: int = 1, limit: int = 20, search: str = None, department: str = None, role: str = None, is_active: bool = None):
    query = db.query(Employee).options(
        joinedload(Employee.department), 
        joinedload(Employee.role)
    )

    if search:
        search_filter = or_(
            Employee.first_name.ilike(f"%{search}%"),
            Employee.last_name.ilike(f"%{search}%"),
            Employee.email.ilike(f"%{search}%"),
            Employee.employee_id.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    if department:
        query = query.join(Department).filter(Department.department_name.ilike(f"%{department}%"))

    if role:
        query = query.join(Role).filter(Role.role_name.ilike(f"%{role}%"))

    if is_active is not None:
        query = query.filter(Employee.is_active == is_active)

    total = query.count()
    query = query.order_by(desc(Employee.created_at))
    employees = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedEmployeeResponse(
        total=total,
        page=page,
        limit=limit,
        data=employees
    )

def get_employee_by_id(db: Session, employee_id: str, request: Request, current_user: Employee):
    employee = db.query(Employee).options(
        joinedload(Employee.department), 
        joinedload(Employee.role)
    ).filter(Employee.id == employee_id).first()
    
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Fetch latest risk score
    latest_risk = db.query(RiskAssessment).filter(RiskAssessment.employee_id == employee.id).order_by(desc(RiskAssessment.created_at)).first()
    risk_score = latest_risk.risk_score if latest_risk else None

    # Log viewed activity if viewed by a different user
    if current_user.id != employee.id:
        log_activity(db, current_user.id, ActivityType.EMPLOYEE_VIEWED, Severity.LOW, f"Viewed profile of employee {employee.employee_id}", request)

    return EmployeeDetailResponse(
        **employee.__dict__,
        department=employee.department,
        role=employee.role,
        risk_score=risk_score
    )

def create_employee(db: Session, req: EmployeeCreate, request: Request, current_user: Employee):
    # Validations
    if db.query(Employee).filter(Employee.email == req.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    
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
        job_title=req.job_title,
        manager_name=req.manager_name,
        is_active=True,
        status="Active",
        failed_login_attempts=0,
        last_password_change=datetime.now(timezone.utc),
        date_joined=datetime.now(timezone.utc)
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    # Log Activity for Admin who created it
    log_activity(db, current_user.id, ActivityType.EMPLOYEE_CREATED, Severity.LOW, f"Created new employee {new_employee.employee_id}", request)
    # Log Registration Activity for new employee
    log_activity(db, new_employee.id, ActivityType.REGISTER, Severity.LOW, "Employee account created by administrator", request)
    
    return new_employee

def update_employee(db: Session, employee_id: str, req: EmployeeUpdate, request: Request, current_user: Employee):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    if req.email and req.email != employee.email:
        if db.query(Employee).filter(Employee.email == req.email).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
            
    if req.department_id and not db.query(Department).filter(Department.id == req.department_id).first():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Department does not exist")
        
    if req.role_id and not db.query(Role).filter(Role.id == req.role_id).first():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Role does not exist")

    update_data = req.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employee, key, value)
        
    db.commit()
    db.refresh(employee)
    
    log_activity(db, current_user.id, ActivityType.EMPLOYEE_UPDATED, Severity.MEDIUM, f"Updated profile for employee {employee.employee_id}", request)
    
    return employee

def delete_employee(db: Session, employee_id: str, request: Request, current_user: Employee):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    if employee.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Administrators cannot delete their own accounts")

    # Soft delete
    employee.is_active = False
    employee.status = "Terminated"
    employee.deleted_at = datetime.now(timezone.utc)
    
    db.commit()
    
    log_activity(db, current_user.id, ActivityType.EMPLOYEE_DEACTIVATED, Severity.HIGH, f"Deactivated/Deleted employee {employee.employee_id}", request)
    
    return {"message": "Employee successfully deactivated"}
"""

# 4. Employee API Routes in app/api/v1/employee.py
files['app/api/v1/employee.py'] = """from fastapi import APIRouter, Depends, status, Request, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.dependencies import get_db, get_current_user, require_roles
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, PaginatedEmployeeResponse, EmployeeDetailResponse
from app.services import employee_service
from app.models.employee import Employee

router = APIRouter()

@router.get("/profile", response_model=EmployeeDetailResponse, status_code=status.HTTP_200_OK, summary="Get Current Employee Profile")
def get_profile(request: Request, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    \"\"\"
    Return the profile of the currently authenticated employee. Available to all authenticated users.
    \"\"\"
    return employee_service.get_employee_by_id(db, str(current_user.id), request, current_user)

@router.get("/", response_model=PaginatedEmployeeResponse, status_code=status.HTTP_200_OK, summary="Get Paginated Employee List")
def get_employees_list(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    department: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))
):
    \"\"\"
    Return a paginated list of employees. Security Analysts and Administrators only.
    \"\"\"
    return employee_service.get_employees(db, request, current_user, page, limit, search, department, role, is_active)

@router.get("/{employee_id}", response_model=EmployeeDetailResponse, status_code=status.HTTP_200_OK, summary="Get Full Employee Details")
def get_employee(
    employee_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))
):
    \"\"\"
    Retrieve full enterprise details of a specific employee by ID. Security Analysts and Administrators only.
    \"\"\"
    return employee_service.get_employee_by_id(db, employee_id, request, current_user)

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED, summary="Create New Employee")
def create_new_employee(
    req: EmployeeCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator"]))
):
    \"\"\"
    Create a new employee profile. Administrator access required.
    \"\"\"
    return employee_service.create_employee(db, req, request, current_user)

@router.put("/{employee_id}", response_model=EmployeeResponse, status_code=status.HTTP_200_OK, summary="Update Employee Details")
def update_existing_employee(
    employee_id: str,
    req: EmployeeUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator"]))
):
    \"\"\"
    Update an existing employee's details. Does not allow changing UUID. Administrator access required.
    \"\"\"
    return employee_service.update_employee(db, employee_id, req, request, current_user)

@router.delete("/{employee_id}", status_code=status.HTTP_200_OK, summary="Soft Delete Employee")
def delete_existing_employee(
    employee_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator"]))
):
    \"\"\"
    Soft-delete an employee account, setting is_active to False and generating a deletion timestamp. Administrator access required.
    \"\"\"
    return employee_service.delete_employee(db, employee_id, request, current_user)
"""

for path, content in files.items():
    if content:
        full_path = os.path.join(base, path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
