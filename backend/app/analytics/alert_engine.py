from sqlalchemy.orm import Session
from app.models.models import Employee, RiskScore, Alert, Anomaly

def generate_security_alerts_from_risk(db: Session, threshold_score: float = 40.0):
    """
    Fires security alerts automatically whenever an employee's risk score exceeds threshold limits.
    """
    risk_records = db.query(RiskScore).filter(RiskScore.risk_score >= threshold_score).all()
    created_count = 0

    for r in risk_records:
        emp = r.employee
        if not emp:
            continue

        # Check if an active alert already exists for this employee
        existing = db.query(Alert).filter(Alert.employee_id == emp.id, Alert.status == "Active").first()
        if existing:
            continue

        # Severity mapping
        if r.risk_score >= 80.0:
            sev = "Critical"
        elif r.risk_score >= 60.0:
            sev = "High"
        elif r.risk_score >= 40.0:
            sev = "Medium"
        else:
            sev = "Low"

        reason = f"Automated Risk Threshold Exceeded: {emp.name} reached Insider Risk Score {r.risk_score}/100 ({r.risk_level}). {r.explanation}"

        alert_rec = Alert(
            employee_id=emp.id,
            severity=sev,
            reason=reason,
            assigned_analyst_name="SOC Lead Analyst",
            status="Active",
            details={
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "threat_prediction": r.threat_prediction
            }
        )
        db.add(alert_rec)
        created_count += 1

    db.commit()
    return created_count
