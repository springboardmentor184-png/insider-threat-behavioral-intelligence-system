from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..core.mongodb import activity_collection
from ..core.security import require_roles
from ..models import models
from sqlalchemy.orm import Session
from ..core.database import get_db

router = APIRouter(prefix="/activities", tags=["Activities"])

# --- Pydantic Model for Activity ---
class ActivityCreate(BaseModel):
    employee_id: str
    event_type: str
    source_system: str
    severity: str = "INFO"
    ip_address: Optional[str] = None
    metadata: Optional[dict] = None

# ============================================
# POST /activities - Log an activity
# ============================================
@router.post("/")
async def log_activity(
    activity: ActivityCreate,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == activity.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    activity_doc = {
        "employee_id": activity.employee_id,
        "event_type": activity.event_type,
        "source_system": activity.source_system,
        "severity": activity.severity,
        "ip_address": activity.ip_address,
        "metadata": activity.metadata or {},
        "timestamp": datetime.utcnow(),
        "created_by": current_user.username
    }
    
    result = await activity_collection.insert_one(activity_doc)
    
    return {
        "message": "Activity logged successfully",
        "activity_id": str(result.inserted_id)
    }

# ============================================
# GET /activities - Retrieve all activities
# ============================================
@router.get("/")
async def get_all_activities(
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    limit: int = 100,
    skip: int = 0
):
    cursor = activity_collection.find().skip(skip).limit(limit)
    activities = await cursor.to_list(length=limit)
    
    for activity in activities:
        activity["_id"] = str(activity["_id"])
    
    return {
        "total": len(activities),
        "activities": activities
    }

# ============================================
# GET /activities/baseline/{employee_id} - Get behavioral baseline
# ============================================
@router.get("/baseline/{employee_id}")
async def get_behavioral_baseline(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    
    if not activities:
        return {
            "employee_id": employee_id,
            "message": "No activities found for this employee",
            "baseline": None
        }
    
    event_types = {}
    source_systems = {}
    ip_addresses = {}
    hour_distribution = {}
    
    for act in activities:
        event = act.get("event_type", "UNKNOWN")
        event_types[event] = event_types.get(event, 0) + 1
        
        source = act.get("source_system", "UNKNOWN")
        source_systems[source] = source_systems.get(source, 0) + 1
        
        ip = act.get("ip_address", "UNKNOWN")
        ip_addresses[ip] = ip_addresses.get(ip, 0) + 1
        
        timestamp = act.get("timestamp")
        if timestamp:
            hour = timestamp.hour
            hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
    
    baseline = {
        "employee_id": employee_id,
        "employee_name": f"{employee.first_name} {employee.last_name}",
        "total_activities": len(activities),
        "event_types": event_types,
        "source_systems": source_systems,
        "ip_addresses": ip_addresses,
        "hour_distribution": hour_distribution,
        "most_common_event": max(event_types, key=event_types.get) if event_types else None,
        "most_common_source": max(source_systems, key=source_systems.get) if source_systems else None,
        "most_common_ip": max(ip_addresses, key=ip_addresses.get) if ip_addresses else None,
        "most_active_hour": max(hour_distribution, key=hour_distribution.get) if hour_distribution else None
    }
    
    return {
        "employee_id": employee_id,
        "baseline": baseline
    }

# ============================================
# POST /activities/detect-anomaly - Check if an activity is anomalous
# ============================================
@router.post("/detect-anomaly")
async def detect_anomaly(
    activity: ActivityCreate,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == activity.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    activities = await activity_collection.find({"employee_id": activity.employee_id}).to_list(length=1000)
    
    if not activities:
        return {
            "employee_id": activity.employee_id,
            "message": "Not enough data for anomaly detection",
            "is_anomaly": False,
            "reason": "No baseline data available"
        }
    
    event_types = {}
    source_systems = {}
    ip_addresses = {}
    hour_distribution = {}
    
    for act in activities:
        event = act.get("event_type", "UNKNOWN")
        event_types[event] = event_types.get(event, 0) + 1
        
        source = act.get("source_system", "UNKNOWN")
        source_systems[source] = source_systems.get(source, 0) + 1
        
        ip = act.get("ip_address", "UNKNOWN")
        ip_addresses[ip] = ip_addresses.get(ip, 0) + 1
        
        timestamp = act.get("timestamp")
        if timestamp:
            hour = timestamp.hour
            hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
    
    most_common_event = max(event_types, key=event_types.get) if event_types else None
    most_common_source = max(source_systems, key=source_systems.get) if source_systems else None
    most_common_ip = max(ip_addresses, key=ip_addresses.get) if ip_addresses else None
    most_active_hour = max(hour_distribution, key=hour_distribution.get) if hour_distribution else None
    
    anomalies = []
    is_anomaly = False
    
    # FIXED: Check if activity fields are NOT in the baseline
    if activity.event_type not in event_types:
        anomalies.append(f"Unusual event type: '{activity.event_type}' (baseline: {list(event_types.keys())})")
        is_anomaly = True
    
    if activity.source_system not in source_systems:
        anomalies.append(f"Unusual source system: '{activity.source_system}' (baseline: {list(source_systems.keys())})")
        is_anomaly = True
    
    if activity.ip_address and activity.ip_address not in ip_addresses:
        anomalies.append(f"Unusual IP address: '{activity.ip_address}' (baseline: {list(ip_addresses.keys())})")
        is_anomaly = True
    
    severity = "INFO"
    if len(anomalies) >= 3:
        severity = "CRITICAL"
    elif len(anomalies) >= 1:
        severity = "WARNING"
    
    return {
        "employee_id": activity.employee_id,
        "employee_name": f"{employee.first_name} {employee.last_name}",
        "activity": activity.dict(),
        "is_anomaly": is_anomaly,
        "anomalies": anomalies,
        "anomaly_count": len(anomalies),
        "severity": severity,
        "baseline_summary": {
            "most_common_event": most_common_event,
            "most_common_source": most_common_source,
            "most_common_ip": most_common_ip,
            "most_active_hour": most_active_hour
        }
    }

# ============================================
# GET /activities/report/{employee_id} - Generate anomaly report
# ============================================
@router.get("/report/{employee_id}")
async def generate_anomaly_report(
    employee_id: str,
    days: int = 7,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    
    if not activities:
        return {
            "employee_id": employee_id,
            "message": "No activities found for this employee",
            "report": None
        }
    
    event_types = {}
    source_systems = {}
    ip_addresses = {}
    hour_distribution = {}
    
    for act in activities:
        event = act.get("event_type", "UNKNOWN")
        event_types[event] = event_types.get(event, 0) + 1
        
        source = act.get("source_system", "UNKNOWN")
        source_systems[source] = source_systems.get(source, 0) + 1
        
        ip = act.get("ip_address", "UNKNOWN")
        ip_addresses[ip] = ip_addresses.get(ip, 0) + 1
        
        timestamp = act.get("timestamp")
        if timestamp:
            hour = timestamp.hour
            hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
    
    top_events = sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:2]
    top_sources = sorted(source_systems.items(), key=lambda x: x[1], reverse=True)[:2]
    top_ips = sorted(ip_addresses.items(), key=lambda x: x[1], reverse=True)[:2]
    
    anomalies = []
    for act in activities:
        anomaly_reasons = []
        
        event = act.get("event_type", "UNKNOWN")
        if event not in event_types:
            anomaly_reasons.append(f"Unusual event: {event}")
        
        source = act.get("source_system", "UNKNOWN")
        if source not in source_systems:
            anomaly_reasons.append(f"Unusual source: {source}")
        
        ip = act.get("ip_address", "UNKNOWN")
        if ip not in ip_addresses:
            anomaly_reasons.append(f"Unusual IP: {ip}")
        
        if anomaly_reasons:
            anomalies.append({
                "timestamp": act.get("timestamp"),
                "event_type": event,
                "source_system": source,
                "ip_address": ip,
                "reasons": anomaly_reasons,
                "metadata": act.get("metadata", {})
            })
    
    report = {
        "employee_id": employee_id,
        "employee_name": f"{employee.first_name} {employee.last_name}",
        "total_activities": len(activities),
        "total_anomalies": len(anomalies),
        "anomaly_percentage": round((len(anomalies) / len(activities)) * 100, 2) if activities else 0,
        "baseline_summary": {
            "top_events": top_events,
            "top_sources": top_sources,
            "top_ips": top_ips,
            "most_active_hour": max(hour_distribution, key=hour_distribution.get) if hour_distribution else None
        },
        "recent_anomalies": anomalies[:10],
        "recommendations": []
    }
    
    if len(anomalies) > 50:
        report["recommendations"].append("🔴 High anomaly count - Investigate immediately!")
    elif len(anomalies) > 20:
        report["recommendations"].append("🟡 Medium anomaly count - Monitor closely")
    else:
        report["recommendations"].append("🟢 Low anomaly count - Normal behavior")
    
    if len(set([a["event_type"] for a in anomalies])) > 5:
        report["recommendations"].append("⚠️ Multiple unusual event types detected - Review access patterns")
    
    return {
        "employee_id": employee_id,
        "report": report
    }

# ============================================
# GET /activities/risk-score/{employee_id} - Calculate risk score
# ============================================
@router.get("/risk-score/{employee_id}")
async def calculate_risk_score(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    
    if not activities:
        return {
            "employee_id": employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "risk_score": 0,
            "risk_level": "No Risk",
            "message": "No activities found for this employee"
        }
    
    event_types = {}
    source_systems = {}
    ip_addresses = {}
    
    for act in activities:
        event = act.get("event_type", "UNKNOWN")
        event_types[event] = event_types.get(event, 0) + 1
        
        source = act.get("source_system", "UNKNOWN")
        source_systems[source] = source_systems.get(source, 0) + 1
        
        ip = act.get("ip_address", "UNKNOWN")
        ip_addresses[ip] = ip_addresses.get(ip, 0) + 1
    
    anomalies = []
    for act in activities:
        anomaly_reasons = []
        
        event = act.get("event_type", "UNKNOWN")
        if event not in event_types:
            anomaly_reasons.append(f"Unusual event: {event}")
        
        source = act.get("source_system", "UNKNOWN")
        if source not in source_systems:
            anomaly_reasons.append(f"Unusual source: {source}")
        
        ip = act.get("ip_address", "UNKNOWN")
        if ip not in ip_addresses:
            anomaly_reasons.append(f"Unusual IP: {ip}")
        
        if anomaly_reasons:
            anomalies.append({
                "timestamp": act.get("timestamp"),
                "event_type": event,
                "source_system": source,
                "ip_address": ip,
                "reasons": anomaly_reasons,
                "metadata": act.get("metadata", {})
            })
    
    total_activities = len(activities)
    total_anomalies = len(anomalies)
    
    if total_activities == 0:
        risk_score = 0
    else:
        anomaly_ratio = (total_anomalies / total_activities) * 100
        risk_score = min(100, anomaly_ratio * 2)
        
        critical_count = sum(1 for a in anomalies if a.get("metadata", {}).get("severity") == "CRITICAL")
        if critical_count > 0:
            risk_score = min(100, risk_score + (critical_count * 5))
    
    if risk_score == 0:
        risk_level = "🟢 No Risk"
    elif risk_score < 30:
        risk_level = "🟢 Low Risk"
    elif risk_score < 60:
        risk_level = "🟡 Medium Risk"
    elif risk_score < 80:
        risk_level = "🟠 High Risk"
    else:
        risk_level = "🔴 Critical Risk"
    
    risk_factors = []
    if risk_score > 50:
        if total_anomalies > 10:
            risk_factors.append("⚠️ High number of anomalies detected")
        if any("Unusual event" in a["reasons"][0] for a in anomalies):
            risk_factors.append("⚠️ Unusual event types detected")
        if any("Unusual IP" in a["reasons"][0] for a in anomalies):
            risk_factors.append("⚠️ Access from unusual IP addresses")
    
    return {
        "employee_id": employee_id,
        "employee_name": f"{employee.first_name} {employee.last_name}",
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "total_activities": total_activities,
        "total_anomalies": total_anomalies,
        "anomaly_percentage": round((total_anomalies / total_activities) * 100, 2) if total_activities else 0,
        "risk_factors": risk_factors,
        "recommendations": [
            "🔍 Review recent anomalies" if total_anomalies > 0 else "✅ No anomalies to review",
            "📊 Monitor activity patterns" if risk_score > 30 else "✅ Activity patterns normal",
            "🚨 Escalate to SOC" if risk_score > 70 else "ℹ️ No escalation needed"
        ],
        "last_updated": datetime.utcnow()
    }