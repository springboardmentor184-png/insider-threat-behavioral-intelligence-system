from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas import (
    AlertDashboardResponse,
    AssignAnalystRequest,
    EscalateAlertResponse,
    ResolveAlertRequest,
    ResolveAlertResponse
)

from app.services.alert_management_service import (
    get_alert_dashboard,
    assign_analyst,
    escalate_alert,
    resolve_alert
)

router = APIRouter(
    prefix="/alert-management",
    tags=["Alert Management"]
)


# ==========================================
# Alert Dashboard
# ==========================================

@router.get(
    "/dashboard",
    response_model=list[AlertDashboardResponse]
)
def dashboard(
    db: Session = Depends(get_db)
):

    return get_alert_dashboard(db)


# ==========================================
# Assign Analyst
# ==========================================

@router.put(
    "/{alert_id}/assign"
)
def assign(
    alert_id: int,
    data: AssignAnalystRequest,
    db: Session = Depends(get_db)
):

    alert = assign_analyst(
        db,
        alert_id,
        data.assigned_analyst
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return {
        "message": "Analyst assigned successfully",
        "assigned_analyst": alert.assigned_analyst,
        "status": alert.status
    }


# ==========================================
# Escalate Alert
# ==========================================

@router.put(
    "/{alert_id}/escalate",
    response_model=EscalateAlertResponse
)
def escalate(
    alert_id: int,
    db: Session = Depends(get_db)
):

    alert = escalate_alert(
        db,
        alert_id
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return {
        "message": "Alert escalated successfully",
        "escalation_level": alert.escalation_level
    }


# ==========================================
# Resolve Alert
# ==========================================

@router.put(
    "/{alert_id}/resolve",
    response_model=ResolveAlertResponse
)
def resolve(
    alert_id: int,
    data: ResolveAlertRequest,
    db: Session = Depends(get_db)
):

    alert = resolve_alert(
        db,
        alert_id,
        data.resolution_notes
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return {
        "message": "Alert resolved successfully",
        "status": alert.status
    }