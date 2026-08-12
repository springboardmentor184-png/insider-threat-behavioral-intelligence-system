import datetime
from sqlalchemy.orm import Session
from app.mongodb import get_mongo_db
from app.models import EmployeeProfile

def calculate_employee_risk(employee_id: str, db) -> dict:
    """
    Computes the Insider Risk Score (0-100) for a given employee based on the
    weighted scoring model:
    - Behavioral Anomalies (35%)
    - Privilege Misuse Indicators (25%)
    - Data Access Violations (20%)
    - Access Pattern Deviations (10%)
    - Historical Security Events (10%)
    """
    if db is None:
        return {
            "employee_id": employee_id,
            "score": 0,
            "category": "LOW",
            "breakdown": {
                "behavioral_anomalies": 0.0,
                "privilege_misuse": 0.0,
                "data_access_violations": 0.0,
                "access_pattern_deviations": 0.0,
                "historical_security_events": 0.0
            }
        }

    # Fetch alerts for this employee
    alerts = list(db.alerts.find({"employee_id": employee_id}))

    # 1. Behavioral Anomalies (35%)
    # Count of ML behavioral alerts (excluding resolved alerts)
    ml_alerts = [a for a in alerts if a.get("alert_type") == "BEHAVIORAL_DEVIATION" and a.get("status") != "RESOLVED"]
    behavioral_score = min(100.0, len(ml_alerts) * 25.0)

    # 2. Privilege Misuse Indicators (25%)
    # Elevated rights, admin shifts, or direct privilege abuse alerts
    privilege_alerts = [a for a in alerts if a.get("alert_type") in ["PRIVILEGE_ABUSE", "PRIVILEGE_CHANGE"] and a.get("status") != "RESOLVED"]
    privilege_score = 100.0 if len(privilege_alerts) > 0 else 0.0

    # 3. Data Access Violations (20%)
    # Launch of blocked files transfer tools or exfiltration uploads
    data_alerts = [a for a in alerts if a.get("alert_type") in ["DATA_EXFILTRATION", "UNAUTHORIZED_APPLICATION"] and a.get("status") != "RESOLVED"]
    data_score = 100.0 if len(data_alerts) > 0 else 0.0

    # 4. Access Pattern Deviations (10%)
    # Outbound tunnels or connection to malicious host domains
    access_alerts = [a for a in alerts if a.get("alert_type") in ["REMOTE_ACCESS_VIOLATION", "MALICIOUS_DESTINATION"] and a.get("status") != "RESOLVED"]
    access_score = 100.0 if len(access_alerts) > 0 else 0.0

    # 5. Historical Security Events (10%)
    # Count of resolved alerts or active/escalated security cases in the last 30 days
    # (Checking database collections for historical context)
    resolved_alerts_count = db.alerts.count_documents({
        "employee_id": employee_id,
        "status": "RESOLVED"
    })
    incident_cases_count = db.incidents.count_documents({
        "employee_id": employee_id,
        "status": {"$ne": "RESOLVED"}
    }) if hasattr(db, "incidents") else 0
    
    historical_score = min(100.0, (resolved_alerts_count + incident_cases_count) * 20.0)

    # Compute base activity baseline (so active employees have a non-zero risk footprint)
    logon_count = db.activity_logs.count_documents({"employee_id": employee_id, "activity_type": "LOGON"})
    usb_count = db.activity_logs.count_documents({"employee_id": employee_id, "activity_type": "USB"})
    file_count = db.activity_logs.count_documents({"employee_id": employee_id, "activity_type": "FILE"})
    email_count = db.activity_logs.count_documents({"employee_id": employee_id, "activity_type": "EMAIL"})
    http_count = db.activity_logs.count_documents({"employee_id": employee_id, "activity_type": "HTTP"})
    
    activity_base = min(25.0, (logon_count * 1.5) + (usb_count * 3.5) + (file_count * 0.8) + (email_count * 1.8) + (http_count * 0.05))

    # Compute weighted score
    weighted_score = (
        0.35 * behavioral_score +
        0.25 * privilege_score +
        0.20 * data_score +
        0.10 * access_score +
        0.10 * historical_score
    )

    # Apply severity floors to make sure critical/high alerts yield critical/high risk categories
    severity_floor = 0
    for a in alerts:
        if a.get("status") != "RESOLVED":
            sev = a.get("severity", "LOW")
            if sev == "CRITICAL":
                severity_floor = max(severity_floor, 80)
            elif sev == "HIGH":
                severity_floor = max(severity_floor, 55)
            elif sev == "MEDIUM":
                severity_floor = max(severity_floor, 30)
            elif sev == "LOW":
                severity_floor = max(severity_floor, 15)

    final_score = min(100, max(int(round(weighted_score + activity_base)), severity_floor))
    
    # Categorize Risk Level
    if final_score <= 25:
        category = "LOW"
    elif final_score <= 50:
        category = "MEDIUM"
    elif final_score < 75:
        category = "HIGH"
    else:
        category = "CRITICAL"

    today_str = datetime.date.today().isoformat()

    risk_doc = {
        "employee_id": employee_id,
        "date": today_str,
        "score": final_score,
        "category": category,
        "breakdown": {
            "behavioral_anomalies": behavioral_score,
            "privilege_misuse": privilege_score,
            "data_access_violations": data_score,
            "access_pattern_deviations": access_score,
            "historical_security_events": historical_score
        },
        "last_updated": datetime.datetime.utcnow().isoformat()
    }

    # Save to MongoDB
    db.risk_scores.update_one(
        {"employee_id": employee_id, "date": today_str},
        {"$set": risk_doc},
        upsert=True
    )

    # Trigger risk escalation notification if category is HIGH or CRITICAL (limit to 1 per 24 hours per user)
    if db is not None and category in ["HIGH", "CRITICAL"]:
        one_day_ago = (datetime.datetime.utcnow() - datetime.timedelta(hours=24)).isoformat()
        existing_notif = db.notifications.find_one({
            "employee_id": employee_id,
            "type": "RISK_ESCALATION",
            "created_at": {"$gte": one_day_ago}
        })
        if not existing_notif:
            from app.analytics.notifier import create_system_notification
            if category == "CRITICAL":
                create_system_notification(
                    db,
                    recipient="Administrator",
                    title="Critical Risk Detected",
                    message=f"Employee {employee_id} has reached Critical Risk.",
                    notif_type="RISK_ESCALATION",
                    severity="CRITICAL",
                    employee_id=employee_id
                )
                create_system_notification(
                    db,
                    recipient="Security Manager",
                    title="Critical Risk Detected",
                    message=f"Employee {employee_id} has reached Critical Risk.",
                    notif_type="RISK_ESCALATION",
                    severity="CRITICAL",
                    employee_id=employee_id
                )
                
                # Send real email notifications
                from app.database import SessionLocal
                from app.models import User
                from app.email_sender import send_real_email
                sql_db = SessionLocal()
                try:
                    recipients = sql_db.query(User).filter(User.role.in_(["Security Manager", "Administrator"])).all()
                    for r in recipients:
                        to_email = r.email
                        from app.email_sender import SMTP_USER
                        subject = f"CRITICAL Insider Risk Alert - {employee_id}"
                        body = (
                            f"Employee: {employee_id}\n"
                            f"Risk Score: {final_score}\n"
                            f"Category: {category}\n\n"
                            f"Reason:\n"
                            f"Multiple behavioral anomalies detected.\n\n"
                            f"Please investigate the employee timeline.\n\n"
                            f"--------------------------------------------------\n"
                            f"Sender: Insider Threat Behavioral Intelligence System <{SMTP_USER}>"
                        )
                        send_real_email(to_email, subject, body)
                except Exception as email_err:
                    print(f"Failed to send critical risk email: {email_err}")
                finally:
                    sql_db.close()
            else:
                create_system_notification(
                    db,
                    recipient="Security Manager",
                    title="High Risk Alert",
                    message=f"Employee {employee_id} has reached High Risk.",
                    notif_type="RISK_ESCALATION",
                    severity="HIGH",
                    employee_id=employee_id
                )

    return risk_doc

def calculate_all_risk_scores(db, sql_db: Session) -> int:
    """
    Recalculates risk scores for all onboarded employees in PostgreSQL and stores
    results in MongoDB.
    """
    if db is None or sql_db is None:
        return 0

    # Query all active employees in corporate directory
    employees = sql_db.query(EmployeeProfile.employee_id).all()
    count = 0
    
    for emp in employees:
        calculate_employee_risk(emp.employee_id, db)
        count += 1
        
    return count
