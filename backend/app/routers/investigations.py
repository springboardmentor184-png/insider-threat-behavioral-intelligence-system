from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import datetime
from sqlalchemy.orm import Session
from app.database import get_db
from app.mongodb import get_mongo_db
from app.models import User, EmployeeProfile
from app.auth import get_current_user, RoleChecker
from app.analytics.risk_scorer import calculate_employee_risk, calculate_all_risk_scores

router = APIRouter(prefix="/api/investigations", tags=["Threat Investigations"])

require_read = RoleChecker(["Administrator", "Security Analyst", "SOC Engineer", "Security Manager"])
require_write = RoleChecker(["Administrator", "Security Manager"])

@router.get("/risk-scores")
def get_employees_risk_list(
    limit: int = 100,
    sql_db: Session = Depends(get_db),
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_read)
):
    """
    Returns a list of all employees onboarded in PostgreSQL, sorted by their
    latest ML-calculated risk score in MongoDB.
    """
    employees = sql_db.query(EmployeeProfile).limit(limit).all()
    results = []

    for emp in employees:
        # Fetch latest risk score from MongoDB
        score_doc = None
        if db is not None:
            score_doc = db.risk_scores.find_one(
                {"employee_id": emp.employee_id},
                sort=[("date", -1)]
            )
            
        if score_doc:
            results.append({
                "employee_id": emp.employee_id,
                "full_name": emp.full_name,
                "department": emp.department,
                "designation": emp.designation,
                "score": score_doc.get("score", 0),
                "category": score_doc.get("category", "LOW"),
                "breakdown": score_doc.get("breakdown", {}),
                "last_updated": score_doc.get("last_updated")
            })
        else:
            # Default zero risk if not computed yet
            results.append({
                "employee_id": emp.employee_id,
                "full_name": emp.full_name,
                "department": emp.department,
                "designation": emp.designation,
                "score": 0,
                "category": "LOW",
                "breakdown": {
                    "behavioral_anomalies": 0.0,
                    "privilege_misuse": 0.0,
                    "data_access_violations": 0.0,
                    "access_pattern_deviations": 0.0,
                    "historical_security_events": 0.0
                },
                "last_updated": None
            })

    # Sort results by risk score descending
    results = sorted(results, key=lambda x: x["score"], reverse=True)
    return results

@router.get("/risk-scores/trends/{employee_id}")
def get_employee_risk_trends(
    employee_id: str,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_read)
):
    """
    Retrieves historical risk scores for a user over the last 14 days
    to compile trend graphs on the frontend.
    """
    if db is None:
        return []
        
    cursor = db.risk_scores.find({"employee_id": employee_id}).sort("date", -1).limit(14)
    trends = []
    for doc in cursor:
        trends.append({
            "date": doc.get("date"),
            "score": doc.get("score", 0),
            "category": doc.get("category", "LOW")
        })
        
    # Return sorted by date ascending for line charts
    return sorted(trends, key=lambda x: x["date"])

@router.get("/timeline/{employee_id}")
def get_employee_forensic_timeline(
    employee_id: str,
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_read)
):
    """
    Compiles a chronological feed of all raw MongoDB activity logs (login, file, device, etc.)
    associated with an employee for forensic audits.
    """
    if db is None:
        return []
        
    cursor = db.activity_logs.find({"employee_id": employee_id}).sort("timestamp", -1).limit(500)
    timeline = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        timeline.append(doc)
        
    return timeline

@router.get("/ueba/peer-comparison/{employee_id}")
def get_ueba_peer_comparison(
    employee_id: str,
    sql_db: Session = Depends(get_db),
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_read)
):
    """
    Compares the average activity counts of an employee against the average
    baseline statistics of their peer department.
    """
    emp = sql_db.query(EmployeeProfile).filter(EmployeeProfile.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee profile not found")

    department = emp.department

    # Get other employee IDs in the same department
    peers = [x[0] for x in sql_db.query(EmployeeProfile.employee_id).filter(EmployeeProfile.department == department).all()]
    
    if db is None:
        return {
            "employee_id": employee_id,
            "department": department,
            "user_metrics": {"logons": 1, "usbs": 0, "files": 0, "emails": 0},
            "peer_metrics": {"logons": 1, "usbs": 0, "files": 0, "emails": 0}
        }

    # Fetch total records count to find user metrics
    total_days = max(1, len(db.activity_logs.distinct("timestamp", {"employee_id": employee_id})))
    
    user_counts = {
        "logons": db.activity_logs.count_documents({"employee_id": employee_id, "activity_type": "LOGIN"}),
        "usbs": db.activity_logs.count_documents({"employee_id": employee_id, "activity_type": "USB_DEVICE"}),
        "files": db.activity_logs.count_documents({"employee_id": employee_id, "activity_type": "FILE_ACCESS"}),
        "emails": db.activity_logs.count_documents({"employee_id": employee_id, "activity_type": "EMAIL"})
    }
    
    user_metrics = {k: round(v / total_days, 2) for k, v in user_counts.items()}

    # Calculate peer averages
    peer_metrics = {"logons": 0.0, "usbs": 0.0, "files": 0.0, "emails": 0.0}
    if peers:
        total_peer_days = max(1, len(db.activity_logs.distinct("timestamp", {"employee_id": {"$in": peers}})))
        peer_counts = {
            "logons": db.activity_logs.count_documents({"employee_id": {"$in": peers}, "activity_type": "LOGIN"}),
            "usbs": db.activity_logs.count_documents({"employee_id": {"$in": peers}, "activity_type": "USB_DEVICE"}),
            "files": db.activity_logs.count_documents({"employee_id": {"$in": peers}, "activity_type": "FILE_ACCESS"}),
            "emails": db.activity_logs.count_documents({"employee_id": {"$in": peers}, "activity_type": "EMAIL"})
        }
        
        # Divide total department activities by peer count & days
        divisor = max(1, len(peers) * (total_peer_days / max(1, len(peers))))
        peer_metrics = {k: round(v / divisor, 2) for k, v in peer_counts.items()}

    return {
        "employee_id": employee_id,
        "department": department,
        "user_metrics": user_metrics,
        "peer_metrics": peer_metrics
    }

@router.post("/risk-scores/recalculate")
def recalculate_risk_scores(
    sql_db: Session = Depends(get_db),
    db = Depends(get_mongo_db),
    current_user: User = Depends(require_write)
):
    """
    Triggers risk score evaluations across all employees, recalculating the risk posture matrix.
    """
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection offline.")
        
    count = calculate_all_risk_scores(db, sql_db)
    return {
        "status": "success",
        "message": f"Successfully calculated risk scoring matrices for {count} onboarded employees."
    }
