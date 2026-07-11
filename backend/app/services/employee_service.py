from uuid import UUID
from sqlalchemy.orm import Session, joinedload
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

def _coerce_uuid(value: str | UUID) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


def get_employee_by_id(db: Session, employee_id: str, request: Request, current_user: Employee):
    employee = db.query(Employee).options(
        joinedload(Employee.department), 
        joinedload(Employee.role)
    ).filter(Employee.id == _coerce_uuid(employee_id)).first()
    
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # Fetch latest risk score
    latest_risk = db.query(RiskAssessment).filter(RiskAssessment.employee_id == employee.id).order_by(desc(RiskAssessment.created_at)).first()
    risk_score = latest_risk.risk_score if latest_risk else None

    # Log viewed activity if viewed by a different user
    if current_user.id != employee.id:
        log_activity(db, current_user.id, ActivityType.EMPLOYEE_VIEWED, Severity.LOW, f"Viewed profile of employee {employee.employee_id}", request)

    employee_data = {
        k: v
        for k, v in employee.__dict__.items()
        if not k.startswith("_") and k not in {"department", "role", "department_id", "role_id"}
    }

    return EmployeeDetailResponse(
        **employee_data,
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
    employee = db.query(Employee).filter(Employee.id == _coerce_uuid(employee_id)).first()
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
    employee = db.query(Employee).filter(Employee.id == _coerce_uuid(employee_id)).first()
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
