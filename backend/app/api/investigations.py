# backend/app/api/investigations.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from ..core.database import get_db
from ..core.security import require_roles
from ..models import models
from ..models.investigation_models import Investigation, InvestigationNote, InvestigationEvidence
from ..core.mongodb import activity_collection

router = APIRouter(prefix="/investigations", tags=["Investigations"])


# --- Pydantic Models ---
class InvestigationCreate(BaseModel):
    employee_id: str
    title: str
    description: Optional[str] = None
    priority: str = "Medium"
    assigned_to: Optional[str] = None


class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = None


class NoteCreate(BaseModel):
    content: str


class EvidenceCreate(BaseModel):
    evidence_type: str
    evidence_reference: str
    description: Optional[str] = None


# --- Endpoints ---

@router.post("/")
def create_investigation(
    data: InvestigationCreate,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer"])),
    db: Session = Depends(get_db)
):
    """Create a new investigation"""
    
    # Check if employee exists
    employee = db.query(models.Employee).filter(models.Employee.employee_id == data.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Create investigation
    investigation = Investigation(
        employee_id=data.employee_id,
        title=data.title,
        description=data.description,
        priority=data.priority,
        assigned_to=data.assigned_to,
        created_by=current_user.username,
        status="Open"
    )
    
    db.add(investigation)
    db.commit()
    db.refresh(investigation)
    
    return {
        "message": "Investigation created successfully",
        "investigation": investigation.to_dict()
    }


@router.get("/")
def get_investigations(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    employee_id: Optional[str] = Query(None, description="Filter by employee"),
    limit: int = Query(50, ge=1, le=100),
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    """Get all investigations with optional filters"""
    
    query = db.query(Investigation)
    
    if status:
        query = query.filter(Investigation.status == status)
    if priority:
        query = query.filter(Investigation.priority == priority)
    if employee_id:
        query = query.filter(Investigation.employee_id == employee_id)
    
    investigations = query.order_by(Investigation.created_at.desc()).limit(limit).all()
    
    return {
        "total": len(investigations),
        "investigations": [inv.to_dict() for inv in investigations]
    }


@router.get("/{investigation_id}")
def get_investigation(
    investigation_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    """Get a specific investigation with all details"""
    
    investigation = db.query(Investigation).filter(Investigation.investigation_id == investigation_id).first()
    if not investigation:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    # Get notes
    notes = db.query(InvestigationNote).filter(
        InvestigationNote.investigation_id == investigation_id
    ).order_by(InvestigationNote.created_at.desc()).all()
    
    # Get evidence
    evidence = db.query(InvestigationEvidence).filter(
        InvestigationEvidence.investigation_id == investigation_id
    ).all()
    
    result = investigation.to_dict()
    result["notes"] = [note.to_dict() for note in notes]
    result["evidence"] = [ev.to_dict() for ev in evidence]
    
    # Get employee details
    employee = db.query(models.Employee).filter(
        models.Employee.employee_id == investigation.employee_id
    ).first()
    
    if employee:
        result["employee_name"] = f"{employee.first_name} {employee.last_name}"
        result["department"] = employee.department
    
    return result


@router.put("/{investigation_id}")
def update_investigation(
    investigation_id: str,
    data: InvestigationUpdate,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer"])),
    db: Session = Depends(get_db)
):
    """Update an investigation"""
    
    investigation = db.query(Investigation).filter(Investigation.investigation_id == investigation_id).first()
    if not investigation:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    if data.title is not None:
        investigation.title = data.title
    if data.description is not None:
        investigation.description = data.description
    if data.status is not None:
        investigation.status = data.status
        if data.status == "Closed":
            investigation.closed_at = datetime.now()
    if data.priority is not None:
        investigation.priority = data.priority
    if data.assigned_to is not None:
        investigation.assigned_to = data.assigned_to
    
    db.commit()
    db.refresh(investigation)
    
    return {
        "message": "Investigation updated successfully",
        "investigation": investigation.to_dict()
    }


@router.post("/{investigation_id}/notes")
def add_note(
    investigation_id: str,
    data: NoteCreate,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer"])),
    db: Session = Depends(get_db)
):
    """Add a note to an investigation"""
    
    investigation = db.query(Investigation).filter(Investigation.investigation_id == investigation_id).first()
    if not investigation:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    note = InvestigationNote(
        investigation_id=investigation_id,
        content=data.content,
        created_by=current_user.username
    )
    
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return {
        "message": "Note added successfully",
        "note": note.to_dict()
    }


@router.post("/{investigation_id}/evidence")
def add_evidence(
    investigation_id: str,
    data: EvidenceCreate,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer"])),
    db: Session = Depends(get_db)
):
    """Add evidence to an investigation"""
    
    investigation = db.query(Investigation).filter(Investigation.investigation_id == investigation_id).first()
    if not investigation:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    evidence = InvestigationEvidence(
        investigation_id=investigation_id,
        evidence_type=data.evidence_type,
        evidence_reference=data.evidence_reference,
        description=data.description,
        added_by=current_user.username
    )
    
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    
    return {
        "message": "Evidence added successfully",
        "evidence": evidence.to_dict()
    }