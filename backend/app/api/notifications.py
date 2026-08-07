# backend/app/api/notifications.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from ..core.database import get_db
from ..core.security import require_roles
from ..models import models
from ..services.email_service import email_service

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])

class EmailAlertRequest(BaseModel):
    recipient_email: Optional[str] = "security.analyst@insiderthreat.io"
    employee_id: str = "33901353-84ca-11f1-9e39-e4fd457b80cb"
    employee_name: Optional[str] = "John Doe"
    risk_score: float = 78.5
    risk_level: str = "Critical Risk"
    anomalies_summary: str = "Unusual login at 02:14 AM, 4.8MB PDF file download, and unapproved USB insertion."

class EscalationRequest(BaseModel):
    alert_id: str
    target_role: str = "SOC Engineer"
    escalation_reason: str = "High confidence data exfiltration anomaly"

_notifications_log = [
    {
        "id": "NTF-101",
        "type": "CRITICAL",
        "title": "Off-Hours VPN Access Spike",
        "employee_name": "John Doe",
        "description": "User connected via VPN at 02:14 AM from 10.8.0.12",
        "timestamp": datetime.utcnow().isoformat(),
        "delivered_via": "Email + Console"
    },
    {
        "id": "NTF-102",
        "type": "WARNING",
        "title": "Unapproved USB Device Storage",
        "employee_name": "John Doe",
        "description": "SanDisk mass storage device attached to endpoint 192.168.1.45",
        "timestamp": datetime.utcnow().isoformat(),
        "delivered_via": "Console"
    }
]

@router.post("/send-email")
def send_email_notification(
    data: EmailAlertRequest,
    current_user: models.User = Depends(require_roles(["Admin", "Administrator", "Security Manager", "SOC Engineer", "Security Analyst", "Analyst"])),
    db: Session = Depends(get_db)
):
    """Dispatch real automated email security alert"""
    recipient = data.recipient_email or "security.analyst@insiderthreat.io"
    result = email_service.send_alert_email(
        recipient_email=recipient,
        employee_name=data.employee_name or "Monitored User",
        risk_score=data.risk_score,
        risk_level=data.risk_level,
        anomalies_summary=data.anomalies_summary
    )
    
    _notifications_log.insert(0, {
        "id": f"NTF-{len(_notifications_log) + 100}",
        "type": "CRITICAL" if data.risk_score >= 60 else "WARNING",
        "title": f"Security Alert Email Dispatched: {data.employee_name}",
        "employee_name": data.employee_name,
        "description": f"Email alert sent to {recipient}. Risk Score: {data.risk_score}%",
        "timestamp": datetime.utcnow().isoformat(),
        "delivered_via": f"Email ({email_service.smtp_user})"
    })
    
    return result

@router.get("/")
def get_notifications(
    current_user: models.User = Depends(require_roles(["Admin", "Administrator", "Security Manager", "SOC Engineer", "Security Analyst", "Analyst"]))
):
    """Retrieve security notification feed"""
    return {
        "total": len(_notifications_log),
        "notifications": _notifications_log
    }

@router.post("/escalate")
def escalate_alert(
    data: EscalationRequest,
    current_user: models.User = Depends(require_roles(["Admin", "Administrator", "Security Manager", "SOC Engineer", "Security Analyst", "Analyst"]))
):
    """Escalate alert to SOC or Security Manager"""
    _notifications_log.insert(0, {
        "id": f"NTF-{len(_notifications_log) + 100}",
        "type": "CRITICAL",
        "title": f"Alert Escalated to {data.target_role}",
        "employee_name": current_user.username,
        "description": f"Reason: {data.escalation_reason}",
        "timestamp": datetime.utcnow().isoformat(),
        "delivered_via": "SOC Escalation Queue"
    })
    
    return {
        "status": "success",
        "message": f"Alert {data.alert_id} successfully escalated to {data.target_role}",
        "escalated_by": current_user.username
    }
