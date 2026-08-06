from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.models import Alert, Employee, RiskScore
from app.core.dependencies import get_current_user
from app.analytics.alert_engine import generate_security_alerts_from_risk

router = APIRouter(prefix="/alerts", tags=["Alert & Incident Management"])

class AlertAssignRequest(BaseModel):
    assigned_analyst_name: str
    status: Optional[str] = "Acknowledged" # Active, Acknowledged, Resolved

@router.get("")
def get_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves all security alerts with optional severity/status filters."""
    # Run auto-gen check if empty
    if db.query(Alert).count() == 0:
        generate_security_alerts_from_risk(db)

    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)

    alerts = query.order_by(Alert.created_at.desc()).all()
    result = []

    for a in alerts:
        emp_data = None
        if a.employee:
            risk = db.query(RiskScore).filter(RiskScore.employee_id == a.employee.id).first()
            emp_data = {
                "id": a.employee.id,
                "employee_id": a.employee.employee_id,
                "name": a.employee.name,
                "email": a.employee.email,
                "department": a.employee.department.name if a.employee.department else "General",
                "risk_score": risk.risk_score if risk else 0.0,
                "risk_level": risk.risk_level if risk else "Low Risk"
            }

        result.append({
            "id": a.id,
            "severity": a.severity,
            "reason": a.reason,
            "assigned_analyst_name": a.assigned_analyst_name,
            "status": a.status,
            "details": a.details,
            "created_at": a.created_at,
            "employee": emp_data
        })

    return result

@router.put("/{alert_id}/assign")
def assign_alert(
    alert_id: int,
    payload: AlertAssignRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Assigns an alert to a SOC analyst and updates status."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert record not found")

    alert.assigned_analyst_name = payload.assigned_analyst_name
    if payload.status:
        alert.status = payload.status

    db.commit()
    db.refresh(alert)
    return {"message": "Alert assigned successfully", "id": alert.id, "status": alert.status, "assigned_analyst": alert.assigned_analyst_name}

@router.post("/trigger-scan")
def trigger_alert_scan(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Executes automated risk threshold scan to generate alerts."""
    created = generate_security_alerts_from_risk(db)
    return {"message": f"Alert threshold scan completed. {created} new security alerts generated."}
