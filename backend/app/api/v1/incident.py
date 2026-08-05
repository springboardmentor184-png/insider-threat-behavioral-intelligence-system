import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.incident_service import IncidentService
from app.repositories.incident_repository import IncidentRepository
from app.schemas.incident import (
    AlertSchema,
    IncidentSchema,
    SOARPlaybookSchema,
    SOARExecutionRequest,
    PlaybookExecutionLogSchema,
    IncidentDashboardStatsSchema,
)

router = APIRouter()


@router.get("/dashboard", response_model=IncidentDashboardStatsSchema)
def get_incident_dashboard(db: Session = Depends(get_db)):
    """
    Get high-level metrics for Incidents, Active Alerts, and SOAR Automated Actions.
    """
    try:
        return IncidentService.get_dashboard_stats(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch incident stats: {str(e)}")


@router.get("", response_model=List[IncidentSchema])
@router.get("/", response_model=List[IncidentSchema])
def get_incidents(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Get list of security incidents filtered by status.
    """
    try:
        return IncidentRepository.get_incidents(db, status_filter=status_filter, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch incidents: {str(e)}")


@router.get("/alerts", response_model=List[AlertSchema])
def get_alerts(
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Get triggered security alerts feed from Activity, Threat, Risk, and UEBA modules.
    """
    try:
        return IncidentRepository.get_alerts(db, status_filter=status_filter, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch alerts: {str(e)}")


@router.get("/playbooks", response_model=List[SOARPlaybookSchema])
def get_playbooks(db: Session = Depends(get_db)):
    """
    Get list of available SOAR Automated Response Playbooks.
    """
    try:
        return IncidentRepository.get_playbooks(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch playbooks: {str(e)}")


@router.get("/playbooks/logs", response_model=List[PlaybookExecutionLogSchema])
def get_playbook_execution_logs(
    incident_id: Optional[uuid.UUID] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Get execution logs of executed SOAR containment playbooks.
    """
    try:
        return IncidentRepository.get_execution_logs(db, incident_id=incident_id, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch execution logs: {str(e)}")


@router.post("/playbooks/execute", response_model=Dict[str, Any])
def execute_soar_playbook(req: SOARExecutionRequest, db: Session = Depends(get_db)):
    """
    Execute a SOAR Automated Response Containment Playbook (Account Suspension, Session Revocation, Entity Isolation, USB Revocation).
    """
    try:
        return IncidentService.execute_soar_playbook(
            action_type_str=req.action_type,
            employee_id=req.employee_id,
            incident_id=req.incident_id,
            playbook_id=req.playbook_id,
            db=db,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to execute playbook: {str(e)}")


@router.get("/{incident_id}", response_model=Dict[str, Any])
def get_incident_detail(incident_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get detailed incident record including linked SOAR execution logs.
    """
    try:
        return IncidentService.get_incident_detail(incident_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch incident detail: {str(e)}")
