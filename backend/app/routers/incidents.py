from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import datetime
from bson import ObjectId
from app.mongodb import get_mongo_db
from app.models import User
from app.auth import get_current_user, RoleChecker
from app.analytics.risk_scorer import calculate_employee_risk

router = APIRouter(prefix="/api/incidents", tags=["Incident & Incident Case Management"])

require_read = RoleChecker(["Administrator", "Security Analyst", "SOC Engineer", "Security Manager"])
require_write = RoleChecker(["Administrator", "Security Analyst", "Security Manager"])

@router.post("")
def create_incident_case(
    body: dict,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_write)
):
    """
    Escalates an anomalous behavior alert or log footprint into a formal
    security incident case file (INC-XXXX).
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database offline.")

    employee_id = body.get("employee_id")
    title = body.get("title")
    description = body.get("description", "")
    severity = body.get("severity", "MEDIUM")
    evidence_alerts = body.get("evidence_alerts", [])
    evidence_logs = body.get("evidence_logs", [])

    if not employee_id or not title:
        raise HTTPException(status_code=400, detail="employee_id and title parameters are required.")

    # Generate sequential incident ID INC-XXXX
    count = db.incidents.count_documents({})
    incident_id = f"INC-{(count + 1):04d}"

    now_str = datetime.datetime.utcnow().isoformat()
    
    incident_doc = {
        "incident_id": incident_id,
        "employee_id": employee_id,
        "title": title,
        "description": description,
        "status": "OPEN",
        "severity": severity.upper(),
        "analyst_assigned": current_user.email,
        "evidence_alerts": evidence_alerts,
        "evidence_logs": evidence_logs,
        "notes": [
            {
                "timestamp": now_str,
                "analyst": current_user.email,
                "text": f"System Alert: Incident case file created by {current_user.full_name}."
            }
        ],
        "created_at": now_str,
        "updated_at": now_str
    }

    try:
        db.incidents.insert_one(incident_doc)
        
        # Generate CASE_ASSIGNMENT notification
        from app.analytics.notifier import create_system_notification
        create_system_notification(
            db,
            recipient=current_user.email,
            title="New Incident Created",
            message=f"Incident {incident_id} requires investigation.",
            notif_type="CASE_ASSIGNMENT",
            severity=severity,
            employee_id=employee_id
        )
        
        # Recalculate employee's risk score (incorporating historical events updates)
        calculate_employee_risk(employee_id, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record incident: {e}")

    # Return clean dict representation without ObjectId string conversion crash
    incident_doc["_id"] = str(incident_doc["_id"])
    return incident_doc

@router.get("")
def query_incidents(
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
    analyst_filter: Optional[str] = None,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_read)
):
    """
    Retrieves all security incidents, filterable by status, severity, or assigned analyst.
    """
    if db is None:
        return []

    query = {}
    if status_filter:
        query["status"] = status_filter.upper()
    if severity_filter:
        query["severity"] = severity_filter.upper()
    if analyst_filter:
        query["analyst_assigned"] = analyst_filter

    cursor = db.incidents.find(query).sort("created_at", -1)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

@router.get("/{incident_id}")
def get_incident_by_id(
    incident_id: str,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_read)
):
    """
    Retrieves a single incident case file by its INC-XXXX identifier.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database offline.")

    doc = db.incidents.find_one({"incident_id": incident_id})
    if not doc:
        # Check by MongoDB ObjectId just in case
        try:
            doc = db.incidents.find_one({"_id": ObjectId(incident_id)})
        except Exception:
            pass

    if not doc:
        raise HTTPException(status_code=404, detail=f"Incident case {incident_id} not found.")

    doc["_id"] = str(doc["_id"])
    return doc

@router.put("/{incident_id}/status")
def update_incident_status(
    incident_id: str,
    body: dict,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_write)
):
    """
    Updates the workflow status of an incident case (OPEN, INVESTIGATING, RESOLVED, ESCALATED).
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database offline.")

    new_status = body.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="status parameter is required.")

    doc = db.incidents.find_one({"incident_id": incident_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Incident case not found.")

    now_str = datetime.datetime.utcnow().isoformat()
    note = {
        "timestamp": now_str,
        "analyst": current_user.email,
        "text": f"Status changed from {doc.get('status')} to {new_status.upper()}."
    }

    try:
        db.incidents.update_one(
            {"incident_id": incident_id},
            {
                "$set": {"status": new_status.upper(), "updated_at": now_str},
                "$push": {"notes": note}
            }
        )
        
        # If resolving the case, automatically resolve all active alerts associated with this employee
        if new_status.upper() == "RESOLVED":
            db.alerts.update_many(
                {"employee_id": doc.get("employee_id"), "status": {"$ne": "RESOLVED"}},
                {"$set": {"status": "RESOLVED", "resolved_at": now_str}}
            )
            
        # Recalculate risk score to reflect resolved/active updates
        calculate_employee_risk(doc.get("employee_id"), db)
        
        # Generate EVENT_UPDATE notification based on target status
        from app.analytics.notifier import create_system_notification
        
        status_upper = new_status.upper()
        if status_upper == "ESCALATED":
            title = "Incident Escalation"
            msg = f"Incident {incident_id} has been escalated. Please review."
            
            # Send real email to Security Manager(s)
            from app.database import SessionLocal
            from app.models import User
            from app.email_sender import send_real_email
            sql_db = SessionLocal()
            try:
                managers = sql_db.query(User).filter(User.role == "Security Manager").all()
                for manager in managers:
                    to_email = manager.email
                    subject = f"Incident Escalated - {incident_id}"
                    body = f"Incident {incident_id} has been escalated and requires your review."
                    send_real_email(to_email, subject, body)
            except Exception as email_err:
                print(f"Failed to send escalation email: {email_err}")
            finally:
                sql_db.close()
        elif status_upper == "RESOLVED":
            title = "Incident Resolved"
            msg = f"Incident {incident_id} has been resolved."
        elif status_upper == "INVESTIGATING":
            title = "Incident Status Changed"
            msg = f"Incident {incident_id} is now under investigation."
        else:
            title = f"Incident {incident_id} Status"
            msg = f"Incident {incident_id} status has been updated to {status_upper}."
            
        create_system_notification(
            db,
            recipient="Security Manager",
            title=title,
            message=msg,
            notif_type="EVENT_UPDATE",
            severity=doc.get("severity", "MEDIUM"),
            employee_id=doc.get("employee_id")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update status: {e}")

    return {"status": "success", "message": f"Incident {incident_id} status updated to {new_status}."}

@router.put("/{incident_id}/assign")
def assign_incident_analyst(
    incident_id: str,
    body: dict,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_write)
):
    """
    Assigns a security analyst to a specific incident case file.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database offline.")

    analyst_email = body.get("analyst_email")
    if not analyst_email:
        raise HTTPException(status_code=400, detail="analyst_email is required.")

    doc = db.incidents.find_one({"incident_id": incident_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Incident case not found.")

    now_str = datetime.datetime.utcnow().isoformat()
    note = {
        "timestamp": now_str,
        "analyst": current_user.email,
        "text": f"Case file assigned to {analyst_email}."
    }

    try:
        db.incidents.update_one(
            {"incident_id": incident_id},
            {
                "$set": {"analyst_assigned": analyst_email, "updated_at": now_str},
                "$push": {"notes": note}
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assign case: {e}")

    # Generate CASE_ASSIGNMENT notification
    from app.analytics.notifier import create_system_notification
    create_system_notification(
        db,
        recipient=analyst_email,
        title="New Investigation Assigned",
        message=f"Incident {incident_id} has been assigned to you.",
        notif_type="CASE_ASSIGNMENT",
        severity=doc.get("severity", "MEDIUM"),
        employee_id=doc.get("employee_id")
    )

    # Send real email notification
    from app.database import SessionLocal
    from app.models import User
    from app.email_sender import send_real_email
    sql_db = SessionLocal()
    try:
        user = sql_db.query(User).filter(User.email == analyst_email).first()
        if user:
            to_email = user.email
            subject = f"New Incident Assigned - {incident_id}"
            body = (
                f"Incident {incident_id} has been assigned to you.\n"
                f"Please log in to the Insider Threat Behavioral Intelligence System\n"
                f"to investigate the incident."
            )
            send_real_email(to_email, subject, body)
    except Exception as email_err:
        print(f"Failed to send assignment email: {email_err}")
    finally:
        sql_db.close()

    return {"status": "success", "message": f"Incident {incident_id} successfully assigned to {analyst_email}."}

@router.post("/{incident_id}/notes")
def add_incident_note(
    incident_id: str,
    body: dict,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_write)
):
    """
    Appends an analyst comment/investigation update to the case file timeline notes.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database offline.")

    text = body.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="note text parameter is required.")

    now_str = datetime.datetime.utcnow().isoformat()
    note = {
        "timestamp": now_str,
        "analyst": current_user.email,
        "text": text
    }

    try:
        result = db.incidents.update_one(
            {"incident_id": incident_id},
            {
                "$push": {"notes": note},
                "$set": {"updated_at": now_str}
            }
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Incident case not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to append comment: {e}")

    return {"status": "success", "message": "Case note updated.", "note": note}
