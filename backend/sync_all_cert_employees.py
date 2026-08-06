import random
import zipfile
import os
import pandas as pd
from app.database import SessionLocal, engine, Base
from app.models.models import Employee, Department, Device, ActivityLog, RiskScore, Alert, Investigation
from app.analytics.risk_engine import recalculate_all_employee_risk_scores
from app.analytics.alert_engine import generate_security_alerts_from_risk

db = SessionLocal()

print("=================================================================")
print("SYNCING ALL CERT DATASET EMPLOYEES ACROSS SYSTEM MODULES")
print("=================================================================")

ZIP_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "archive.zip")
if not os.path.exists(ZIP_PATH):
    ZIP_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "archive.zip")

depts = db.query(Department).all()
dept_map = {d.name: d.id for d in depts}
dept_list = [d.id for d in depts]

# 1. Extract all unique user IDs from CERT r4.2 logon.csv and device.csv
cert_users = set()
if os.path.exists(ZIP_PATH):
    try:
        with zipfile.ZipFile(ZIP_PATH, 'r') as z:
            names = z.namelist()
            logon_file = next((f for f in names if f.endswith('logon.csv')), None)
            if logon_file:
                with z.open(logon_file) as f:
                    df = pd.read_csv(f, nrows=1000)
                    cert_users.update(df['user'].dropna().unique())
            device_file = next((f for f in names if f.endswith('device.csv')), None)
            if device_file:
                with z.open(device_file) as f:
                    df_dev = pd.read_csv(f, nrows=1000)
                    cert_users.update(df_dev['user'].dropna().unique())
    except Exception as ex:
        print("Zip read warning:", ex)

# Fallback CERT user IDs if zip extraction is partial
fallback_users = [
    "ACM1443", "BRP0622", "HRP0834", "JLM0364", "DKP1109", "RGG0234", "NJS0045", "KAB0912",
    "TMF1203", "WLD0491", "NGF0157", "LRR0148", "IRM0931", "MOH0273", "AAM0658", "AJR0932",
    "BDV0168", "BIH0745", "BLS0678", "CAH0936", "DCH0843", "EHB0824", "EHD0584"
]
cert_users.update(fallback_users)

designations = [
    "Systems Administrator", "DevOps Architect", "Database Engineer", "Frontend Specialist",
    "SOC Threat Analyst", "Senior Software Engineer", "Financial Risk Modeler", "Infrastructure Lead",
    "Cybersecurity Specialist", "Data Architect", "Network Operations Lead", "QA Automation Engineer"
]

privileges_list = [
    "ADMIN_ROOT, FIREWALL_WRITE, VPN_ACCESS",
    "KUBERNETES_ADMIN, DOCKER_WRITE, AWS_PROD",
    "DATABASE_ADMIN, SQL_EXEC, BACKUP_WRITE",
    "CODE_WRITE, DATABASE_READ, VPN_ACCESS",
    "SIEM_MONITOR, LOG_READ, INCIDENT_TRIAGE",
    "FINANCE_WRITE, BANKING_ACCESS, PAYROLL_READ"
]

added_employees = 0
added_devices = 0

for u_code in sorted(cert_users):
    emp_code = f"EMP-CERT-{u_code}"
    emp_name = f"CERT User {u_code}"
    emp_email = f"{u_code.lower()}@cert.enterprise.org"

    existing = db.query(Employee).filter((Employee.employee_id == emp_code) | (Employee.email == emp_email)).first()
    if not existing:
        d_id = random.choice(dept_list)
        new_emp = Employee(
            employee_id=emp_code,
            name=emp_name,
            email=emp_email,
            department_id=d_id,
            designation=random.choice(designations),
            access_privileges=random.choice(privileges_list)
        )
        db.add(new_emp)
        db.flush()

        # Add associated PC device
        dev = Device(
            device_id=f"PC-CERT-{u_code}",
            device_name=f"{u_code}'s CERT Workstation",
            device_type="Desktop Workstation",
            ip_address=f"10.0.{random.randint(1,10)}.{random.randint(10,250)}",
            mac_address=f"00:1B:44:{random.randint(10,99)}:{random.randint(10,99)}:{random.randint(10,99)}",
            employee_id=new_emp.id,
            status="Active"
        )
        db.add(dev)
        added_employees += 1
        added_devices += 1

db.commit()
print(f"Created {added_employees} new CERT Employee profiles in database.")

# 2. Re-link 1,250 Activity Logs to matching CERT Employee records
all_emps = db.query(Employee).all()
emp_lookup = {}
for e in all_emps:
    # Map both 'ACM1443' and 'CERT User ACM1443' to employee ID
    raw_code = e.employee_id.replace("EMP-CERT-", "").replace("EMP-", "").upper()
    emp_lookup[raw_code] = e.id
    emp_lookup[e.name.upper()] = e.id

activity_logs = db.query(ActivityLog).all()
relinked = 0
for log in activity_logs:
    details = log.details or {}
    cert_user = details.get("cert_user")
    if cert_user and cert_user.upper() in emp_lookup:
        log.employee_id = emp_lookup[cert_user.upper()]
        relinked += 1

db.commit()
print(f"Re-linked {relinked} activity logs to exact CERT Employee entities.")

# 3. Recalculate 35-25-20-10-10 Risk Scores across all CERT personnel
print("Calculating Insider Risk Scores across all CERT employees...")
recalculate_all_employee_risk_scores(db)

# 4. Generate Security Alerts
print("Generating Security Threshold Alerts...")
generate_security_alerts_from_risk(db)

# 5. Populate Threat Investigation cases for CERT High/Critical employees
print("Creating Threat Investigation Cases for High-Risk CERT Personnel...")
high_risk_scores = db.query(RiskScore).filter(RiskScore.risk_score >= 45.0).all()
cases_created = 0

for r in high_risk_scores:
    emp = r.employee
    if not emp:
        continue
    existing_case = db.query(Investigation).filter(Investigation.employee_id == emp.id).first()
    if not existing_case:
        inv = Investigation(
            title=f"High-Risk Behavioral Anomaly - {emp.name}",
            employee_id=emp.id,
            severity="Critical" if r.risk_score >= 75.0 else "High",
            status="Open" if r.risk_score >= 65.0 else "In Progress",
            summary=f"Automated threat investigation initialized for {emp.name} ({emp.employee_id}) due to Insider Risk Score {r.risk_score}/100. {r.explanation}",
            assigned_analyst_name=random.choice(["SOC Lead Analyst", "Senior Threat Hunter", "Security Incident Responder"]),
            evidence_payload={
                "risk_score": r.risk_score,
                "risk_level": r.risk_level,
                "threat_prediction": r.threat_prediction,
                "explanation": r.explanation
            }
        )
        db.add(inv)
        cases_created += 1

db.commit()

total_employees = db.query(Employee).count()
total_risk_scores = db.query(RiskScore).count()
total_alerts = db.query(Alert).count()
total_cases = db.query(Investigation).count()

print("\n=================================================================")
print("CERT EMPLOYEES FULL SYSTEM SYNC COMPLETE!")
print(f"Total Monitored Employees : {total_employees}")
print(f"Total Risk Scores          : {total_risk_scores}")
print(f"Total Security Alerts      : {total_alerts}")
print(f"Total Investigation Cases  : {total_cases}")
print("=================================================================")

db.close()
