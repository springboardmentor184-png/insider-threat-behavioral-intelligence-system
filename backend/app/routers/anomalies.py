from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import datetime
from bson import ObjectId
import csv
import io
from fastapi.responses import StreamingResponse

from app.mongodb import get_mongo_db
from app.models import User
from app.auth import get_current_user, RoleChecker
from app.analytics.detector import scan_for_anomalies
from app.analytics.profiler import generate_employee_baseline

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies & Alerts"])

# In-memory database fallback to ensure frontend works even if MongoDB is offline
IN_MEMORY_ALERTS = []

# Define read access checker
require_read = RoleChecker(["Administrator", "Security Analyst", "SOC Engineer", "Security Manager"])
require_write = RoleChecker(["Administrator", "Security Manager"])

@router.post("/detect", status_code=status.HTTP_200_OK)
def trigger_anomaly_detection(current_user: User = Depends(require_read)):
    db = get_mongo_db()
    
    # 1. Fetch raw logs
    if db is not None:
        try:
            logs = list(db.activity_logs.find({}).sort("timestamp", -1).limit(200000))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to query logs: {e}")
    else:
        from app.routers.logs import IN_MEMORY_LOGS
        logs = IN_MEMORY_LOGS
        
    if not logs:
        return {"status": "success", "message": "No activity logs available to scan.", "anomalies_detected": 0}
        
    # 2. Scan logs using detector module
    new_alerts = scan_for_anomalies(logs, db)
    
    # 3. Store alerts
    if db is not None:
        try:
            # Clear old alerts to prevent duplicates during testing scans
            db.alerts.delete_many({})
            # Reset all raw logs to is_suspicious = False first
            db.activity_logs.update_many({}, {"$set": {"is_suspicious": False}})
            
            if new_alerts:
                # Add timestamp to alerts
                for alert in new_alerts:
                    if "timestamp" not in alert:
                        alert["timestamp"] = datetime.datetime.utcnow().isoformat()
                db.alerts.insert_many(new_alerts)
                
                # Extract all raw log ObjectIds to flag as suspicious
                suspicious_log_ids = []
                for alert in new_alerts:
                    for log_id in alert.get("source_log_ids", []):
                        try:
                            suspicious_log_ids.append(ObjectId(log_id))
                        except Exception:
                            pass
                if suspicious_log_ids:
                    db.activity_logs.update_many(
                        {"_id": {"$in": suspicious_log_ids}},
                        {"$set": {"is_suspicious": True}}
                    )
            return {
                "status": "success",
                "message": f"Successfully completed security scan on {len(logs)} activity records.",
                "anomalies_detected": len(new_alerts)
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to write alerts to database: {e}")
    else:
        # Fallback to local memory logs
        global IN_MEMORY_ALERTS
        IN_MEMORY_ALERTS = []
        from app.routers.logs import IN_MEMORY_LOGS
        # Reset in-memory logs
        for log in IN_MEMORY_LOGS:
            log["is_suspicious"] = False
            
        for idx, alert in enumerate(new_alerts):
            alert["_id"] = f"alert_{len(IN_MEMORY_ALERTS) + idx}"
            if "timestamp" not in alert:
                alert["timestamp"] = datetime.datetime.utcnow().isoformat()
            IN_MEMORY_ALERTS.append(alert)
            
            # Flag in-memory logs
            for log_id in alert.get("source_log_ids", []):
                for log in IN_MEMORY_LOGS:
                    if log.get("_id") == log_id:
                        log["is_suspicious"] = True
                        
        return {
            "status": "warning",
            "message": f"MongoDB offline. Scanned {len(logs)} logs. Generated {len(new_alerts)} alerts in memory.",
            "anomalies_detected": len(new_alerts)
        }

@router.get("/")
def get_alerts(
    employee_id: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    current_user: User = Depends(require_read)
):
    db = get_mongo_db()
    
    # Setup query criteria
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if severity:
        query["severity"] = severity
    if status:
        query["status"] = status
        
    if db is not None:
        try:
            cursor = db.alerts.find(query).sort("timestamp", -1).skip(skip).limit(limit)
            alerts = []
            for doc in cursor:
                doc["_id"] = str(doc["_id"])
                alerts.append(doc)
            return alerts
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database query failure: {e}")
    else:
        # Filter in-memory logs
        filtered = IN_MEMORY_ALERTS
        if employee_id:
            filtered = [x for x in filtered if x.get("employee_id") == employee_id]
        if severity:
            filtered = [x for x in filtered if x.get("severity") == severity]
        if status:
            filtered = [x for x in filtered if x.get("status") == status]
            
        # Sort by timestamp descending
        filtered = sorted(filtered, key=lambda x: x.get("timestamp", ""), reverse=True)
        return filtered[skip : skip + limit]

@router.put("/{alert_id}")
def update_alert_status(
    alert_id: str,
    body: dict,
    current_user: User = Depends(require_write),
    db = Depends(get_mongo_db)
):
    new_status = body.get("status")
    if new_status not in ["OPEN", "INVESTIGATING", "RESOLVED"]:
        raise HTTPException(status_code=400, detail="Invalid alert status code")
        
    if db is not None:
        try:
            result = db.alerts.update_one(
                {"_id": ObjectId(alert_id)},
                {"$set": {"status": new_status, "resolved_at": datetime.datetime.utcnow().isoformat()}}
            )
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Alert not found in database")
            return {"status": "success", "message": f"Alert {alert_id} status updated to {new_status}"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database update failure: {e}")
    else:
        # In memory update
        for alert in IN_MEMORY_ALERTS:
            if alert.get("_id") == alert_id:
                alert["status"] = new_status
                alert["resolved_at"] = datetime.datetime.utcnow().isoformat()
                return {"status": "success", "message": f"Alert {alert_id} updated to {new_status} in memory."}
        raise HTTPException(status_code=404, detail="Alert not found in memory")

@router.get("/baselines/{employee_id}")
def get_employee_baseline_route(
    employee_id: str,
    current_user: User = Depends(require_read),
    db = Depends(get_mongo_db)
):
    return generate_employee_baseline(employee_id, db)

@router.get("/report")
def get_anomalies_report(current_user: User = Depends(require_read)):
    db = get_mongo_db()
    
    report = {
        "critical_count": 0,
        "high_count": 0,
        "medium_count": 0,
        "low_count": 0,
        "resolved_count": 0,
        "total_anomalies": 0,
        "by_type": {}
    }
    
    if db is not None:
        try:
            report["total_anomalies"] = db.alerts.count_documents({})
            report["critical_count"] = db.alerts.count_documents({"severity": "CRITICAL"})
            report["high_count"] = db.alerts.count_documents({"severity": "HIGH"})
            report["medium_count"] = db.alerts.count_documents({"severity": "MEDIUM"})
            report["low_count"] = db.alerts.count_documents({"severity": "LOW"})
            report["resolved_count"] = db.alerts.count_documents({"status": "RESOLVED"})
            
            # Aggregate categories count
            pipeline = [{"$group": {"_id": "$alert_type", "count": {"$sum": 1}}}]
            res = list(db.alerts.aggregate(pipeline))
            for item in res:
                report["by_type"][item["_id"]] = item["count"]
                
            return report
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate report: {e}")
    else:
        # In memory aggregates
        report["total_anomalies"] = len(IN_MEMORY_ALERTS)
        report["critical_count"] = len([x for x in IN_MEMORY_ALERTS if x.get("severity") == "CRITICAL"])
        report["high_count"] = len([x for x in IN_MEMORY_ALERTS if x.get("severity") == "HIGH"])
        report["medium_count"] = len([x for x in IN_MEMORY_ALERTS if x.get("severity") == "MEDIUM"])
        report["low_count"] = len([x for x in IN_MEMORY_ALERTS if x.get("severity") == "LOW"])
        report["resolved_count"] = len([x for x in IN_MEMORY_ALERTS if x.get("status") == "RESOLVED"])
        
        for alert in IN_MEMORY_ALERTS:
            t = alert.get("alert_type")
            report["by_type"][t] = report["by_type"].get(t, 0) + 1
            
        return report

@router.get("/export/csv")
def export_anomalies_csv(current_user: User = Depends(require_read)):
    db = get_mongo_db()
    if db is not None:
        alerts = list(db.alerts.find({}).sort("timestamp", -1))
    else:
        alerts = IN_MEMORY_ALERTS
        
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Timestamp", "Employee ID", "Alert Type", "Severity", "Description", "Status"])
    
    for alert in alerts:
        writer.writerow([
            alert.get("timestamp"),
            alert.get("employee_id"),
            alert.get("alert_type"),
            alert.get("severity"),
            alert.get("description"),
            alert.get("status")
        ])
        
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=insider_threat_anomalies_report.csv"}
    )
