from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.roles import require_roles

from app.models.user import User

from app.schemas.employee import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse
)

from app.services.employee_service import (
    create_employee,
    get_all_employees,
    get_employee,
    update_employee,
    delete_employee
)

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.get(
    "",
    response_model=list[EmployeeResponse]
)
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([
            "Administrator",
            "Security Manager",
            "SOC Engineer",
            "Security Analyst"
        ])
    )
):
    return get_all_employees(db)


@router.post(
    "",
    response_model=EmployeeResponse
)
def add_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([
            "Administrator",
            "Security Manager"
        ])
    )
):
    return create_employee(db, employee)


@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def get_employee_by_id(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([
            "Administrator",
            "Security Manager",
            "SOC Engineer",
            "Security Analyst"
        ])
    )
):
    employee = get_employee(db, employee_id)

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    return employee


@router.put(
    "/{employee_id}",
    response_model=EmployeeResponse
)
def edit_employee(
    employee_id: int,
    employee: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([
            "Administrator",
            "Security Manager"
        ])
    )
):
    updated = update_employee(
        db,
        employee_id,
        employee
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    return updated


@router.delete("/{employee_id}")
def remove_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([
            "Administrator"
        ])
    )
):

    deleted = delete_employee(
        db,
        employee_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Employee not found."
        )

    return {
        "message": "Employee deleted successfully."
    }