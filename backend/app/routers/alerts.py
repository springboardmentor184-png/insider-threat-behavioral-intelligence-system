from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import User, UserProfile, Alert, Incident
from ..services.risk_score import risk_score_calculator


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


ANALYST_ROLES = (
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst"
)


def _severity_from_score(score: float) -> str:
    if score < 25:
        return "Informational"
    elif score < 50:
        return "Low"
    elif score < 75:
        return "Medium"
    elif score < 90:
        return "High"
    else:
        return "Critical"


# =========================================================
# GENERATE ALERTS
# =========================================================

@router.post("/generate")
def generate_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    """
    Auto-generate alerts for employees with
    risk_score >= 50 who don't already have an open alert.
    """

    at_risk = (
        db.query(UserProfile)
        .filter(UserProfile.risk_score >= 50)
        .all()
    )

    created = 0

    for profile in at_risk:

        existing = (
            db.query(Alert)
            .filter(
                Alert.employee == profile.employee_id,
                Alert.status == "Open"
            )
            .first()
        )

        if existing:
            continue

        severity = _severity_from_score(
            profile.risk_score
        )

        alert = Alert(
            employee=profile.employee_id,
            severity=severity,
            description=(
                f"Risk score {profile.risk_score} "
                f"triggered alert ({severity})"
            ),
            status="Open",
        )

        db.add(alert)
        created += 1

    db.commit()

    return {
        "message": f"Generated {created} new alerts"
    }


# =========================================================
# GET ALL ALERTS
# =========================================================

@router.get("/")
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    alerts = (
        db.query(Alert)
        .order_by(Alert.created_at.desc())
        .all()
    )

    return alerts


# =========================================================
# GET SINGLE ALERT
# =========================================================

@router.get("/{alert_id}")
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return alert


# =========================================================
# ASSIGN ANALYST
# Administrator + Security Manager
# =========================================================

@router.put("/{alert_id}/assign")
def assign_analyst(
    alert_id: int,
    analyst_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(
            "Administrator",
            "Security Manager"
        )
    ),
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    alert.assigned_analyst = analyst_name
    alert.status = "Investigating"

    db.commit()
    db.refresh(alert)

    return alert


# =========================================================
# ESCALATE ALERT
# =========================================================

@router.put("/{alert_id}/escalate")
def escalate_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    escalation_order = [
        "Informational",
        "Low",
        "Medium",
        "High",
        "Critical"
    ]

    if alert.severity in escalation_order:
        current_index = escalation_order.index(
            alert.severity
        )
    else:
        current_index = 0

    if current_index < len(escalation_order) - 1:
        alert.severity = (
            escalation_order[current_index + 1]
        )
        alert.status = "Escalated"

    db.commit()
    db.refresh(alert)

    return alert


# =========================================================
# RESOLVE ALERT
# =========================================================

@router.put("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    resolution_notes: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    alert.status = "Resolved"
    alert.resolved_at = datetime.utcnow()
    alert.resolution_notes = resolution_notes

    db.commit()
    db.refresh(alert)

    return alert