from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.models import Investigation, InvestigationTimeline, Employee, RiskScore, Device, ActivityLog, Anomaly, User
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/investigations", tags=["Threat Investigation Module"])

class InvestigationCreate(BaseModel):
    title: str
    employee_id: int
    severity: str = "High"
    summary: str
    assigned_analyst_name: Optional[str] = "Unassigned"

class InvestigationStatusUpdate(BaseModel):
    status: str # Open, In Progress, Closed
    assigned_analyst_name: Optional[str] = None
    resolution_notes: Optional[str] = None

class TimelineEventCreate(BaseModel):
    event_type: str
    description: str
    details: Optional[Dict[str, Any]] = None

@router.get("")
def get_investigations(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves all investigation cases with optional filtering."""
    query = db.query(Investigation)
    if status:
        query = query.filter(Investigation.status == status)
    if severity:
        query = query.filter(Investigation.severity == severity)
    if search:
        query = query.filter(
            (Investigation.title.ilike(f"%{search}%")) |
            (Investigation.summary.ilike(f"%{search}%"))
        )

    cases = query.order_by(Investigation.created_at.desc()).all()
    result = []

    for c in cases:
        emp_data = None
        if c.employee:
            risk = db.query(RiskScore).filter(RiskScore.employee_id == c.employee.id).first()
            emp_data = {
                "id": c.employee.id,
                "employee_id": c.employee.employee_id,
                "name": c.employee.name,
                "email": c.employee.email,
                "department": c.employee.department.name if c.employee.department else "General",
                "designation": c.employee.designation,
                "risk_score": risk.risk_score if risk else 0.0,
                "risk_level": risk.risk_level if risk else "Low Risk"
            }

        result.append({
            "id": c.id,
            "title": c.title,
            "severity": c.severity,
            "status": c.status,
            "assigned_analyst_name": c.assigned_analyst_name,
            "summary": c.summary,
            "resolution_notes": c.resolution_notes,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "employee": emp_data
        })
    return result

@router.post("", status_code=status.HTTP_201_CREATED)
def create_investigation(
    payload: InvestigationCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Creates a new threat investigation case."""
    emp = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Gather evidence payload from anomalies and logs
    anomalies = db.query(Anomaly).filter(Anomaly.employee_id == emp.id).all()
    logs = db.query(ActivityLog).filter(ActivityLog.employee_id == emp.id).all()

    evidence = {
        "anomalies_count": len(anomalies),
        "recent_anomalies": [{"category": a.category, "severity": a.severity, "score": a.anomaly_score, "description": a.description} for a in anomalies[:5]],
        "logs_count": len(logs),
        "monitored_devices": [d.device_id for d in (emp.devices or [])]
    }

    inv = Investigation(
        title=payload.title,
        employee_id=emp.id,
        severity=payload.severity,
        status="Open",
        summary=payload.summary,
        assigned_analyst_name=payload.assigned_analyst_name or current_user.username,
        evidence_payload=evidence
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)

    # Create initial timeline entry
    timeline_entry = InvestigationTimeline(
        investigation_id=inv.id,
        event_type="Case Created",
        description=f"Investigation case created by {current_user.username}. Initial severity set to {payload.severity}.",
        details={"created_by": current_user.username}
    )
    db.add(timeline_entry)
    db.commit()

    return {"message": "Investigation case created successfully", "id": inv.id}

@router.get("/{investigation_id}")
def get_investigation_details(
    investigation_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieves deep-dive investigation details, activity timeline, evidence payload, and device analysis."""
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation case not found")

    emp = inv.employee
    emp_data = None
    risk_data = None
    devices_data = []
    logs_data = []

    if emp:
        risk = db.query(RiskScore).filter(RiskScore.employee_id == emp.id).first()
        if risk:
            risk_data = {
                "score": risk.risk_score,
                "level": risk.risk_level,
                "components": {
                    "behavioral_anomaly_score": risk.behavioral_anomaly_score,
                    "privilege_misuse_score": risk.privilege_misuse_score,
                    "data_access_score": risk.data_access_score,
                    "access_pattern_score": risk.access_pattern_score,
                    "historical_event_score": risk.historical_event_score
                },
                "explanation": risk.explanation,
                "threat_prediction": risk.threat_prediction
            }

        emp_data = {
            "id": emp.id,
            "employee_id": emp.employee_id,
            "name": emp.name,
            "email": emp.email,
            "department": emp.department.name if emp.department else "General",
            "designation": emp.designation,
            "access_privileges": emp.access_privileges
        }

        devices = db.query(Device).filter(Device.employee_id == emp.id).all()
        for d in devices:
            devices_data.append({
                "device_id": d.device_id,
                "device_name": d.device_name,
                "device_type": d.device_type,
                "ip_address": d.ip_address,
                "mac_address": d.mac_address,
                "status": d.status
            })

        activity_logs = db.query(ActivityLog).filter(ActivityLog.employee_id == emp.id).order_by(ActivityLog.timestamp.desc()).limit(20).all()
        for l in activity_logs:
            logs_data.append({
                "id": l.id,
                "event_type": l.event_type,
                "timestamp": l.timestamp,
                "severity": l.severity,
                "details": l.details
            })

    timeline = db.query(InvestigationTimeline).filter(InvestigationTimeline.investigation_id == inv.id).order_by(InvestigationTimeline.timestamp.asc()).all()
    timeline_data = [
        {
            "id": t.id,
            "event_type": t.event_type,
            "description": t.description,
            "timestamp": t.timestamp,
            "details": t.details
        } for t in timeline
    ]

    return {
        "id": inv.id,
        "title": inv.title,
        "severity": inv.severity,
        "status": inv.status,
        "assigned_analyst_name": inv.assigned_analyst_name,
        "summary": inv.summary,
        "resolution_notes": inv.resolution_notes,
        "evidence_payload": inv.evidence_payload,
        "created_at": inv.created_at,
        "updated_at": inv.updated_at,
        "employee": emp_data,
        "risk_profile": risk_data,
        "devices": devices_data,
        "recent_logs": logs_data,
        "timeline": timeline_data
    }

@router.put("/{investigation_id}/status")
def update_investigation_status(
    investigation_id: int,
    payload: InvestigationStatusUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Updates investigation status, analyst assignment, or resolution notes."""
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation case not found")

    old_status = inv.status
    inv.status = payload.status

    if payload.assigned_analyst_name:
        inv.assigned_analyst_name = payload.assigned_analyst_name

    if payload.resolution_notes:
        inv.resolution_notes = payload.resolution_notes

    inv.updated_at = datetime.utcnow()

    # Add timeline note
    t_entry = InvestigationTimeline(
        investigation_id=inv.id,
        event_type=f"Status -> {payload.status}",
        description=f"Status updated from {old_status} to {payload.status} by {current_user.username}. Analyst: {inv.assigned_analyst_name}.",
        details={"updated_by": current_user.username, "notes": payload.resolution_notes}
    )
    db.add(t_entry)
    db.commit()

    return {"message": "Investigation updated successfully", "id": inv.id, "status": inv.status}

@router.post("/{investigation_id}/timeline")
def add_timeline_event(
    investigation_id: int,
    payload: TimelineEventCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Adds a manual timeline event or analyst note to an investigation case."""
    inv = db.query(Investigation).filter(Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation case not found")

    t_entry = InvestigationTimeline(
        investigation_id=inv.id,
        event_type=payload.event_type,
        description=payload.description,
        details=payload.details
    )
    db.add(t_entry)
    db.commit()

    return {"message": "Timeline event added", "id": t_entry.id}
