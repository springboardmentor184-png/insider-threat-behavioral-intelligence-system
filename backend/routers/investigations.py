"""
API Router for Threat Investigation & Incident Management (Module 7 & 9).
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from pydantic import BaseModel

from backend.core.database import get_db
from backend.models.user import User
from backend.routers.deps import get_current_user
from backend.services.investigation_service import InvestigationService
from backend.services.notification_service import NotificationService

router = APIRouter(prefix="/api/investigations", tags=["Threat Investigations"])


class IncidentCreateSchema(BaseModel):
    employee_id: str
    title: str
    description: str
    severity: str = "Medium"
    assigned_analyst: Optional[str] = None


class IncidentUpdateSchema(BaseModel):
    status: Optional[str] = None
    assigned_analyst: Optional[str] = None
    severity: Optional[str] = None


class EvidenceCreateSchema(BaseModel):
    note: str
    anomaly_id: Optional[int] = None
    event_type: Optional[str] = None
    event_id: Optional[str] = None


@router.get("/")
async def list_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List investigation incident cases."""
    incidents = await InvestigationService.get_all_incidents(db, status=status, severity=severity, search=search)
    results = []
    for inc in incidents:
        results.append({
            "id": inc.id,
            "incident_number": inc.incident_number,
            "employee_id": inc.employee_id,
            "title": inc.title,
            "description": inc.description,
            "severity": inc.severity,
            "status": inc.status,
            "assigned_analyst": inc.assigned_analyst,
            "created_by": inc.created_by,
            "created_at": inc.created_at.isoformat(),
            "evidence_count": len(inc.evidence) if inc.evidence else 0
        })
    return {"total_records": len(results), "data": results}


@router.post("/")
async def create_incident(
    data: IncidentCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new threat investigation incident case."""
    inc = await InvestigationService.create_incident(
        db,
        employee_id=data.employee_id,
        title=data.title,
        description=data.description,
        severity=data.severity,
        created_by=current_user.email,
        assigned_analyst=data.assigned_analyst or current_user.email
    )
    # Trigger notification
    await NotificationService.create_notification(
        db,
        user_email=data.assigned_analyst or current_user.email,
        title=f"New Incident Assigned: {inc.incident_number}",
        message=f"You have been assigned to investigate {inc.incident_number} for EMP-{data.employee_id}.",
        category="Investigation"
    )
    return inc


@router.get("/{incident_id}")
async def get_incident_details(
    incident_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get full incident case details including evidence items."""
    incidents = await InvestigationService.get_all_incidents(db)
    target = next((i for i in incidents if i.id == incident_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Incident case not found")

    evidence_items = []
    if target.evidence:
        for ev in target.evidence:
            evidence_items.append({
                "id": ev.id,
                "anomaly_id": ev.anomaly_id,
                "event_type": ev.event_type,
                "event_id": ev.event_id,
                "note": ev.note,
                "added_by": ev.added_by,
                "created_at": ev.created_at.isoformat()
            })

    return {
        "id": target.id,
        "incident_number": target.incident_number,
        "employee_id": target.employee_id,
        "title": target.title,
        "description": target.description,
        "severity": target.severity,
        "status": target.status,
        "assigned_analyst": target.assigned_analyst,
        "created_by": target.created_by,
        "created_at": target.created_at.isoformat(),
        "evidence": evidence_items
    }


@router.patch("/{incident_id}")
async def update_incident(
    incident_id: int,
    data: IncidentUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update status, assignment, or severity for an incident."""
    try:
        updated = await InvestigationService.update_incident(
            db,
            incident_id,
            status=data.status,
            assigned_analyst=data.assigned_analyst,
            severity=data.severity
        )
        if data.status == "Escalated":
            await NotificationService.create_notification(
                db,
                user_email="all",
                title=f"Incident Escalated: {updated.incident_number}",
                message=f"Incident {updated.incident_number} for EMP-{updated.employee_id} has been escalated to Critical status.",
                category="Escalation"
            )
        return updated
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{incident_id}/evidence")
async def add_incident_evidence(
    incident_id: int,
    data: EvidenceCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Attach evidence or notes to an incident case."""
    return await InvestigationService.attach_evidence(
        db,
        incident_id=incident_id,
        added_by=current_user.email,
        note=data.note,
        anomaly_id=data.anomaly_id,
        event_type=data.event_type,
        event_id=data.event_id
    )


@router.get("/timeline/{employee_id}")
async def get_activity_timeline(
    employee_id: str,
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetch correlated chronological activity timeline for an employee."""
    return await InvestigationService.get_activity_timeline(db, employee_id, limit=limit)
