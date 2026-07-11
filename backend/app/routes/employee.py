from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeResponse

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


@router.get("/", response_model=list[EmployeeResponse])
def get_all_employees(db: Session = Depends(get_db)):
    return db.query(Employee).all()


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    return employee


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()

    return {"message": "Employee deleted successfully"}