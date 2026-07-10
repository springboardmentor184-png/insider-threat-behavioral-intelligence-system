import pandas as pd
from sqlalchemy.orm import Session
from database.models.activity_log import ActivityLog
from database.models.employee import Employee


def _resolve_employee_id(db: Session, employee_code: str) -> int | None:
    """CSV rows and manual entries refer to employees by their human-readable
    code (e.g. EMP001), but the activity_logs table stores the internal
    numeric employee_id (foreign key). This looks up that mapping."""
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