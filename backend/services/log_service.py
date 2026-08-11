import pandas as pd
from sqlalchemy.orm import Session
from database.models.activity_log import ActivityLog
from database.models.employee import Employee


def _resolve_or_create_employee_id(db: Session, employee_code: str) -> int:
    """Like _resolve_employee_id, but auto-provisions a minimal employee
    record if the code isn't known yet — used for bulk log ingestion,
    where activity data may reference employees not yet fully onboarded."""
    employee = db.query(Employee).filter(Employee.employee_code == employee_code).first()
    if employee:
        return employee.id

    employee = Employee(
        employee_code=employee_code,
        full_name=employee_code,        # placeholder until real HR data links up
        department="Unassigned",
        designation="Unassigned",
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee.id


def ingest_cert_email_csv(db: Session, file_path: str) -> dict:
    df = pd.read_csv(file_path)

    inserted, skipped = 0, []
    for _, row in df.iterrows():
        try:
            employee_id = _resolve_or_create_employee_id(db, row["user"])
            log = ActivityLog(
                employee_id=employee_id,
                activity_type="email_sent",
                resource=str(row.get("to", ""))[:255],
                device=row.get("pc"),
                data_volume_mb=round(float(row.get("size", 0)) / 1_000_000, 4),
            )
            db.add(log)
            db.commit()
            inserted += 1
        except (ValueError, KeyError) as e:
            skipped.append({"row_id": str(row.get("id")), "reason": str(e)})

    return {"inserted": inserted, "skipped_count": len(skipped), "skipped": skipped[:20]}

def _resolve_employee_id(db: Session, employee_code: str) -> int | None:
    """Strict lookup — used for manual single-event logging, where a
    typo'd employee code should raise an error rather than silently
    creating a placeholder employee."""
    employee = db.query(Employee).filter(Employee.employee_code == employee_code).first()
    return employee.id if employee else None


def create_log_entry(db: Session, data: dict) -> ActivityLog:
    employee_id = _resolve_employee_id(db, data["employee_code"])
    if employee_id is None:
        raise ValueError(f"No employee found with code '{data['employee_code']}'")

    log = ActivityLog(
        employee_id=employee_id,
        activity_type=data["activity_type"],
        resource=data.get("resource"),
        ip_address=data.get("ip_address"),
        device=data.get("device"),
        data_volume_mb=data.get("data_volume_mb", 0.0),
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def ingest_csv(db: Session, file_path: str) -> dict:
    """Bulk-loads a CSV of historical activity logs. Rows referencing an
    unknown employee_code are skipped and reported back, rather than
    crashing the whole ingestion run."""
    df = pd.read_csv(file_path)

    inserted, skipped = 0, []
    for _, row in df.iterrows():
        try:
            create_log_entry(db, row.to_dict())
            inserted += 1
        except ValueError as e:
            skipped.append({"row": row.to_dict(), "reason": str(e)})

    return {"inserted": inserted, "skipped_count": len(skipped), "skipped": skipped}


def get_logs(db: Session, employee_id: int | None = None, activity_type: str | None = None, limit: int = 100):
    query = db.query(ActivityLog)
    if employee_id is not None:
        query = query.filter(ActivityLog.employee_id == employee_id)
    if activity_type is not None:
        query = query.filter(ActivityLog.activity_type == activity_type)
    return query.order_by(ActivityLog.timestamp.desc()).limit(limit).all()

def ingest_cert_email_csv(db: Session, file_path: str) -> dict:
    """Adapter for the real CERT insider-threat email.csv format.
    Maps CERT's columns onto our activity_logs schema:
      user -> employee_code, pc -> device, to -> resource,
      size (bytes) -> data_volume_mb, date -> timestamp."""
    df = pd.read_csv(file_path)

    inserted, skipped = 0, []
    for _, row in df.iterrows():
        try:
            data = {
                "employee_code": row["user"],
                "activity_type": "email_sent",
                "resource": str(row.get("to", ""))[:255],
                "ip_address": None,
                "device": row.get("pc"),
                "data_volume_mb": round(float(row.get("size", 0)) / 1_000_000, 4),
            }
            create_log_entry(db, data)
            inserted += 1
        except (ValueError, KeyError) as e:
            skipped.append({"row_id": str(row.get("id")), "reason": str(e)})

    return {"inserted": inserted, "skipped_count": len(skipped), "skipped": skipped[:20]}