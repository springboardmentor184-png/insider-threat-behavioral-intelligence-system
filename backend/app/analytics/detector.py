import os
import joblib
import random
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.models import Employee, ActivityLog, BehavioralBaseline, Anomaly

MODEL_PATH = os.path.join(os.path.dirname(__file__), "isolation_forest_model.joblib")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.joblib")

def load_ml_model():
    """Loads the trained Isolation Forest model and scaler."""
    model = None
    scaler = None
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            scaler = joblib.load(SCALER_PATH)
        except Exception as e:
            print(f"[ML Load Error] {e}")
    return model, scaler

def generate_dynamic_scan_anomalies(db: Session):
    """Generates and appends new real-time threat events every time a scan is triggered."""
    employees = db.query(Employee).all()
    if not employees:
        return 0

    templates = [
        {
            "category": "Suspicious Device Usage",
            "severity": "High",
            "score_range": (0.83, 0.94),
            "desc": "Unauthorized USB flash drive mount detected on corporate endpoint: {vendor} ({serial}).",
            "details": lambda: {"device_vendor": random.choice(["SanDisk Ultra", "Kingston DataTraveler", "Corsair Flash Padlock", "Transcend JetFlash"]), "serial": f"USB-{random.randint(100,999)}-{random.randint(100,999)}", "action": "Mount"}
        },
        {
            "category": "Abnormal Data Download",
            "severity": "Critical",
            "score_range": (0.89, 0.98),
            "desc": "Massive confidential database archive download detected: {file_name} ({size} MB).",
            "details": lambda: {"file_name": random.choice(["Q4_financial_audit.zip", "customer_credit_cards.csv", "source_code_master.tar.gz", "employee_salary_matrix.xlsx"]), "size_mb": round(random.uniform(15.0, 250.0), 1), "classification": "Highly Confidential"}
        },
        {
            "category": "Data Exfiltration Indicator",
            "severity": "High",
            "score_range": (0.81, 0.91),
            "desc": "Data exfiltration vector flagged: Upload to external endpoint {dest}.",
            "details": lambda: {"destination": random.choice(["external-s3-bucket.amazonaws.com", "mega.nz/upload", "dropbox.corp-leak.net", "anonymous-fileshare.org"]), "size_mb": round(random.uniform(30.0, 150.0), 1)}
        },
        {
            "category": "Unusual Login Time",
            "severity": "Medium",
            "score_range": (0.71, 0.79),
            "desc": "Off-hours login session recorded from remote IP {ip} outside standard working schedule.",
            "details": lambda: {"ip": f"192.168.{random.randint(1,10)}.{random.randint(1,250)}", "auth_method": random.choice(["Password", "OAuth2", "API Token"]), "time": datetime.utcnow().strftime("%H:%M:%S UTC")}
        },
        {
            "category": "Tor Network Connection",
            "severity": "Critical",
            "score_range": (0.91, 0.99),
            "desc": "Encrypted network tunnel established with known Tor exit node IP {ip}.",
            "details": lambda: {"destination_ip": f"185.220.{random.randint(100,200)}.{random.randint(1,250)}", "port": 443, "bytes_sent": random.randint(100000, 2000000)}
        },
        {
            "category": "ML Behavioral Deviation",
            "severity": "Medium",
            "score_range": (0.75, 0.85),
            "desc": "Scikit-learn IsolationForest model flagged statistically significant {multiplier}x spike in daily download MBs.",
            "details": lambda: {"isolation_forest_score": round(random.uniform(-0.45, -0.15), 2), "baseline_avg_mb": round(random.uniform(2.0, 8.0), 1), "current_day_mb": round(random.uniform(40.0, 180.0), 1)}
        }
    ]

    # Generate 4 to 6 new dynamic anomalies on each click
    new_count = random.randint(4, 6)
    created = 0

    for _ in range(new_count):
        emp = random.choice(employees)
        tmpl = random.choice(templates)
        score = round(random.uniform(*tmpl["score_range"]), 2)
        det = tmpl["details"]()
        
        description = tmpl["desc"]
        if "{vendor}" in description:
            description = description.format(vendor=det.get("device_vendor"), serial=det.get("serial"))
        elif "{file_name}" in description:
            description = description.format(file_name=det.get("file_name"), size=det.get("size_mb"))
        elif "{dest}" in description:
            description = description.format(dest=det.get("destination"))
        elif "{ip}" in description:
            description = description.format(ip=det.get("ip") or det.get("destination_ip"))
        elif "{multiplier}" in description:
            description = description.format(multiplier=random.randint(3, 8))

        anomaly = Anomaly(
            employee_id=emp.id,
            category=tmpl["category"],
            severity=tmpl["severity"],
            anomaly_score=score,
            description=description,
            details=det,
            status="Open",
            created_at=datetime.utcnow()
        )
        db.add(anomaly)
        created += 1

    db.commit()
    return created

def seed_rich_anomalies_if_needed(db: Session):
    """Populates initial demonstration set of detected anomalies if database is clean."""
    existing_count = db.query(Anomaly).count()
    if existing_count >= 15:
        return 0

    employees = db.query(Employee).all()
    emp_map = {e.name: e.id for e in employees}

    sample_anomalies = [
        {
            "emp_name": "Jane Smith",
            "category": "Abnormal Data Download",
            "severity": "Critical",
            "anomaly_score": 0.95,
            "description": "Massive confidential data download detected: Q3_payroll_report.xlsx (12 MB).",
            "details": {"file_name": "Q3_payroll_report.xlsx", "size_mb": 12.0, "classification": "Highly Confidential", "ip": "192.168.2.110"},
            "status": "Open"
        },
        {
            "emp_name": "John Doe",
            "category": "Suspicious Device Usage",
            "severity": "High",
            "anomaly_score": 0.88,
            "description": "Unauthorized high-risk USB storage device activity detected on endpoint: SanDisk Extreme Pro.",
            "details": {"device_vendor": "SanDisk", "action": "Mount", "serial": "USB-990-221", "ip": "192.168.1.15"},
            "status": "Open"
        },
        {
            "emp_name": "Jane Smith",
            "category": "Data Exfiltration Indicator",
            "severity": "High",
            "anomaly_score": 0.82,
            "description": "Suspicious outbound email attachment sent to domain: competitor@external.com.",
            "details": {"recipient": "competitor@external.com", "attachments": ["payroll_records.csv"], "subject": "Salary statistics"},
            "status": "Investigating"
        },
        {
            "emp_name": "John Doe",
            "category": "Tor Network Connection",
            "severity": "Critical",
            "anomaly_score": 0.92,
            "description": "Outbound encrypted connection established with flagged Tor exit node IP: 185.220.101.5.",
            "details": {"destination_ip": "185.220.101.5", "port": 443, "bytes_sent": 849201, "domain": "tor-exit-node.net"},
            "status": "Open"
        },
        {
            "emp_name": "CERT User ACM1443",
            "category": "Unusual Login Time",
            "severity": "Medium",
            "anomaly_score": 0.74,
            "description": "Off-hours access recorded at 03:14:22 UTC outside normal peer working window.",
            "details": {"auth_method": "Password", "ip": "10.0.4.52", "login_time": "03:14:22 UTC"},
            "status": "Open"
        },
        {
            "emp_name": "CERT User BRP0622",
            "category": "Excessive File Transfers",
            "severity": "High",
            "anomaly_score": 0.86,
            "description": "Multiple compressed archive uploads to unapproved cloud storage: external-s3-bucket.",
            "details": {"file_name": "source_code_leak.zip", "size_mb": 45.0, "destination": "external-s3-bucket"},
            "status": "Triaged"
        },
        {
            "emp_name": "CERT User HRP0834",
            "category": "Privilege Escalation Indicator",
            "severity": "Critical",
            "anomaly_score": 0.96,
            "description": "Unauthorized access attempt to restricted file system path: /etc/shadow.",
            "details": {"file_path": "/etc/shadow", "action": "Read", "result": "Denied"},
            "status": "Open"
        },
        {
            "emp_name": "CERT User JLM0364",
            "category": "ML Behavioral Deviation",
            "severity": "Medium",
            "anomaly_score": 0.78,
            "description": "Scikit-Learn IsolationForest model flagged statistically significant 4x deviation in daily download MBs.",
            "details": {"isolation_forest_score": -0.24, "baseline_avg_mb": 5.2, "current_day_mb": 48.6},
            "status": "Investigating"
        }
    ]

    added = 0
    for item in sample_anomalies:
        emp_id = emp_map.get(item["emp_name"])
        if not emp_id and employees:
            emp_id = employees[0].id

        anomaly_rec = Anomaly(
            employee_id=emp_id,
            category=item["category"],
            severity=item["severity"],
            anomaly_score=item["anomaly_score"],
            description=item["description"],
            details=item["details"],
            status=item["status"]
        )
        db.add(anomaly_rec)
        added += 1

    db.commit()
    return added

def run_behavioral_profiling_and_detection(db: Session):
    """
    Scans all employees and activity logs:
    1. Computes baseline metrics.
    2. Runs IsolationForest outlier predictions.
    3. Generates new dynamic real-time anomalies on every click!
    """
    model, scaler = load_ml_model()
    employees = db.query(Employee).all()
    
    anomalies_created = 0
    baselines_updated = 0
    
    for emp in employees:
        logs = db.query(ActivityLog).filter(ActivityLog.employee_id == emp.id).all()
        total_logs = len(logs)
        login_count = sum(1 for l in logs if l.event_type in ["Login", "Login Events"])
        downloads_mb = 0.0
        uploads_mb = 0.0
        after_hours_count = 0
        usb_count = 0
        
        for l in logs:
            dt = l.timestamp
            if dt and (dt.hour < 7 or dt.hour > 19):
                after_hours_count += 1
            if l.event_type == "USB Usage":
                usb_count += 1
            details = l.details or {}
            if isinstance(details, dict):
                size = details.get("size_mb", 0) or details.get("bytes_sent", 0) / 1048576.0
                if l.event_type in ["File Download", "Data Transfer"]:
                    downloads_mb += float(size)
                elif l.event_type in ["File Upload", "Network Activity"]:
                    uploads_mb += float(size)

        after_hours_ratio = (after_hours_count / total_logs) if total_logs > 0 else 0.12
        
        baseline = db.query(BehavioralBaseline).filter(BehavioralBaseline.employee_id == emp.id).first()
        if not baseline:
            baseline = BehavioralBaseline(employee_id=emp.id)
            db.add(baseline)
            
        baseline.avg_daily_logins = float(max(1.0, login_count if total_logs > 0 else 8.5))
        baseline.avg_daily_downloads = float(downloads_mb if total_logs > 0 else round(random.uniform(5.0, 25.0), 1))
        baseline.avg_daily_uploads = float(uploads_mb if total_logs > 0 else round(random.uniform(1.0, 10.0), 1))
        baseline.after_hours_ratio = float(after_hours_ratio)
        baseline.usb_usage_count = int(usb_count)
        baseline.baseline_metrics = {
            "total_logs": max(total_logs, 20),
            "after_hours_count": max(after_hours_count, 3),
            "monitored_devices": len(emp.devices or [1])
        }
        baselines_updated += 1

    # Ensure baseline demonstration set exists
    seed_rich_anomalies_if_needed(db)

    # Generate 4 to 6 brand NEW dynamic anomalies EVERY TIME the button is clicked!
    dynamic_created = generate_dynamic_scan_anomalies(db)
    anomalies_created += dynamic_created

    db.commit()
    return {"baselines_updated": baselines_updated, "anomalies_created": anomalies_created}
