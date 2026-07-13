from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from fastapi import HTTPException
from app.services.audit_service import create_audit_log


# def create_employee(db: Session, employee: EmployeeCreate):

#     db_employee = Employee(
#         employee_id=employee.employee_id,
#         full_name=employee.full_name,
#         email=employee.email,
#         department=employee.department,
#         designation=employee.designation,
#         manager=employee.manager
#     )

#     db.add(db_employee)
#     db.commit()
#     db.refresh(db_employee)

#     return db_employee




def create_employee(db: Session, employee: EmployeeCreate):

    existing_employee_id = db.query(Employee).filter(
        Employee.employee_id == employee.employee_id
    ).first()

    if existing_employee_id:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists."
        )

    existing_email = db.query(Employee).filter(
        Employee.email == employee.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Employee email already exists."
        )

    db_employee = Employee(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email,
        department=employee.department,
        designation=employee.designation,
        manager=employee.manager
    )

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    create_audit_log(
    db=db,
    user_id=None,
    action="CREATE_EMPLOYEE",
    status="SUCCESS",
    description=f"Employee {db_employee.employee_id} created."
)

    return db_employee

def get_all_employees(db: Session):

    return db.query(Employee).all()


def get_employee(db: Session, employee_id: int):

    return db.query(Employee).filter(
        Employee.id == employee_id
    ).first()


def update_employee(
    db: Session,
    employee_id: int,
    employee: EmployeeUpdate
):

    db_employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not db_employee:
        return None

    db_employee.full_name = employee.full_name
    db_employee.department = employee.department
    db_employee.designation = employee.designation
    db_employee.manager = employee.manager
    db_employee.risk_score = employee.risk_score
    db_employee.is_active = employee.is_active

    db.commit()
    db.refresh(db_employee)

    create_audit_log(
    db=db,
    user_id=None,
    action="UPDATE_EMPLOYEE",
    status="SUCCESS",
    description=f"Employee {db_employee.employee_id} updated."
)

    return db_employee


def delete_employee(
    db: Session,
    employee_id: int
):

    db_employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not db_employee:
        return False

    db.delete(db_employee)
    db.commit()

    create_audit_log(
    db=db,
    user_id=None,
    action="DELETE_EMPLOYEE",
    status="SUCCESS",
    description=f"Employee {db_employee.employee_id} deleted."
)

    return True