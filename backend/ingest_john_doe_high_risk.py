import random
from datetime import datetime
from app.database import SessionLocal
from app.models.models import Employee, Department, Device, ActivityLog, Anomaly, RiskScore, Alert, Investigation

db = SessionLocal()

print("=================================================================")
print("INGESTING HIGH RISK USER: JOHN DOE (ID: 1045)")
print("=================================================================")

# 1. Get or create Department (Information Security / IT)
dept = db.query(Department).filter(Department.name == "Information Technology").first()
if not dept:
    dept = db.query(Department).first()

# 2. Check or create Employee: John Doe
emp = db.query(Employee).filter(Employee.email == "john@example.com").first()
if not emp:
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
    print(f"Created Employee profile: John Doe (ID: {emp.id}, Code: {emp.employee_id})")
else:
    print(f"Existing Employee profile found: John Doe (ID: {emp.id})")

# 3. Create or get Workstation Device
dev = db.query(Device).filter(Device.employee_id == emp.id).first()
if not dev:
    dev = Device(
        device_id="PC-1045-JDOE",
        device_name="John Doe Workstation",
        device_type="Corporate Workstation",
        ip_address="192.168.45.102",
        mac_address="00:1C:B3:09:44:88",
        employee_id=emp.id,
        status="Active"
    )
    db.add(dev)
    db.flush()

timestamp_event = datetime(2026, 8, 6, 22, 45, 0)

# 4. Ingest Activity Logs
log1 = ActivityLog(
    employee_id=emp.id,
    device_id=dev.id,
    event_type="Logon Event - Failed",
    severity="High",
    details={
        "status": "Failed",
        "attempts": 5,
        "ip": "192.168.45.102",
        "location": "Unfamiliar Geolocation (Foreign IP)",
        "fingerprint": "Suspicious Browser Fingerprint (Header Mismatch)"
    },
    timestamp=timestamp_event
)
log2 = ActivityLog(
    employee_id=emp.id,
    device_id=dev.id,
    event_type="Privilege Escalation",
    severity="Critical",
    details={
        "action": "sudo su - root",
        "path": "/etc/shadow",
        "status": "Attempted"
    },
    timestamp=timestamp_event
)
db.add_all([log1, log2])
db.flush()

# 5. Add Flagged Threat Anomaly
anom = Anomaly(
    employee_id=emp.id,
    category="Access Pattern Deviation & Privilege Misuse",
    anomaly_score=0.87,
    description="Multiple failed login attempts from unfamiliar location (192.168.45.102) with suspicious browser fingerprint.",
    severity="Critical",
    status="Flagged",
    created_at=timestamp_event
)
db.add(anom)
db.flush()

# 6. Set / Update Risk Score = 87 (High Risk / Critical Risk)
risk_rec = db.query(RiskScore).filter(RiskScore.employee_id == emp.id).first()
if not risk_rec:
    risk_rec = RiskScore(employee_id=emp.id)
    db.add(risk_rec)

risk_rec.risk_score = 87.0
risk_rec.risk_level = "High Risk"
risk_rec.behavioral_anomaly_score = 30.5
risk_rec.privilege_misuse_score = 25.0
risk_rec.data_access_score = 18.0
risk_rec.access_pattern_score = 8.5
risk_rec.historical_event_score = 5.0
risk_rec.explanation = "Employee assigned High Risk (87/100) due to: Multiple failed login attempts; Login from unfamiliar location (192.168.45.102); Suspicious browser fingerprint; Unapproved privilege escalation attempt."
risk_rec.threat_prediction = {
    "exfiltration_probability": 0.89,
    "predicted_threat_vector": "Account Compromise & Unauthorized Root Escalation",
    "recommended_action": "Isolate Endpoint Workstation & Review Account Credentials Immediately"
}
db.flush()

# 7. Create Security Alert
alert = Alert(
    employee_id=emp.id,
    severity="Critical",
    reason="[HIGH RISK USER DETECTED] John Doe (ID: 1045) reached Risk Score 87/100. Multiple failed logins, unfamiliar IP 192.168.45.102, suspicious browser fingerprint.",
    status="Active",
    assigned_analyst_name="SOC Senior Analyst",
    created_at=timestamp_event
)
db.add(alert)

# 8. Initialize Threat Investigation Case File
inv = db.query(Investigation).filter(Investigation.employee_id == emp.id).first()
if not inv:
    inv = Investigation(
        title="High Risk User Detection - John Doe (EMP-1045)",
        employee_id=emp.id,
        severity="Critical",
        status="Open",
        summary="High Risk User John Doe (ID: 1045) detected at 06 Aug 2026 10:45 PM. Risk Score: 87. Reasons: Multiple failed login attempts from unfamiliar IP 192.168.45.102 with suspicious browser fingerprint.",
        assigned_analyst_name="SOC Senior Analyst",
        evidence_payload={
            "risk_score": 87.0,
            "ip_address": "192.168.45.102",
            "time": "06 Aug 2026 10:45 PM",
            "reasons": [
                "Multiple failed login attempts",
                "Login from unfamiliar location",
                "Suspicious browser fingerprint"
            ]
        },
        created_at=timestamp_event
    )
    db.add(inv)

db.commit()

print("=================================================================")
print("SUCCESSFULLY INGESTED JOHN DOE INTO SYSTEM MODULES!")
print(f"Employee ID   : {emp.id} ({emp.employee_id})")
print(f"User Name     : {emp.name}")
print(f"Risk Score    : {risk_rec.risk_score} ({risk_rec.risk_level})")
print(f"Investigation Case ID: {inv.id if inv else 'N/A'}")
print("=================================================================")

db.close()
