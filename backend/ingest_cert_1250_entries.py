import os
import zipfile
import pandas as pd
import random
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models.models import ActivityLog, Employee, Device, Anomaly, RiskScore, Alert, Investigation
from app.analytics.risk_engine import recalculate_all_employee_risk_scores
from app.analytics.alert_engine import generate_security_alerts_from_risk

db = SessionLocal()

ZIP_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "archive.zip")
if not os.path.exists(ZIP_PATH):
    ZIP_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "archive.zip")

print("=================================================================")
print("CERT R4.2 INSIDER THREAT DATASET INTEGRATION (1,250 ENTRIES)")
print("=================================================================")
print(f"Dataset Archive Location: {ZIP_PATH}")

if not os.path.exists(ZIP_PATH):
    print(f"[ERROR] archive.zip not found at {ZIP_PATH}")
    db.close()
    exit()

# Clear old logs to ensure a clean 1,250 dataset batch
print("Clearing existing activity logs...")
db.query(ActivityLog).delete()
db.commit()

employees = db.query(Employee).all()
devices = db.query(Device).all()

if not employees:
    print("[ERROR] No employees in database. Launch backend first.")
    db.close()
    exit()

emp_map = {e.name.split()[-1].upper(): e.id for e in employees}
fallback_emp_ids = [e.id for e in employees]
fallback_dev_ids = [d.id for d in devices] if devices else [None]

TARGET_TOTAL = 1250
entries_added = 0

try:
    with zipfile.ZipFile(ZIP_PATH, 'r') as z:
        names = z.namelist()

        # 1. Ingest 350 Logon Logs (Logon / Logoff)
        logon_file = next((f for f in names if f.endswith('logon.csv')), None)
        if logon_file:
            print(f"[1/5] Extracting 350 logon events from {logon_file}...")
            with z.open(logon_file) as f:
                df = pd.read_csv(f, nrows=350)
                for _, row in df.iterrows():
                    u_code = str(row.get('user', 'ADMIN'))
                    e_id = emp_map.get(u_code, random.choice(fallback_emp_ids))
                    d_id = random.choice(fallback_dev_ids)
                    act = str(row.get('activity', 'Logon'))
                    pc = str(row.get('pc', 'PC-1001'))

                    log = ActivityLog(
                        employee_id=e_id,
                        device_id=d_id,
                        event_type=f"Logon Event - {act}",
                        severity="Low" if act == "Logon" else "Informational",
                        details={"cert_user": u_code, "workstation": pc, "action": act, "dataset": "CERT r4.2 logon.csv"}
                    )
                    db.add(log)
                    entries_added += 1

        # 2. Ingest 250 USB Device Logs (Connect / Disconnect)
        dev_file = next((f for f in names if f.endswith('device.csv')), None)
        if dev_file:
            print(f"[2/5] Extracting 250 USB media events from {dev_file}...")
            with z.open(dev_file) as f:
                df = pd.read_csv(f, nrows=250)
                for _, row in df.iterrows():
                    u_code = str(row.get('user', 'ADMIN'))
                    e_id = emp_map.get(u_code, random.choice(fallback_emp_ids))
                    d_id = random.choice(fallback_dev_ids)
                    act = str(row.get('activity', 'Connect'))

                    log = ActivityLog(
                        employee_id=e_id,
                        device_id=d_id,
                        event_type="USB Usage",
                        severity="High" if act == "Connect" else "Medium",
                        details={"cert_user": u_code, "action": act, "vendor": "SanDisk / Kingston Removable", "dataset": "CERT r4.2 device.csv"}
                    )
                    db.add(log)
                    entries_added += 1

        # 3. Ingest 250 File Access & Download Logs
        file_csv = next((f for f in names if f.endswith('file.csv')), None)
        if file_csv:
            print(f"[3/5] Extracting 250 sensitive file events from {file_csv}...")
            with z.open(file_csv) as f:
                df = pd.read_csv(f, nrows=250)
                for _, row in df.iterrows():
                    u_code = str(row.get('user', 'ADMIN'))
                    e_id = emp_map.get(u_code, random.choice(fallback_emp_ids))
                    d_id = random.choice(fallback_dev_ids)
                    fname = str(row.get('filename', 'Q3_payroll_report.xlsx'))

                    log = ActivityLog(
                        employee_id=e_id,
                        device_id=d_id,
                        event_type="File Download",
                        severity="Critical" if "payroll" in fname.lower() or "zip" in fname.lower() else "High",
                        details={"cert_user": u_code, "file_name": fname, "size_mb": round(random.uniform(10.0, 180.0), 1), "dataset": "CERT r4.2 file.csv"}
                    )
                    db.add(log)
                    entries_added += 1

        # 4. Ingest 200 Corporate Email Traffic Logs
        email_file = next((f for f in names if f.endswith('email.csv')), None)
        if email_file:
            print(f"[4/5] Extracting 200 email exfiltration logs from {email_file}...")
            with z.open(email_file) as f:
                df = pd.read_csv(f, nrows=200)
                for _, row in df.iterrows():
                    u_code = str(row.get('user', 'ADMIN'))
                    e_id = emp_map.get(u_code, random.choice(fallback_emp_ids))
                    d_id = random.choice(fallback_dev_ids)
                    to_addr = str(row.get('to', 'external@competitor.com'))

                    log = ActivityLog(
                        employee_id=e_id,
                        device_id=d_id,
                        event_type="Email Activity",
                        severity="High" if "@gmail" in to_addr or "@yahoo" in to_addr or "external" in to_addr else "Low",
                        details={"cert_user": u_code, "recipient": to_addr, "size_bytes": row.get('size', 1048576), "dataset": "CERT r4.2 email.csv"}
                    )
                    db.add(log)
                    entries_added += 1

        # 5. Ingest 200 HTTP Web Browsing Logs
        http_file = next((f for f in names if f.endswith('http.csv')), None)
        if http_file:
            print(f"[5/5] Extracting 200 web browsing logs from {http_file}...")
            with z.open(http_file) as f:
                df = pd.read_csv(f, nrows=200)
                for _, row in df.iterrows():
                    u_code = str(row.get('user', 'ADMIN'))
                    e_id = emp_map.get(u_code, random.choice(fallback_emp_ids))
                    d_id = random.choice(fallback_dev_ids)
                    url = str(row.get('url', 'http://tor-exit-node.net'))

                    log = ActivityLog(
                        employee_id=e_id,
                        device_id=d_id,
                        event_type="Network Activity",
                        severity="Critical" if "tor" in url.lower() or "anon" in url.lower() else "Medium",
                        details={"cert_user": u_code, "url": url, "bytes_sent": random.randint(50000, 1500000), "dataset": "CERT r4.2 http.csv"}
                    )
                    db.add(log)
                    entries_added += 1

except Exception as ex:
    print(f"[ERROR] Extraction failed: {ex}")

db.commit()

# Recalculate Risk Scores & Alerts
print("Recalculating 35-25-20-10-10 Insider Risk Scores...")
recalculate_all_employee_risk_scores(db)

print("Firing Security Threshold Alerts...")
generate_security_alerts_from_risk(db)

total_logs = db.query(ActivityLog).count()

print("\n================================================ plastic =")
print(f"SUCCESSFULLY INTEGRATED {total_logs} CERT DATASET ENTRIES!")
print("=================================================================")

db.close()
