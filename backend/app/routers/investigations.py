from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import (
    User,
    UserProfile,
    ActivityLog,
    Incident
)
from ..services.risk_score import risk_score_calculator


router = APIRouter(
    prefix="/investigations",
    tags=["Threat Investigation"]
)


ANALYST_ROLES = (
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst"
)

VALID_STATUSES = (
    "Open",
    "Investigating",
    "Resolved",
    "Closed"
)


# =========================================================
# GENERATE INCIDENTS FOR HIGH-RISK EMPLOYEES
# =========================================================

@router.post("/generate-for-high-risk")
def generate_incidents_for_high_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    """
    Auto-create incidents for all High/Critical
    risk employees who don't already have an open one.
    """

    high_risk_profiles = (
        db.query(UserProfile)
        .filter(UserProfile.risk_score >= 50)
        .all()
    )

    created = 0

    for profile in high_risk_profiles:

        existing = (
            db.query(Incident)
            .filter(
                Incident.employee_id
                == profile.employee_id,
                Incident.status == "Open"
            )
            .first()
        )

        if existing:
            continue

        category = (
            risk_score_calculator
            .categorize(profile.risk_score)
        )

        incident = Incident(
            employee_id=profile.employee_id,
            risk_score_at_creation=profile.risk_score,
            risk_category=category,
            status="Open",
            description=(
                f"Auto-generated incident: "
                f"risk score {profile.risk_score} "
                f"({category})"
            ),
        )

        db.add(incident)
        created += 1

    db.commit()

    return {
        "message": f"Created {created} new incidents"
    }


# =========================================================
# LIST ALL INCIDENTS
# =========================================================

@router.get("/")
def list_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    incidents = (
        db.query(Incident)
        .order_by(
            Incident.created_at.desc()
        )
        .all()
    )

    return incidents


# =========================================================
# GET INCIDENT
# =========================================================

@router.get("/{incident_id}")
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    incident = (
        db.query(Incident)
        .filter(
            Incident.id == incident_id
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return incident


# =========================================================
# GET INCIDENT TIMELINE
# =========================================================

@router.get("/{incident_id}/timeline")
def get_incident_timeline(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    incident = (
        db.query(Incident)
        .filter(
            Incident.id == incident_id
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    logs = (
        db.query(ActivityLog)
        .filter(
            ActivityLog.employee
            == incident.employee_id
        )
        .order_by(
            ActivityLog.timestamp.desc()
        )
        .limit(200)
        .all()
    )

    timeline = [
        {
            "timestamp": log.timestamp,
            "activity": log.activity,
            "device": log.device,
            "ip_address": log.ip_address,
        }
        for log in logs
    ]

    return {
        "incident_id": incident_id,
        "employee_id": incident.employee_id,
        "risk_category": incident.risk_category,
        "event_count": len(timeline),
        "timeline": timeline,
    }


# =========================================================
# UPDATE INCIDENT STATUS
# =========================================================

@router.put("/{incident_id}/status")
def update_incident_status(
    incident_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Must be one of: "
                f"{', '.join(VALID_STATUSES)}"
            )
        )

    incident = (
        db.query(Incident)
        .filter(
            Incident.id == incident_id
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incident.status = new_status

    db.commit()
    db.refresh(incident)

    return incident


# =========================================================
# ASSIGN ANALYST
# Administrator + Security Manager
# =========================================================

@router.put("/{incident_id}/assign")
def assign_analyst(
    incident_id: int,
    analyst_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(
            "Administrator",
            "Security Manager"
        )
    ),
):
    """
    Assign an analyst to an incident.
    """

    incident = (
        db.query(Incident)
        .filter(
            Incident.id == incident_id
        )
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incident.assigned_analyst = analyst_name

    db.commit()
    db.refresh(incident)

    return incident