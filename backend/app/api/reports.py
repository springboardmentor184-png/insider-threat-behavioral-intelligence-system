from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.roles import require_roles
from app.models.user import User
from app.services.report_service import (
    generate_risk_report_csv,
    generate_alerts_report_csv,
    generate_incidents_report_csv,
    generate_audit_report_csv
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports & Export"]
)

@router.get("/export/{report_type}")
def export_report_csv(
    report_type: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    if report_type == "risk":
        csv_data = generate_risk_report_csv(db)
        filename = "employee_risk_report.csv"
    elif report_type == "alerts":
        csv_data = generate_alerts_report_csv(db)
        filename = "security_alerts_report.csv"
    elif report_type == "incidents":
        csv_data = generate_incidents_report_csv(db)
        filename = "investigations_report.csv"
    elif report_type == "audit":
        # Only admin should export system audits
        if current_user.role != "Administrator":
            raise HTTPException(status_code=403, detail="Only Administrators can export system audit logs.")
        csv_data = generate_audit_report_csv(db)
        filename = "system_audit_logs.csv"
    else:
        raise HTTPException(status_code=400, detail="Invalid report type. Supported types: risk, alerts, incidents, audit.")
        
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
