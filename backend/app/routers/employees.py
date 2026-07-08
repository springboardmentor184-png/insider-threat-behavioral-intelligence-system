from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Employee, Device, Department
from app.schemas.schemas import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from app.core.dependencies import require_roles

router = APIRouter(prefix="/employees", tags=["Employee Management"])

@router.get("", response_model=List[EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"]))
):
    return db.query(Employee).all()

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    emp_in: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Administrator", "Security Manager"]))
):
    # Check if employee_id already exists
    if db.query(Employee).filter(Employee.employee_id == emp_in.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    # Check if email already exists
    if db.query(Employee).filter(Employee.email == emp_in.email).first():
        raise HTTPException(status_code=400, detail="Employee email already exists")
        
    # Check if department exists
    dept = db.query(Department).filter(Department.id == emp_in.department_id).first()
    if not dept:
        raise HTTPException(status_code=400, detail="Department does not exist")
        
    # Check manager if specified
    if emp_in.manager_id:
        mgr = db.query(Employee).filter(Employee.id == emp_in.manager_id).first()
        if not mgr:
            raise HTTPException(status_code=400, detail="Manager does not exist")
            
    db_emp = Employee(
        employee_id=emp_in.employee_id,
        name=emp_in.name,
        email=emp_in.email,
        department_id=emp_in.department_id,
        designation=emp_in.designation,
        manager_id=emp_in.manager_id,
        access_privileges=emp_in.access_privileges
    )
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    
    # Onboard devices if specified
    for dev in emp_in.devices:
        db_dev = Device(
            device_id=dev.device_id,
            device_name=dev.device_name,
            device_type=dev.device_type,
            ip_address=dev.ip_address,
            mac_address=dev.mac_address,
            employee_id=db_emp.id,
            status=dev.status
        )
        db.add(db_dev)
    
    db.commit()
    db.refresh(db_emp)
    return db_emp

@router.get("/{id}", response_model=EmployeeResponse)
def get_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"]))
):
    emp = db.query(Employee).filter(Employee.id == id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.put("/{id}", response_model=EmployeeResponse)
def update_employee(
    id: int,
    emp_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Administrator", "Security Manager"]))
):
    db_emp = db.query(Employee).filter(Employee.id == id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    # Verify unique constraints if changing email
    if emp_in.email and emp_in.email != db_emp.email:
        if db.query(Employee).filter(Employee.email == emp_in.email).first():
            raise HTTPException(status_code=400, detail="Email already taken")
            
    # Verify manager if changing manager
    if emp_in.manager_id:
        if emp_in.manager_id == id:
            raise HTTPException(status_code=400, detail="An employee cannot be their own manager")
        mgr = db.query(Employee).filter(Employee.id == emp_in.manager_id).first()
        if not mgr:
            raise HTTPException(status_code=400, detail="Manager does not exist")
            
    for var, val in vars(emp_in).items():
        if val is not None:
            setattr(db_emp, var, val)
            
    db.commit()
    db.refresh(db_emp)
    return db_emp

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["Administrator"]))
):
    db_emp = db.query(Employee).filter(Employee.id == id).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    # Delete related devices and logs to avoid orphan foreign keys in cascade
    db.query(Device).filter(Device.employee_id == id).update({Device.employee_id: None})
    db_emp = db.query(Employee).filter(Employee.id == id).first()
    db.delete(db_emp)
    db.commit()
    return None
