from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.security import get_current_user, require_role
from app.models import User, Employee
from app.database import get_db
from app.schemas import EmployeeCreate, EmployeeResponse


router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


# =====================================================
# CREATE Employee
# Administrator Only
# =====================================================

@router.post(
    "/",
    response_model=EmployeeResponse
)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator")
    )
):

    db_employee = Employee(
        **employee.model_dump()
    )

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    return db_employee


# =====================================================
# GET All Employees
# Administrator + Security Analyst
# =====================================================

@router.get(
    "/",
    response_model=list[EmployeeResponse]
)
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(
            "Administrator",
            "Security Analyst"
        )
    )
):

    employees = (
        db.query(Employee)
        .order_by(Employee.employee_id.asc())
        .all()
    )

    return employees


# =====================================================
# GET Employee by ID
# Administrator + Security Analyst
# =====================================================

@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(
            "Administrator",
            "Security Analyst"
        )
    )
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee


# =====================================================
# UPDATE Employee
# Administrator Only
# =====================================================

@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def update_employee(
    employee_id: int,
    updated_employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator")
    )
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    for key, value in updated_employee.model_dump().items():

        setattr(
            employee,
            key,
            value
        )

    db.commit()
    db.refresh(employee)

    return employee


# =====================================================
# DELETE Employee
# Administrator Only
# =====================================================

@router.delete(
    "/{employee_id}"
)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator")
    )
):

    employee = (
        db.query(Employee)
        .filter(
            Employee.id == employee_id
        )
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Employee deleted successfully"
    }