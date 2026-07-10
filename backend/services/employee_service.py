from sqlalchemy.orm import Session
from database.models.employee import Employee

def create_employee(db: Session, data: dict) -> Employee:
    existing = db.query(Employee).filter(Employee.employee_code == data["employee_code"]).first()
    if existing:
        raise ValueError("Employee code already exists")

    employee = Employee(**data)
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee

def get_all_employees(db: Session) -> list[Employee]:
    return db.query(Employee).order_by(Employee.id).all()

def get_employee_by_id(db: Session, employee_id: int) -> Employee | None:
    return db.query(Employee).filter(Employee.id == employee_id).first()

def update_employee(db: Session, employee_id: int, updates: dict) -> Employee | None:
    employee = get_employee_by_id(db, employee_id)
    if not employee:
        return None
    for key, value in updates.items():
        if value is not None:
            setattr(employee, key, value)
    db.commit()
    db.refresh(employee)
    return employee