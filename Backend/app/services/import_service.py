import pandas as pd
from sqlalchemy.orm import Session

from app.models import Employee, BehaviorLog


def import_dataset(file_path: str, db: Session):

    df = pd.read_csv(file_path)

    employees_created = 0
    behavior_logs_created = 0

    for _, row in df.iterrows():

        # Check if employee already exists
        employee = db.query(Employee).filter(
            Employee.employee_id == row["employee_id"]
        ).first()

        # Create employee if not found
        if employee is None:
            employee = Employee(
                employee_id=row["employee_id"],
                full_name=row["full_name"],
                email=row["email"],
                department=row["department"],
                role=row["role"]
            )

            db.add(employee)
            db.flush()      # Get generated employee.id

            employees_created += 1

        # Create behavior log
        behavior = BehaviorLog(
            employee_id=employee.id,
            failed_logins=int(row["failed_logins"]),
            usb_used=bool(row["usb_used"]),
            after_hours_login=bool(row["after_hours_login"]),
            files_downloaded=int(row["files_downloaded"]),
            emails_sent=int(row["emails_sent"]),
            login_hour=int(row["login_hour"])
        )

        db.add(behavior)
        behavior_logs_created += 1

    db.commit()

    return {
        "status": "success",
        "employees_created": employees_created,
        "behavior_logs_created": behavior_logs_created
    }