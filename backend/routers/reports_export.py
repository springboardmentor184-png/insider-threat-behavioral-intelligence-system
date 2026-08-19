"""
API Router for Reports & Export System (Module 12).
Serves Excel (.xlsx) downloads across 5 categories:
  - Insider Threat Reports
  - Behavioral Analytics Reports
  - Investigation Reports
  - Compliance Reports
  - Risk Assessment Reports
"""

import io
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from backend.core.database import get_db
from backend.models.user import User
from backend.routers.deps import get_current_user
from backend.services.export_service import ExportService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reports/export", tags=["Reports & Export"])


@router.get("/excel")
async def export_report_excel(
    category: str = "insider_threat",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Download a formatted Excel (.xlsx) spreadsheet for any report category.
    categories: insider_threat, behavioral_analytics, investigation, compliance, risk_assessment
    """
    excel_stream = await ExportService.generate_excel_report(db, category)
    filename = f"itbis_{category.lower().replace(' ', '_')}_report.xlsx"

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"'
    }

    return StreamingResponse(
        excel_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )


@router.post("/email-employee-report/{employee_id}")
async def email_individual_employee_report(
    employee_id: str,
    manager_email: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate and email a full individual employee anomaly detection report to managers/administrators.
    """
    from sqlalchemy import select, desc
    from backend.models.dataset import Employee, BehavioralAnomaly
    from backend.models.user import User
    from backend.models.enums import UserRole
    from backend.services.risk_scorer import RiskScorerService
    from backend.services.email_service import EmailService

    clean_id = employee_id.replace("EMP-", "").strip()
    emp_stmt = select(Employee).where((Employee.employee_id == employee_id) | (Employee.employee_id == clean_id))
    emp = (await db.execute(emp_stmt)).scalar_one_or_none()

    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee EMP-{clean_id} not found in database.")

    # Fetch employee anomalies
    anom_stmt = select(BehavioralAnomaly).where(BehavioralAnomaly.employee_id == emp.employee_id).order_by(desc(BehavioralAnomaly.timestamp))
    anomalies = (await db.execute(anom_stmt)).scalars().all()

    risk_cat = RiskScorerService.categorize_risk(emp.risk_score)

    # Ensure an Investigation Incident Case exists for this employee in database
    from backend.models.dataset import Incident
    from backend.services.investigation_service import InvestigationService

    inc_stmt = select(Incident).where(
        (Incident.employee_id.in_([emp.employee_id, clean_id, f"EMP-{clean_id}"])) & 
        (Incident.status.in_(["Open", "Under Investigation"]))
    )
    existing_inc = (await db.execute(inc_stmt)).scalar_one_or_none()
    if not existing_inc:
        try:
            await InvestigationService.create_incident(
                db,
                employee_id=emp.employee_id,
                title=f"Behavioral Threat Investigation: EMP-{emp.employee_id}",
                description=f"Auto-generated investigation case for {emp.full_name} (EMP-{emp.employee_id}) generated from manager email anomaly report.",
                severity="High" if emp.risk_score >= 60 else "Medium",
                created_by="ITBIS Report Engine",
                assigned_analyst="Unassigned"
            )
        except Exception as inc_err:
            logger.warning(f"[REPORTS INCIDENT AUTO-CREATE WARNING] {inc_err}")

    # Determine recipient managers
    recipients = []
    if manager_email and "@" in manager_email:
        recipients.append(manager_email)
    
    # Also add administrators and security managers
    mgr_stmt = select(User.email).where(User.role.in_([UserRole.ADMINISTRATOR, UserRole.SECURITY_MANAGER]))
    mgr_emails = list((await db.execute(mgr_stmt)).scalars().all())
    for e in mgr_emails:
        if e not in recipients:
            recipients.append(e)

    if not recipients:
        recipients = ["admin@itbis.com", "manager@itbis.com"]

    anom_list = [
        {
            "category": a.category,
            "severity": a.severity,
            "description": a.description,
            "pc": a.pc or "N/A",
            "timestamp": a.timestamp.strftime("%Y-%m-%d %H:%M UTC")
        }
        for a in anomalies
    ]

    sent = await EmailService.send_employee_anomaly_report_email(
        recipients=recipients,
        employee_id=emp.employee_id,
        employee_name=emp.full_name,
        department=emp.department or "General",
        risk_score=emp.risk_score,
        risk_category=risk_cat,
        anomalies=anom_list
    )

    if not sent:
        raise HTTPException(status_code=500, detail="Failed to send email report. Verify SMTP configuration.")

    return {
        "status": "success",
        "message": f"Individual employee anomaly report successfully dispatched to {len(recipients)} recipient(s).",
        "recipients": recipients
    }


@router.get("/employee-activities-csv/{employee_id}")
async def export_employee_activities_csv(
    employee_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Export all chronological activity logs for a specific employee as a CSV file."""
    import csv
    from backend.services.investigation_service import InvestigationService
    clean_id = employee_id.replace("EMP-", "").strip()
    timeline = await InvestigationService.get_activity_timeline(db, clean_id, limit=300)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Employee ID", "PC Host", "Event Type", "Activity Action", "Details"])
    
    for item in timeline.get("timeline", []):
        writer.writerow([
            item.get("timestamp"),
            f"EMP-{clean_id}",
            item.get("pc", "N/A"),
            item.get("type"),
            item.get("activity"),
            item.get("details", "")
        ])
    
    csv_bytes = output.getvalue().encode("utf-8")
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=itbis_employee_{clean_id}_activities.csv"}
    )
