from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from pydantic import BaseModel, EmailStr
from ..core.database import get_db
from ..core.security import require_roles
from ..models import models

router = APIRouter(prefix="/employees", tags=["Employees"])

# --- Pydantic Models ---
class EmployeeCreate(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    department: str
    designation: str

# --- GET all employees ---
@router.get("/")
def get_all_employees(
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager"])),
    db: Session = Depends(get_db)
):
    employees = db.query(models.Employee).all()
    return employees

# --- POST create employee ---
@router.post("/")
def create_employee(
    employee_data: EmployeeCreate,
    current_user: models.User = Depends(require_roles(["Admin"])),
    db: Session = Depends(get_db)
):
    # Check if user exists
    user = db.query(models.User).filter(models.User.user_id == employee_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if employee already exists for this user
    existing = db.query(models.Employee).filter(models.Employee.user_id == employee_data.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee already exists for this user")
    
    # Create new employee
    new_employee = models.Employee(
        employee_id=str(uuid.uuid4()),
        user_id=employee_data.user_id,
        first_name=employee_data.first_name,
        last_name=employee_data.last_name,
        email=employee_data.email,
        department=employee_data.department,
        designation=employee_data.designation,
        status="active"
    )
    
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return new_employee

# --- GET employee by ID ---
@router.get("/{employee_id}")
def get_employee_by_id(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee