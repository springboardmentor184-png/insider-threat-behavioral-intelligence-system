import io
import csv
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database.db import get_db
from database.models.employee import Employee
from database.models.activity_log import ActivityLog
from utils.security import require_role

router = APIRouter(prefix="/reports", tags=["Reports & Export"])


@router.get("/employees/export-csv")
def export_employees_csv(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager")),
):
    employees = db.query(Employee).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["employee_code", "full_name", "department", "access_level", "risk_score"])
    for e in employees:
        writer.writerow([e.employee_code, e.full_name, e.department, e.access_level, e.risk_score])
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employee_risk_report.csv"},
    )


@router.get("/anomalies/export-csv")
def export_anomalies_csv(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager")),
):
    logs = db.query(ActivityLog).filter(ActivityLog.is_flagged == 1).all()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["employee_id", "activity_type", "resource", "device", "data_volume_mb", "timestamp"])
    for l in logs:
        writer.writerow([l.employee_id, l.activity_type, l.resource, l.device, l.data_volume_mb, l.timestamp])
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=anomaly_report.csv"},
    )


@router.get("/summary")
def summary_report(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager")),
):
    total_employees = db.query(Employee).count()
    total_flagged = db.query(ActivityLog).filter(ActivityLog.is_flagged == 1).count()
    critical = db.query(Employee).filter(Employee.risk_score >= 75).count()
    high = db.query(Employee).filter(Employee.risk_score >= 50, Employee.risk_score < 75).count()
    return {
        "total_employees": total_employees,
        "total_flagged_events": total_flagged,
        "critical_risk_employees": critical,
        "high_risk_employees": high,
    }