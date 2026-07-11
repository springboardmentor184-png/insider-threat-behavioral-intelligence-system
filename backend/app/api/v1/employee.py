from fastapi import APIRouter, Depends, status, Request, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.dependencies import get_db, get_current_user, require_roles
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, PaginatedEmployeeResponse, EmployeeDetailResponse
from app.services import employee_service
from app.models.employee import Employee

router = APIRouter()

@router.get("/profile", response_model=EmployeeDetailResponse, status_code=status.HTTP_200_OK, summary="Get Current Employee Profile")
def get_profile(request: Request, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    """
    Return the profile of the currently authenticated employee. Available to all authenticated users.
    """
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
    """
    Return a paginated list of employees. Security Analysts and Administrators only.
    """
    return employee_service.get_employees(db, request, current_user, page, limit, search, department, role, is_active)

@router.get("/{employee_id}", response_model=EmployeeDetailResponse, status_code=status.HTTP_200_OK, summary="Get Full Employee Details")
def get_employee(
    employee_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))
):
    """
    Retrieve full enterprise details of a specific employee by ID. Security Analysts and Administrators only.
    """
    return employee_service.get_employee_by_id(db, employee_id, request, current_user)

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED, summary="Create New Employee")
def create_new_employee(
    req: EmployeeCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator"]))
):
    """
    Create a new employee profile. Administrator access required.
    """
    return employee_service.create_employee(db, req, request, current_user)

@router.put("/{employee_id}", response_model=EmployeeResponse, status_code=status.HTTP_200_OK, summary="Update Employee Details")
def update_existing_employee(
    employee_id: str,
    req: EmployeeUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator"]))
):
    """
    Update an existing employee's details. Does not allow changing UUID. Administrator access required.
    """
    return employee_service.update_employee(db, employee_id, req, request, current_user)

@router.delete("/{employee_id}", status_code=status.HTTP_200_OK, summary="Soft Delete Employee")
def delete_existing_employee(
    employee_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(require_roles(["Administrator"]))
):
    """
    Soft-delete an employee account, setting is_active to False and generating a deletion timestamp. Administrator access required.
    """
    return employee_service.delete_employee(db, employee_id, request, current_user)
