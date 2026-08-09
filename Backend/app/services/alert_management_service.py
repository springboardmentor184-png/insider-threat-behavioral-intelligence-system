from datetime import datetime
from sqlalchemy.orm import Session

from app.models import ThreatAlert, Employee


# ==========================================
# Alert Dashboard
# ==========================================
def get_alert_dashboard(db: Session):

    alerts = (
        db.query(ThreatAlert)
        .order_by(
            ThreatAlert.created_at.desc()
        )
        .all()
    )

    print("========== ALERT DASHBOARD ==========")
    print("Total Alerts:", len(alerts))

    result = []

    for alert in alerts:

        print(
            f"Alert ID: {alert.id}, "
            f"Employee: {alert.employee_id}, "
            f"Severity: {alert.severity}, "
            f"Status: {alert.status}"
        )

        employee = (
            db.query(Employee)
            .filter(
                Employee.id == alert.employee_id
            )
            .first()
        )

        if not employee:
            print(f"Employee {alert.employee_id} not found!")
            continue

        result.append({

            "id": alert.id,

            "employee_id": employee.id,

            "employee_code": employee.employee_id,

            "full_name": employee.full_name,

            "department": employee.department,

            "alert_title": alert.alert_title,

            "severity": alert.severity,

            "status": alert.status,

            "escalation_level": alert.escalation_level,

            "assigned_analyst": alert.assigned_analyst,

            "created_at": alert.created_at

        })

    print("Dashboard Records:", len(result))

    return result


# ==========================================
# Assign Analyst
# ==========================================
def assign_analyst(
    db: Session,
    alert_id: int,
    analyst: str
):

    alert = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.id == alert_id
        )
        .first()
    )

    if not alert:
        return None

    alert.assigned_analyst = analyst

    if alert.status == "Open":
        alert.status = "Assigned"

    db.commit()
    db.refresh(alert)

    return alert


# ==========================================
# Escalation
# ==========================================
def escalate_alert(
    db: Session,
    alert_id: int
):

    alert = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.id == alert_id
        )
        .first()
    )

    if not alert:
        return None

    if alert.escalation_level < 3:
        alert.escalation_level += 1

    db.commit()
    db.refresh(alert)

    return alert


# ==========================================
# Resolve Alert
# ==========================================
def resolve_alert(
    db: Session,
    alert_id: int,
    notes: str
):

    alert = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.id == alert_id
        )
        .first()
    )

    if not alert:
        return None

    alert.status = "Resolved"
    alert.resolution_notes = notes
    alert.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)

    return alert


# ==========================================
# Auto Generate Alert
# ==========================================

def generate_alert(
    db: Session,
    employee_id: int,
    prediction: dict
):

    print("========== GENERATE ALERT ==========")
    print("Employee:", employee_id)
    print("Prediction:", prediction)

    # ---------------------------------
    # Check Existing Active Alert
    # ---------------------------------

    existing = (
        db.query(ThreatAlert)
        .filter(
            ThreatAlert.employee_id == employee_id,
            ThreatAlert.status != "Resolved"
        )
        .first()
    )

    # ---------------------------------
    # Alert Already Exists
    # ---------------------------------

    if existing:

        print(
            "⚠️ Alert already exists:",
            existing.id
        )

        return {
            "alert": existing,
            "created": False
        }

    # ---------------------------------
    # Create New Alert
    # ---------------------------------

    print("Creating new alert...")

    alert = ThreatAlert(

        employee_id=employee_id,

        alert_title="AI Insider Threat Alert",

        severity=prediction["risk_level"],

        status="Open",

        escalation_level=1,

        assigned_analyst="Unassigned",

        resolution_notes=""

    )

    db.add(alert)

    print("Before Commit")

    db.commit()

    print("After Commit")

    db.refresh(alert)

    print(
        "✅ Alert Saved:",
        alert.id
    )

    return {
        "alert": alert,
        "created": True
    }