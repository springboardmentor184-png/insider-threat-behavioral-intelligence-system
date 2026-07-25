import datetime
from typing import List
import pandas as pd
from app.analytics.model import (
    prepare_user_day_features,
    compute_user_deviation_zscores,
    fit_anomaly_isolation_forest
)

def run_static_checks(log: dict) -> tuple:
    """
    Checks for static signatures of suspicious actions (e.g. Tor browser, unauthorized groups).
    Returns (is_anomaly, category, severity, description)
    """
    act_type = log.get("activity_type")
    action = log.get("action")
    target = log.get("target_asset", "")
    meta = log.get("additional_metadata", {})
    
    if act_type == "APP_USAGE" and action == "START":
        if target in ["Tor Browser", "Wireshark Network Scanner", "uTorrent Client"]:
            return True, "UNAUTHORIZED_APPLICATION", "HIGH", f"Security violation: Launched blacklisted diagnostic application: {target}."
            
    elif act_type == "PRIVILEGE_CHANGE" and action == "ELEVATE":
        if "Domain Admins" in target:
            return True, "PRIVILEGE_ABUSE", "CRITICAL", "Critical alert: Unauthorized account elevation to Domain Administrator privileges."
            
    elif act_type == "REMOTE_ACCESS" and action == "ESTABLISH":
        if target in ["Outbound SSH Tunnel", "AnyDesk Connection"]:
            return True, "REMOTE_ACCESS_VIOLATION", "HIGH", f"Security violation: Established unauthorized remote control gateway via {target}."
            
    elif act_type == "EMAIL" and action == "SEND":
        rec = meta.get("email_recipient", "")
        if "competitor" in rec or "protonmail" in rec:
            if meta.get("has_attachments"):
                return True, "DATA_EXFILTRATION", "CRITICAL", f"Critical alert: Sending file attachments to unrecognized domain: {rec}."
            return True, "SUSPICIOUS_COMMUNICATION", "MEDIUM", f"Warning: Outbound email communications to unauthorized domain: {rec}."
            
    elif act_type == "NETWORK":
        if "malicious-domain" in target:
            return True, "MALICIOUS_DESTINATION", "HIGH", "Security violation: Connection established to blacklisted threat domain."
            
    return False, "", "", ""

def scan_for_anomalies(logs: List[dict], db) -> List[dict]:
    """
    Unified anomaly detection scanner. Uses modular functions in model.py
    to perform feature engineering and train the Isolation Forest.
    """
    alerts = []
    
    if not logs:
        return alerts

    # 1. Run Static Signature checks first (Immediate alerts)
    for idx, log in enumerate(logs):
        is_stat, cat, sev, desc = run_static_checks(log)
        if is_stat:
            log_id = log.get("_id") or f"idx_{idx}"
            alerts.append({
                "employee_id": log["employee_id"],
                "alert_type": cat,
                "severity": sev,
                "description": desc,
                "source_log_ids": [str(log_id)],
                "status": "OPEN",
                "timestamp": log["timestamp"]
            })
            
    # 2. Build pandas DataFrame for User-Day aggregations
    df = pd.DataFrame(logs)
    
    # Ensure necessary columns exist
    for col in ["timestamp", "employee_id", "activity_type", "action", "bytes_transferred", "target_asset"]:
        if col not in df.columns:
            df[col] = None
            
    df["bytes_transferred"] = pd.to_numeric(df["bytes_transferred"]).fillna(0)
    df["target_asset"] = df["target_asset"].fillna("")
    
    # Convert timestamps
    try:
        df["datetime"] = pd.to_datetime(df["timestamp"])
        df["hour"] = df["datetime"].dt.hour + df["datetime"].dt.minute / 60.0
        df["day"] = df["datetime"].dt.date
    except Exception as e:
        print(f"Error parsing dates in detector: {e}")
        return alerts

    # Rename employee_id to user for matching Kaggle script
    df = df.rename(columns={"employee_id": "user"})

    # 3. Call Modular ML Pipeline (Imported from model.py)
    try:
        # Step 1: Feature Aggregation
        features_df = prepare_user_day_features(df)
        
        # Step 2: Compute Baselines & Z-Scores
        if len(features_df["user"].unique()) < 1 or len(features_df) < 5:
            # Too little data to train ML. Return static alerts only
            return alerts
            
        features_df = compute_user_deviation_zscores(features_df)
        
        # Step 3: Train & Predict Anomalies
        contamination_rate = 0.025
        if len(features_df) < 40:
            contamination_rate = 0.05
            
        features_df = fit_anomaly_isolation_forest(features_df, contamination=contamination_rate)
        
        # Filter predictions
        ml_anomalies = features_df[features_df["prediction"] == -1]
        
        # 4. Translate ML User-Day anomalies into Alert Records
        for _, row in ml_anomalies.iterrows():
            user = row["user"]
            day = row["day"]
            score = row["anomaly_score"]
            
            # Find matching logs for this user on this day to link them as source evidence
            user_day_logs = df[(df["user"] == user) & (df["day"] == day)]
            source_ids = [str(x) for x in user_day_logs["_id"].dropna().tolist()]
            
            # Compile description details
            desc = (
                f"ML Alert: Multi-dimensional user-day deviation detected. "
                f"Logins: {int(row['logon_count'])} (Z: {round(row['logon_z'], 1)}), "
                f"USBs: {int(row['usb_connect_count'])} (Z: {round(row['usb_z'], 1)}), "
                f"Files: {int(row['file_copy_count'])} (Z: {round(row['file_z'], 1)}), "
                f"Emails: {int(row['email_sent_count'])} (Z: {round(row['email_z'], 1)}), "
                f"Web requests: {int(row['http_count'])} (Z: {round(row['http_z'], 1)}), "
                f"Suspicious URLs: {int(row['suspicious_http_count'])} (Z: {round(row['susp_http_z'], 1)}). "
                f"Avg Logon Hour: {round(row['avg_logon_hour'], 1)} (Z: {round(row['logon_hour_z'], 1)})."
            )
            
            # Determine severity based on deviation score
            severity = "HIGH"
            if score < -0.1:
                severity = "CRITICAL"
            elif score > -0.02:
                severity = "MEDIUM"
                
            alerts.append({
                "employee_id": user,
                "alert_type": "BEHAVIORAL_DEVIATION",
                "severity": severity,
                "description": desc,
                "source_log_ids": source_ids[:10], # Cap source links to 10
                "status": "OPEN",
                "timestamp": datetime.datetime.combine(day, datetime.time(9, 0)).isoformat() # Default to 9:00 AM of that day
            })
            
    except Exception as e:
        print(f"Error executing Isolation Forest pipeline: {e}")
        
    return alerts
