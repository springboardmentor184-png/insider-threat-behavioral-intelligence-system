from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    Employee,
    ThreatAlert,
    Investigation
)


# =====================================================
# EXECUTIVE SECURITY DASHBOARD
# =====================================================

def get_executive_dashboard(db: Session):

    # -------------------------------------------------
    # Employee Metrics
    # -------------------------------------------------

    total_employees = (
        db.query(Employee)
        .count()
    )

    high_risk_employees = (
        db.query(Employee)
        .filter(Employee.risk_score >= 70)
        .count()
    )

    critical_risk_employees = (
        db.query(Employee)
        .filter(Employee.risk_score >= 90)
        .count()
    )

    # -------------------------------------------------
    # Average Risk Score
    # -------------------------------------------------

    average_risk_score = (
        db.query(
            func.avg(Employee.risk_score)
        )
        .scalar()
    )

    if average_risk_score is None:
        average_risk_score = 0

    average_risk_score = round(
        float(average_risk_score),
        2
    )

    # -------------------------------------------------
    # Alert Metrics
    # -------------------------------------------------

    total_alerts = (
        db.query(ThreatAlert)
        .count()
    )

    critical_alerts = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.severity == "Critical"
        )
        .count()
    )

    high_alerts = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.severity == "High"
        )
        .count()
    )

    medium_alerts = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.severity == "Medium"
        )
        .count()
    )

    low_alerts = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.severity == "Low"
        )
        .count()
    )

    open_alerts = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.status != "Resolved"
        )
        .count()
    )

    resolved_alerts = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.status == "Resolved"
        )
        .count()
    )

    # -------------------------------------------------
    # Investigation Metrics
    # -------------------------------------------------

    total_investigations = (
        db.query(Investigation)
        .count()
    )

    active_investigations = (
        db.query(Investigation)
        .filter(
            Investigation.status != "Resolved"
        )
        .count()
    )

    resolved_investigations = (
        db.query(Investigation)
        .filter(
            Investigation.status == "Resolved"
        )
        .count()
    )

    critical_investigations = (
        db.query(Investigation)
        .filter(
            Investigation.threat_severity == "Critical"
        )
        .count()
    )

    high_investigations = (
        db.query(Investigation)
        .filter(
            Investigation.threat_severity == "High"
        )
        .count()
    )

    # -------------------------------------------------
    # Return Executive Dashboard Data
    # -------------------------------------------------

    return {

        "total_employees": total_employees,

        "high_risk_employees": high_risk_employees,

        "critical_risk_employees": (
            critical_risk_employees
        ),

        "average_risk_score": (
            average_risk_score
        ),

        "total_alerts": total_alerts,

        "critical_alerts": critical_alerts,

        "high_alerts": high_alerts,

        "medium_alerts": medium_alerts,

        "low_alerts": low_alerts,

        "open_alerts": open_alerts,

        "resolved_alerts": resolved_alerts,

        "total_investigations": (
            total_investigations
        ),

        "active_investigations": (
            active_investigations
        ),

        "resolved_investigations": (
            resolved_investigations
        ),

        "critical_investigations": (
            critical_investigations
        ),

        "high_investigations": (
            high_investigations
        )
    }