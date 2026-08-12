import datetime
import math
from typing import List, Dict

def generate_employee_baseline(employee_id: str, db) -> dict:
    """
    Computes statistical normal behavioral baselines for a specific employee
    using historical user activity logs stored in MongoDB.
    """
    if db is not None:
        try:
            logs = list(db.activity_logs.find({"employee_id": employee_id}))
        except Exception:
            logs = []
    else:
        # Fallback to local memory logs if MongoDB is offline
        from app.routers.logs import IN_MEMORY_LOGS
        logs = [x for x in IN_MEMORY_LOGS if x.get("employee_id") == employee_id]
        
    baseline = {
        "employee_id": employee_id,
        "total_events_analyzed": len(logs),
        "login_hours": {"mean": 9.0, "std": 1.5, "count": 0},
        "usb_device": {"mean": 0.0, "std": 0.0, "count": 0, "daily_counts": {}},
        "file_access": {"mean": 0.0, "std": 0.0, "count": 0, "daily_counts": {}},
        "network_bytes": {"mean": 0.0, "std": 0.0, "count": 0},
        "top_apps": [],
        "top_email_recipients": []
    }
    
    if not logs:
        return baseline
        
    login_hours = []
    usb_dates = {}
    file_dates = {}
    net_bytes = []
    app_counts = {}
    email_counts = {}
    
    for log in logs:
        try:
            dt = datetime.datetime.fromisoformat(log["timestamp"])
        except Exception:
            continue
            
        date_key = dt.date().isoformat()
        act_type = log.get("activity_type")
        action = log.get("action")
        
        if act_type == "LOGIN" and action == "LOGON":
            login_hours.append(dt.hour + dt.minute / 60.0)
            
        elif act_type == "USB_DEVICE" and action == "CONNECT":
            usb_dates[date_key] = usb_dates.get(date_key, 0) + 1
            
        elif act_type == "FILE_ACCESS" and action in ["WRITE", "COPY"]:
            file_dates[date_key] = file_dates.get(date_key, 0) + 1
            
        elif act_type == "NETWORK":
            net_bytes.append(float(log.get("bytes_transferred", 0)))
            
        elif act_type == "APP_USAGE" and action == "START":
            app_name = log.get("target_asset", "Unknown")
            app_counts[app_name] = app_counts.get(app_name, 0) + 1
            
        elif act_type == "EMAIL" and action == "SEND":
            rec = log.get("additional_metadata", {}).get("email_recipient", "unknown")
            email_counts[rec] = email_counts.get(rec, 0) + 1

    def calc_stats(data_list):
        if not data_list:
            return 0.0, 0.0
        mean = sum(data_list) / len(data_list)
        variance = sum((x - mean) ** 2 for x in data_list) / len(data_list)
        std = math.sqrt(variance)
        return round(mean, 2), round(std, 2)

    # 1. Login Hour Stats
    if login_hours:
        mean_hr, std_hr = calc_stats(login_hours)
        baseline["login_hours"] = {
            "mean": mean_hr,
            "std": std_hr if std_hr > 0.5 else 0.5, # Cap minimum deviation to avoid division by zero
            "count": len(login_hours)
        }
        
    # 2. USB Usage Daily Stats
    if usb_dates:
        usb_vals = list(usb_dates.values())
        mean_usb, std_usb = calc_stats(usb_vals)
        baseline["usb_device"] = {
            "mean": mean_usb,
            "std": std_usb if std_usb > 0.2 else 0.2,
            "count": sum(usb_vals),
            "daily_counts": usb_dates
        }
        
    # 3. File Copy Daily Stats
    if file_dates:
        file_vals = list(file_dates.values())
        mean_file, std_file = calc_stats(file_vals)
        baseline["file_access"] = {
            "mean": mean_file,
            "std": std_file if std_file > 0.5 else 0.5,
            "count": sum(file_vals),
            "daily_counts": file_dates
        }
        
    # 4. Network Volume Stats
    if net_bytes:
        mean_net, std_net = calc_stats(net_bytes)
        baseline["network_bytes"] = {
            "mean": mean_net,
            "std": std_net if std_net > 100.0 else 100.0,
            "count": len(net_bytes)
        }
        
    # 5. Top application interactions & email recipients
    baseline["top_apps"] = sorted([{"app": k, "count": v} for k, v in app_counts.items()], key=lambda x: x["count"], reverse=True)[:5]
    baseline["top_email_recipients"] = sorted([{"recipient": k, "count": v} for k, v in email_counts.items()], key=lambda x: x["count"], reverse=True)[:5]
    
    return baseline
