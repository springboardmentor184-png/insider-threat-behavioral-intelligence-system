import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.investigation_service import InvestigationService
from app.repositories.investigation_repository import InvestigationRepository
from app.schemas.investigation import (
    InvestigationCreateRequest,
    InvestigationUpdateRequest,
    InvestigationAssignRequest,
    InvestigationNoteRequest,
    InvestigationStatusRequest,
    InvestigationDetailSchema,
    InvestigationQueueItemSchema,
    InvestigationDashboardStatsSchema,
)

router = APIRouter()


@router.get("/dashboard", response_model=InvestigationDashboardStatsSchema)
def get_investigation_dashboard(db: Session = Depends(get_db)):
    """
    Get executive SOC Investigation dashboard statistics, severity distributions, and department metrics.
    """
    try:
        return InvestigationService.get_dashboard_stats(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch dashboard stats: {str(e)}")


@router.get("", response_model=List[InvestigationQueueItemSchema])
@router.get("/", response_model=List[InvestigationQueueItemSchema])
def get_investigations(
    status_filter: Optional[str] = Query(None, alias="status"),
    severity_filter: Optional[str] = Query(None, alias="severity"),
    department_filter: Optional[str] = Query(None, alias="department"),
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Get list of investigation cases filtered by status, severity, department, or search query.
    """
    try:
        return InvestigationRepository.get_all(
            db=db,
            status_filter=status_filter,
            severity_filter=severity_filter,
            department_filter=department_filter,
            search=search,
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch investigations: {str(e)}")


@router.get("/{investigation_id}", response_model=InvestigationDetailSchema)
def get_investigation_detail(investigation_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get comprehensive investigation case details including unified timeline, collected evidence, correlation graph, and XAI recommendations.
    """
    try:
        return InvestigationService.get_investigation_detail(investigation_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch investigation detail: {str(e)}")


@router.post("", response_model=InvestigationDetailSchema, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=InvestigationDetailSchema, status_code=status.HTTP_201_CREATED)
def create_investigation(req: InvestigationCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new investigation case for an employee. Automatically builds unified timeline and harvests evidence.
    """
    try:
        return InvestigationService.create_investigation(
            employee_id=req.employee_id,
            title=req.title,
            description=req.description,
            severity=req.severity,
            priority=req.priority,
            assigned_analyst_id=req.assigned_analyst_id,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create investigation: {str(e)}")


@router.post("/{investigation_id}/assign", response_model=InvestigationDetailSchema)
def assign_analyst(investigation_id: uuid.UUID, req: InvestigationAssignRequest, db: Session = Depends(get_db)):
    """
    Assign an analyst to an investigation case.
    """
    try:
        return InvestigationService.assign_analyst(investigation_id, req.analyst_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to assign analyst: {str(e)}")


@router.post("/{investigation_id}/note", response_model=InvestigationDetailSchema)
def add_note(investigation_id: uuid.UUID, req: InvestigationNoteRequest, db: Session = Depends(get_db)):
    """
    Add a collaborative analyst note to an investigation case.
    """
    try:
        return InvestigationService.add_note(
            case_id=investigation_id,
            author_name=req.author_name,
            comment=req.comment,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to add note: {str(e)}")


@router.post("/{investigation_id}/status", response_model=InvestigationDetailSchema)
def update_status(investigation_id: uuid.UUID, req: InvestigationStatusRequest, db: Session = Depends(get_db)):
    """
    Update investigation status (Open, Assigned, Investigating, Escalated, Resolved, Closed).
    """
    try:
        return InvestigationService.update_status(
            case_id=investigation_id,
            new_status=req.status,
            root_cause=req.root_cause,
            resolution_summary=req.resolution_summary,
            performed_by=req.performed_by,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update status: {str(e)}")


@router.post("/{investigation_id}/close", response_model=InvestigationDetailSchema)
def close_investigation(investigation_id: uuid.UUID, req: InvestigationStatusRequest, db: Session = Depends(get_db)):
    """
    Close an investigation case with root cause and resolution summary.
    """
    try:
        return InvestigationService.update_status(
            case_id=investigation_id,
            new_status="Closed",
            root_cause=req.root_cause,
            resolution_summary=req.resolution_summary,
            performed_by=req.performed_by,
            db=db,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to close investigation: {str(e)}")


@router.get("/{investigation_id}/timeline", response_model=List[Dict[str, Any]])
def get_investigation_timeline(investigation_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get unified chronological timeline for an investigation case.
    """
    try:
        case_obj = InvestigationRepository.get_by_id(db, investigation_id)
        if not case_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
        return [
            {
                "id": str(t.id),
                "event_timestamp": t.event_timestamp.isoformat() if t.event_timestamp else None,
                "event_type": t.event_type,
                "source_module": t.source_module,
                "severity": t.severity.value,
                "description": t.description,
                "metadata": t.metadata_json,
            }
            for t in sorted(case_obj.timeline_events, key=lambda x: x.event_timestamp or datetime.min)
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch timeline: {str(e)}")


@router.get("/{investigation_id}/evidence", response_model=List[Dict[str, Any]])
def get_investigation_evidence(investigation_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get evidence items collected for an investigation case.
    """
    try:
        case_obj = InvestigationRepository.get_by_id(db, investigation_id)
        if not case_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
        return [
            {
                "id": str(e.id),
                "evidence_type": e.evidence_type,
                "source_module": e.source_module,
                "severity": e.severity.value,
                "description": e.description,
                "linked_entity_name": e.linked_entity_name,
                "evidence_data": e.evidence_data,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            }
            for e in case_obj.evidence_items
        ]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch evidence: {str(e)}")
