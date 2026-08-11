from sqlalchemy.orm import Session
from database.models.employee import Employee
import pandas as pd

def ingest_psychometric_csv(db: Session, file_path: str) -> dict:
    """Loads Big Five personality scores from the CERT psychometric dataset.
    Creates a new employee record if the code doesn't exist yet (with
    placeholder department/designation, since this file doesn't include
    that info), or updates the scores if the employee already exists."""
    df = pd.read_csv(file_path)

    created, updated = 0, 0
    for _, row in df.iterrows():
        code = row["user_id"]
        employee = db.query(Employee).filter(Employee.employee_code == code).first()

        scores = {
            "openness": row["O"],
            "conscientiousness": row["C"],
            "extraversion": row["E"],
            "agreeableness": row["A"],
            "neuroticism": row["N"],
        }

        if employee:
            for key, value in scores.items():
                setattr(employee, key, value)
            updated += 1
        else:
            employee = Employee(
                employee_code=code,
                full_name=row["employee_name"],
                department="Unassigned",
                designation="Unassigned",
                **scores,
            )
            db.add(employee)
            created += 1

    db.commit()
    return {"created": created, "updated": updated}

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