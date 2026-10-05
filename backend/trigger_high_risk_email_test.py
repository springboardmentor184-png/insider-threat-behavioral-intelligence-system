import sys
import os
from app.database import SessionLocal
from app.models.models import Employee, RiskScore, Alert, Department
from app.core.email_service import send_critical_risk_email, ADMIN_EMAIL

db = SessionLocal()

print("=================================================================")
print("TRIGGERING CRITICAL RISK DATA (> 75%) & LIVE EMAIL DEMONSTRATION")
print("=================================================================")

# 1. Fetch or create high-risk employee
emp = db.query(Employee).filter(Employee.employee_id == "EMP-1045").first()
if not emp:
    dept = db.query(Department).first()
    emp = Employee(
        employee_id="EMP-1045",
        name="John Doe",
        email="john@example.com",
        department_id=dept.id if dept else 1,
        designation="Senior Systems Analyst",
        access_privileges="ADMIN_ROOT, FIREWALL_WRITE, VPN_ACCESS"
    )
    db.add(emp)
    db.flush()

# 2. Update John Doe Risk Score to 87.0% (Critical Risk > 75%)
risk_rec = db.query(RiskScore).filter(RiskScore.employee_id == emp.id).first()
if not risk_rec:
    risk_rec = RiskScore(employee_id=emp.id)
    db.add(risk_rec)

risk_rec.risk_score = 87.0
risk_rec.risk_level = "Critical Risk"
risk_rec.behavioral_anomaly_score = 30.5
risk_rec.privilege_misuse_score = 25.0
risk_rec.data_access_score = 18.0
risk_rec.access_pattern_score = 8.5
risk_rec.historical_event_score = 5.0
risk_rec.explanation = "Employee assigned Critical Risk (87/100) due to: Multiple failed login attempts; Login from unfamiliar location (192.168.45.102); Suspicious browser fingerprint; Unapproved privilege escalation attempt."
risk_rec.threat_prediction = {
    "exfiltration_probability": 0.89,
    "predicted_threat_vector": "Account Compromise & Unauthorized Root Escalation",
    "recommended_action": "Isolate Endpoint Workstation & Review Account Credentials Immediately"
}

db.commit()

print(f"1. High-Risk User Profile Updated:")
print(f"   - Name        : {emp.name} ({emp.employee_id})")
print(f"   - Department  : {emp.department.name if emp.department else 'IT'}")
print(f"   - Risk Score  : {risk_rec.risk_score}% (CRITICAL RISK > 75%)")
print(f"   - Target Email: {ADMIN_EMAIL}")

# 3. Trigger live Gmail SMTP email dispatch
print("\n2. Dispatching Live Critical Risk Email Notification...")
sent = send_critical_risk_email(
    employee_name=emp.name,
    employee_code=emp.employee_id,
    department=emp.department.name if emp.department else "Information Technology",
    risk_score=risk_rec.risk_score,
    risk_level=risk_rec.risk_level,
    explanation=risk_rec.explanation,
    description="CRITICAL THREAT ALERT: Monitored employee John Doe (EMP-1045) breached the 75% Critical Risk Threshold with a dynamic score of 87.0%. Automated threat indicators show unauthorized privilege escalation attempt (/etc/shadow), multiple failed logons from unfamiliar geolocation (192.168.45.102), and mass USB storage attachment.",
    threat_prediction=risk_rec.threat_prediction,
    admin_email=ADMIN_EMAIL
)

print("\n=================================================================")
print(f"EMAIL DELIVERY STATUS: {'DELIVERED SUCCESSFULLY [OK]' if sent else 'FAILED'}")
print(f"Recipient Inbox      : {ADMIN_EMAIL}")
print("=================================================================")

db.close()
