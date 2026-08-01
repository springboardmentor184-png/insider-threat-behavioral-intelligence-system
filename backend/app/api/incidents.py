from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from app.core.dependencies import get_db
from app.core.roles import require_roles
from app.models.user import User
from app.models.incident import Incident
from app.models.activity import Activity
from app.schemas.incident import IncidentResponse, IncidentCreate, IncidentUpdate

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    employee_id: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    query = db.query(Incident)
    if employee_id:
        query = query.filter(Incident.employee_id == employee_id)
    if severity:
        query = query.filter(Incident.severity == severity)
    if status:
        query = query.filter(Incident.status == status)
    return query.order_by(Incident.created_at.desc()).all()

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_by_id(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return incident

@router.post("", response_model=IncidentResponse)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    incident = Incident(
        title=incident_data.title,
        description=incident_data.description,
        severity=incident_data.severity,
        status="Open",
        employee_id=incident_data.employee_id,
        assigned_to=incident_data.assigned_to or current_user.email,
        timeline="[]",
        evidence="[]"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
        
    if incident_data.title is not None:
        incident.title = incident_data.title
    if incident_data.description is not None:
        incident.description = incident_data.description
    if incident_data.severity is not None:
        incident.severity = incident_data.severity
    if incident_data.status is not None:
        incident.status = incident_data.status
    if incident_data.assigned_to is not None:
        incident.assigned_to = incident_data.assigned_to
    if incident_data.timeline is not None:
        incident.timeline = incident_data.timeline
    if incident_data.evidence is not None:
        incident.evidence = incident_data.evidence
        
    db.commit()
    db.refresh(incident)
    return incident

@router.get("/{incident_id}/timeline")
def get_incident_timeline(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
        
    # Get all activities for the employee in chronological order
    from app.models.employee import Employee
    emp = db.query(Employee).filter(Employee.employee_id == incident.employee_id).first()
    if not emp:
        return []
        
    # Fetch all activity records for this employee's email
    activities = db.query(Activity).filter(Activity.performed_by == emp.email).order_by(Activity.timestamp.asc()).all()
    
    # We will build a list of activity details
    timeline_list = []
    for act in activities:
        desc_parsed = {}
        try:
            desc_parsed = json.loads(act.description) if act.description else {}
        except Exception:
            desc_parsed = {"details": act.description}
            
        timeline_list.append({
            "id": act.id,
            "activity_name": act.activity_name,
            "status": act.status,
            "timestamp": act.timestamp.isoformat(),
            "description": desc_parsed
        })
        
    return timeline_list

@router.post("/{incident_id}/evidence", response_model=IncidentResponse)
def add_incident_evidence(
    incident_id: int,
    evidence_text: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
        
    # Load current evidence
    evidence_list = []
    if incident.evidence:
        try:
            evidence_list = json.loads(incident.evidence)
        except Exception:
            pass
            
    # Add new item
    evidence_list.append({
        "timestamp": datetime.utcnow().isoformat(),
        "added_by": current_user.full_name or current_user.username,
        "content": evidence_text
    })
    
    incident.evidence = json.dumps(evidence_list)
    db.commit()
    db.refresh(incident)
    return incident
