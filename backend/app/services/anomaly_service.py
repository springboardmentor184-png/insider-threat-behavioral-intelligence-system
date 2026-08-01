from sqlalchemy.orm import Session
from datetime import datetime
import json
import numpy as np
from sklearn.ensemble import IsolationForest

from app.models.activity import Activity
from app.models.alert import Alert
from app.models.employee import Employee

def detect_anomalies(db: Session):
    # 1. Fetch all activities
    activities = db.query(Activity).all()
    if not activities:
        return {"new_alerts": 0, "message": "No activities found to scan."}

    # Prepare historical profiling
    # We will build employee baselines
    user_baselines = {}
    
    # Pre-parse descriptions and group by employee
    parsed_activities = []
    for act in activities:
        desc_data = {}
        try:
            desc_data = json.loads(act.description) if act.description else {}
        except Exception:
            pass
        
        # Extract file size if present
        file_size = desc_data.get("file_size_kb", 0)
        
        parsed_activities.append({
            "id": act.id,
            "activity_name": act.activity_name,
            "performed_by": act.performed_by,
            "status": act.status,
            "timestamp": act.timestamp,
            "hour": act.timestamp.hour,
            "file_size": file_size,
            "location": desc_data.get("location", ""),
            "act_object": act,
            "desc_data": desc_data
        })
        
        email = act.performed_by
        if email not in user_baselines:
            user_baselines[email] = {
                "hours": [],
                "file_sizes": []
            }
        
        user_baselines[email]["hours"].append(act.timestamp.hour)
        if file_size > 0:
            user_baselines[email]["file_sizes"].append(file_size)

    # 2. Train an Isolation Forest globally for ML anomaly detection
    # Features: hour of day, activity_type_index, status_index, file_size
    activity_map = {"login": 0, "file_access": 1, "email": 2, "logout": 3, "usb_device": 4, "privilege_change": 5}
    status_map = {"SUCCESS": 0, "FAILED": 1}
    
    X = []
    for item in parsed_activities:
        act_type_idx = activity_map.get(item["activity_name"], 9)
        stat_idx = status_map.get(item["status"], 0)
        X.append([item["hour"], act_type_idx, stat_idx, float(item["file_size"])])
        
    X_arr = np.array(X)
    
    # Train Isolation Forest (we fit on all data and label outliers)
    ml_flagged_ids = set()
    if len(X_arr) >= 10: # Only run Isolation Forest if there is sufficient data
        clf = IsolationForest(contamination=0.05, random_state=42)
        preds = clf.fit_predict(X_arr) # -1 is anomaly, 1 is normal
        for idx, pred in enumerate(preds):
            if pred == -1:
                ml_flagged_ids.add(parsed_activities[idx]["id"])

    # 3. Analyze each activity (Hybrid rules + Statistical baselines + ML)
    new_alerts_count = 0
    
    for item in parsed_activities:
        act = item["act_object"]
        email = item["performed_by"]
        desc = item["desc_data"]
        
        # Check if alert already exists for this activity
        exists = db.query(Alert).filter(Alert.activity_id == act.id).first()
        if exists:
            continue
            
        is_anomalous = False
        alert_title = ""
        alert_desc = ""
        alert_severity = "Low"
        alert_category = "Insider Risk Indicators"
        
        # Get employee info
        emp = db.query(Employee).filter(Employee.email == email).first()
        employee_id = emp.employee_id if emp else "UNKNOWN"
        
        # RULE 1: Failed access attempt (Privilege Abuse / Data Access Violation)
        if act.status == "FAILED" and act.activity_name == "file_access":
            is_anomalous = True
            alert_title = "Unauthorized Access Attempt"
            alert_desc = f"Employee attempted to access a protected file and was denied: {desc.get('file_name', 'Unknown File')} at path {desc.get('file_path', 'Unknown Path')}."
            alert_severity = "High"
            alert_category = "Unauthorized Access Attempts"
            
        # RULE 2: USB Device Insertion (Suspicious Device Usage)
        elif act.activity_name == "usb_device" and desc.get("action") == "PLUG_IN":
            is_anomalous = True
            alert_title = "Suspicious USB Device Connected"
            alert_desc = f"USB device plugged in: {desc.get('device_name', 'Unknown USB')} (S/N: {desc.get('serial_number', 'N/A')})."
            alert_severity = "Medium"
            alert_category = "Suspicious Device Usage"
            
        # RULE 3: Multiple failed login attempts (Suspicious Activity)
        elif act.status == "FAILED" and act.activity_name == "login":
            # Check if there were multiple failures
            recent_failures = [p for p in parsed_activities if p["performed_by"] == email 
                               and p["activity_name"] == "login" and p["status"] == "FAILED"
                               and abs((p["timestamp"] - act.timestamp).total_seconds()) < 600] # within 10 minutes
            if len(recent_failures) >= 3:
                is_anomalous = True
                alert_title = "Brute Force Login Attempt"
                alert_desc = f"Multiple failed login attempts ({len(recent_failures)}) from IP {item['location'] or desc.get('ip_address', 'unknown')}."
                alert_severity = "High"
                alert_category = "Unusual Login Time"

        # RULE 4: Privilege Escalation / Modification
        elif act.activity_name == "privilege_change" and act.status == "SUCCESS":
            is_anomalous = True
            alert_title = "Privilege Modification Detected"
            alert_desc = f"Privilege change performed: {desc.get('action')} targetting {desc.get('target_user')}."
            alert_severity = "Critical"
            alert_category = "Insider Risk Indicators"

        # STATISTICAL CHECK 1: File Download size (Z-score check)
        if not is_anomalous and item["file_size"] > 0:
            sizes = user_baselines[email]["file_sizes"]
            if len(sizes) >= 5: # Need baseline sizes
                mean_size = np.mean(sizes)
                std_size = np.std(sizes)
                if std_size > 0:
                    z_score = (item["file_size"] - mean_size) / std_size
                    # Flag if file size is extremely large (> 3 standard deviations)
                    if z_score > 3.0 or item["file_size"] > 1000000: # or > 1GB
                        is_anomalous = True
                        alert_title = "Abnormal Data Download Volume"
                        alert_desc = f"Data download size ({item['file_size']/1000:.1f} MB) is significantly higher than user baseline mean ({mean_size/1000:.1f} MB)."
                        alert_severity = "Critical" if item["file_size"] > 5000000 else "High"
                        alert_category = "Abnormal Data Download"
            else:
                # Fallback rule if no baseline: absolute high download size
                if item["file_size"] > 5000000: # 5GB
                    is_anomalous = True
                    alert_title = "High Volume File Transfer"
                    alert_desc = f"High volume file download: {desc.get('file_name', 'Unknown')} ({item['file_size']/1000:.1f} MB)."
                    alert_severity = "High"
                    alert_category = "Excessive File Transfers"

        # STATISTICAL CHECK 2: Unusual Working Hours
        if not is_anomalous and act.activity_name == "login":
            hours = user_baselines[email]["hours"]
            if len(hours) >= 10:
                # Count login occurrences in off-hours (10pm - 6am)
                if item["hour"] >= 22 or item["hour"] <= 5:
                    # Let's see if this is normal for them (less than 10% of their login history is in off-hours)
                    off_hour_logins = sum(1 for h in hours if h >= 22 or h <= 5)
                    off_hour_ratio = off_hour_logins / len(hours)
                    if off_hour_ratio < 0.15: # < 15% ratio makes it unusual
                        is_anomalous = True
                        alert_title = "Unusual Off-Hours Access"
                        alert_desc = f"Employee logged in at {item['hour']}:00, which is outside their standard working hours baseline."
                        alert_severity = "Medium"
                        alert_category = "Unusual Login Time"
            else:
                # Fallback: simple absolute weekend or late night login
                if item["hour"] >= 22 or item["hour"] <= 5:
                    is_anomalous = True
                    alert_title = "Late Night Login Detected"
                    alert_desc = f"Login event at {item['hour']}:00 PM/AM."
                    alert_severity = "Low"
                    alert_category = "Unusual Login Time"

        # ML CHECK FALLBACK: If Isolation Forest flagged it, and it didn't trigger any rules, flag as anomaly
        if not is_anomalous and act.id in ml_flagged_ids:
            is_anomalous = True
            alert_title = "Behavioral Deviation Detected (ML Model)"
            alert_desc = f"Machine learning anomaly model identified this activity as anomalous deviation from behavior."
            alert_severity = "Low"
            alert_category = "Insider Risk Indicators"

        # 4. Save Alert if anomalous
        if is_anomalous:
            new_alert = Alert(
                employee_id=employee_id,
                activity_id=act.id,
                title=alert_title,
                description=alert_desc,
                severity=alert_severity,
                category=alert_category,
                status="Open",
                timestamp=act.timestamp
            )
            db.add(new_alert)
            new_alerts_count += 1
            
    db.commit()
    return {"new_alerts": new_alerts_count, "message": f"Successfully completed scanning. Generated {new_alerts_count} new alerts."}
