from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate


def create_employee(db: Session, employee: EmployeeCreate):
    db_employee = Employee(
        full_name=employee.full_name,
        email=employee.email,
        password=employee.password
        role=employee.role
    )

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    return db_employee