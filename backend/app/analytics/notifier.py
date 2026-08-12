import datetime

def create_system_notification(db, recipient: str, title: str, message: str, notif_type: str, severity: str, employee_id: str = None) -> dict:
    """
    Core utility helper to insert a system notification into MongoDB.
    Types: THREAT_ALERT, CASE_ASSIGNMENT, RISK_ESCALATION, COMPLIANCE_VIOLATION, EVENT_UPDATE
    Severities: INFO, LOW, MEDIUM, HIGH, CRITICAL
    """
    if db is None:
        return {}

    now_str = datetime.datetime.utcnow().isoformat()
    notif_doc = {
        "recipient": recipient,
        "title": title,
        "message": message,
        "type": notif_type.upper(),
        "severity": severity.upper(),
        "employee_id": employee_id,
        "is_read": False,
        "created_at": now_str
    }

    try:
        db.notifications.insert_one(notif_doc)
        notif_doc["_id"] = str(notif_doc["_id"])
        return notif_doc
    except Exception as e:
        print(f"Failed to save system notification to database: {e}")
        return {}
