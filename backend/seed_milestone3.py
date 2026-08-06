from app.database import SessionLocal, engine, Base
from app.analytics.risk_engine import recalculate_all_employee_risk_scores
from app.analytics.alert_engine import generate_security_alerts_from_risk
from app.models.models import RiskScore, Investigation, Alert, Employee

print("Initializing Milestone 3 database schema...")
Base.metadata.create_all(bind=engine)

db = SessionLocal()

print("Calculating Insider Risk Scores...")
scores_count = recalculate_all_employee_risk_scores(db)
print(f"Calculated risk scores for {scores_count} employees.")

print("Firing security threshold alerts...")
alerts_count = generate_security_alerts_from_risk(db)
print(f"Generated {alerts_count} security alerts.")

# Seed initial investigation cases if none exist
if db.query(Investigation).count() == 0:
    high_risk_scores = db.query(RiskScore).filter(RiskScore.risk_score >= 40.0).all()
    inv_created = 0
    for r in high_risk_scores:
        emp = r.employee
        if not emp:
            continue
        inv = Investigation(
            title=f"High-Risk Behavioral Anomaly - {emp.name}",
            employee_id=emp.id,
            severity="Critical" if r.risk_score >= 75.0 else "High",
            status="Open" if r.risk_score >= 70.0 else "In Progress",
            summary=f"Automated threat case initialized for {emp.name} ({emp.employee_id}) due to Insider Risk Score {r.risk_score}/100. {r.explanation}",
            assigned_analyst_name="SOC Lead Analyst",
            evidence_payload={
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "threat_prediction": r.threat_prediction,
                "explanation": r.explanation
            }
        )
        db.add(inv)
        inv_created += 1
    db.commit()
    print(f"Created {inv_created} threat investigation cases.")

total_cases = db.query(Investigation).count()
total_alerts = db.query(Alert).count()
total_scores = db.query(RiskScore).count()

print(f"\n[MILESTONE 3 DB READY]")
print(f"Total Risk Scores  : {total_scores}")
print(f"Total Alerts       : {total_alerts}")
print(f"Total Cases        : {total_cases}")

db.close()
