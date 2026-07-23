import os
import joblib
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

def run_behavioral_profiling_and_detection(db: Session):
    """
    Scans all employees and activity logs:
    1. Computes baseline metrics (logins per day, download MBs, upload MBs, after-hours ratio, USB activity).
    2. Stores/Updates BehavioralBaseline records.
    3. Scans for anomalies using rule heuristics + IsolationForest model.
    4. Records generated Anomaly records in the database.
    """
    model, scaler = load_ml_model()
    employees = db.query(Employee).all()
    
    anomalies_created = 0
    baselines_updated = 0
    
    for emp in employees:
        logs = db.query(ActivityLog).filter(ActivityLog.employee_id == emp.id).all()
        if not logs:
            continue
            
        # Calculate behavioral metrics
        total_logs = len(logs)
        login_count = sum(1 for l in logs if l.event_type in ["Login", "Login Events"])
        
        # Download / Upload size calculations from details JSON
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

        after_hours_ratio = (after_hours_count / total_logs) if total_logs > 0 else 0.0
        
        # 1. Store or update BehavioralBaseline
        baseline = db.query(BehavioralBaseline).filter(BehavioralBaseline.employee_id == emp.id).first()
        if not baseline:
            baseline = BehavioralBaseline(employee_id=emp.id)
            db.add(baseline)
            
        baseline.avg_daily_logins = float(login_count)
        baseline.avg_daily_downloads = float(downloads_mb)
        baseline.avg_daily_uploads = float(uploads_mb)
        baseline.after_hours_ratio = float(after_hours_ratio)
        baseline.usb_usage_count = int(usb_count)
        baseline.baseline_metrics = {
            "total_logs": total_logs,
            "after_hours_count": after_hours_count,
            "monitored_devices": len(emp.devices or [])
        }
        baselines_updated += 1

        # 2. Rule-based & ML Anomaly Detection per log event
        for l in logs:
            # Check if an anomaly already exists for this activity log
            existing_anomaly = db.query(Anomaly).filter(Anomaly.activity_log_id == l.id).first()
            if existing_anomaly:
                continue
                
            is_anomaly = False
            anomaly_cat = "Suspicious Behavioral Indicator"
            anomaly_sev = "Medium"
            anomaly_score = 0.65
            desc = f"Anomalous pattern detected during {l.event_type} event."
            
            # Rule Heuristics
            details = l.details or {}
            dt = l.timestamp
            
            if l.event_type == "USB Usage" and l.severity in ["High", "Critical"]:
                is_anomaly = True
                anomaly_cat = "Suspicious Device Usage"
                anomaly_sev = l.severity
                anomaly_score = 0.88
                desc = f"Unauthorized or high-risk USB storage device activity detected on endpoint: {details.get('device_vendor', 'Removable Media')}."
                
            elif l.event_type == "File Download" and l.severity == "Critical":
                is_anomaly = True
                anomaly_cat = "Abnormal Data Download"
                anomaly_sev = "Critical"
                anomaly_score = 0.95
                desc = f"Massive or confidential data download detected: {details.get('file_name', 'sensitive_data.xlsx')} ({details.get('size_mb', 'N/A')} MB)."
                
            elif l.event_type == "File Upload" and l.severity in ["High", "Critical"]:
                is_anomaly = True
                anomaly_cat = "Data Exfiltration Indicator"
                anomaly_sev = "High"
                anomaly_score = 0.85
                desc = f"Data exfiltration vector flagged: Upload to external endpoint {details.get('destination', 'External Cloud')}."
                
            elif l.event_type == "Email Activity" and l.severity == "High":
                is_anomaly = True
                anomaly_cat = "Excessive File Transfers"
                anomaly_sev = "High"
                anomaly_score = 0.82
                desc = f"Suspicious outbound email attachment sent to domain: {details.get('recipient', 'External domain')}."

            elif dt and (dt.hour < 5 or dt.hour > 22):
                is_anomaly = True
                anomaly_cat = "Unusual Login Time"
                anomaly_sev = "Medium"
                anomaly_score = 0.72
                desc = f"Off-hours access recorded at {dt.strftime('%H:%M:%S')} UTC."

            # ML Model evaluation if ML model is loaded
            if model and scaler and not is_anomaly:
                try:
                    feat = np.array([[float(login_count), float(downloads_mb), float(uploads_mb), float(after_hours_ratio), int(usb_count)]])
                    feat_scaled = scaler.transform(feat)
                    pred = model.predict(feat_scaled)[0] # -1 for anomaly, 1 for normal
                    if pred == -1:
                        is_anomaly = True
                        anomaly_cat = "ML Behavioral Deviation"
                        anomaly_sev = "Medium"
                        anomaly_score = 0.78
                        desc = f"Scikit-learn IsolationForest model flagged statistically significant deviation from normal peer baseline."
                except Exception as ex:
                    pass

            if is_anomaly:
                anomaly_rec = Anomaly(
                    employee_id=emp.id,
                    activity_log_id=l.id,
                    category=anomaly_cat,
                    severity=anomaly_sev,
                    anomaly_score=anomaly_score,
                    description=desc,
                    details=details,
                    status="Open"
                )
                db.add(anomaly_rec)
                anomalies_created += 1
                
    db.commit()
    return {"baselines_updated": baselines_updated, "anomalies_created": anomalies_created}
