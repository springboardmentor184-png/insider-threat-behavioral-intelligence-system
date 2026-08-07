# backend/app/api/risk.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..core.database import get_db
from ..core.security import require_roles
from ..models import models
from ..core.mongodb import activity_collection
from ..core.risk_engine import RiskEngine

router = APIRouter(prefix="/risk", tags=["Risk Scoring"])

# Initialize the risk engine
risk_engine = RiskEngine()


@router.get("/score/{employee_id}")
async def get_risk_score(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    """
    Get risk score for a specific employee
    """
    # Check if employee exists
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    emp_name = f"{employee.first_name} {employee.last_name}" if employee else f"Employee {employee_id[:8]}"
    
    # Get all activities for this employee
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    
    if not activities:
        return {
            "employee_id": employee_id,
            "employee_name": emp_name,
            "risk_score": 0,
            "risk_level": "No Risk",
            "risk_level_icon": "⚪",
            "risk_level_color": "#6c757d",
            "anomaly_count": 0,
            "risk_factors": [],
            "recommendations": ["✅ No activities found - Normal behavior"],
            "message": "No activities found for this employee"
        }
    
    # --- Detect anomalies using threat indicator criteria ---
    anomalies = []
    for act in activities:
        anomaly_reasons = []
        event = str(act.get("event_type", "")).upper()
        source = str(act.get("source_system", "")).upper()
        severity = str(act.get("severity", "")).upper()
        ip = str(act.get("ip_address", ""))
        
        if any(k in event for k in ["UNUSUAL", "PRIVILEGE", "USB", "EXCESSIVE", "FAIL", "EXFILTRATION", "UNAUTHORIZED"]):
            anomaly_reasons.append(f"Threat indicator detected: {event}")
        if severity in ["WARNING", "CRITICAL"]:
            anomaly_reasons.append(f"Elevated severity level: {severity}")
        if "VPN" in source or ip.startswith("10.8"):
            anomaly_reasons.append(f"Remote access deviation: {ip}")
        
        if anomaly_reasons:
            anomalies.append({
                "timestamp": str(act.get("timestamp")),
                "event_type": event,
                "source_system": source,
                "ip_address": ip,
                "reasons": anomaly_reasons,
                "metadata": act.get("metadata", {})
            })
    
    # --- Calculate risk score using RiskEngine ---
    risk_result = risk_engine.calculate_risk_score(anomalies, activities)
    
    # Add employee info to response
    risk_result["employee_id"] = employee_id
    risk_result["employee_name"] = emp_name
    risk_result["total_activities"] = len(activities)
    
    return risk_result


@router.get("/summary")
async def get_risk_summary(
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer"])),
    db: Session = Depends(get_db)
):
    """
    Get risk summary for all employees
    """
    # Get all employees
    employees = db.query(models.Employee).all()
    
    if not employees:
        return {
            "total_employees": 0,
            "employees": [],
            "summary": {
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0,
                "no_risk": 0
            }
        }
    
    # Calculate risk for each employee
    employee_risks = []
    summary = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "no_risk": 0
    }
    
    for employee in employees:
        try:
            # Get activities for this employee
            activities = await activity_collection.find({"employee_id": employee.employee_id}).to_list(length=1000)
            
            if not activities:
                summary["no_risk"] += 1
                employee_risks.append({
                    "employee_id": employee.employee_id,
                    "employee_name": f"{employee.first_name} {employee.last_name}",
                    "department": employee.department,
                    "risk_score": 0,
                    "risk_level": "No Risk"
                })
                continue
            
            # Detect anomalies (using TOP 5 approach)
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
            
            top_events = sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:5]
            top_sources = sorted(source_systems.items(), key=lambda x: x[1], reverse=True)[:5]
            top_ips = sorted(ip_addresses.items(), key=lambda x: x[1], reverse=True)[:5]
            
            normal_events = [e[0] for e in top_events]
            normal_sources = [s[0] for s in top_sources]
            normal_ips = [i[0] for i in top_ips]
            
            anomalies = []
            for act in activities:
                anomaly_reasons = []
                event = act.get("event_type", "UNKNOWN")
                source = act.get("source_system", "UNKNOWN")
                ip = act.get("ip_address", "UNKNOWN")
                
                if event not in normal_events:
                    anomaly_reasons.append(f"Unusual event: {event}")
                if source not in normal_sources:
                    anomaly_reasons.append(f"Unusual source: {source}")
                if ip not in normal_ips:
                    anomaly_reasons.append(f"Unusual IP: {ip}")
                
                if anomaly_reasons:
                    anomalies.append({
                        "event_type": event,
                        "source_system": source,
                        "ip_address": ip,
                        "reasons": anomaly_reasons
                    })
            
            # Calculate risk score
            risk_result = risk_engine.calculate_risk_score(anomalies, activities)
            
            # Update summary
            risk_level = risk_result["risk_level"]
            if risk_level == "Critical Risk":
                summary["critical"] += 1
            elif risk_level == "High Risk":
                summary["high"] += 1
            elif risk_level == "Medium Risk":
                summary["medium"] += 1
            elif risk_level == "Low Risk":
                summary["low"] += 1
            else:
                summary["no_risk"] += 1
            
            employee_risks.append({
                "employee_id": employee.employee_id,
                "employee_name": f"{employee.first_name} {employee.last_name}",
                "department": employee.department,
                "risk_score": risk_result["risk_score"],
                "risk_level": risk_result["risk_level"],
                "risk_level_icon": risk_result["risk_level_icon"],
                "anomaly_count": risk_result["anomaly_count"]
            })
            
        except Exception as e:
            print(f"Error calculating risk for {employee.employee_id}: {e}")
            summary["no_risk"] += 1
            employee_risks.append({
                "employee_id": employee.employee_id,
                "employee_name": f"{employee.first_name} {employee.last_name}",
                "department": employee.department,
                "risk_score": 0,
                "risk_level": "Error"
            })
    
    # Sort by risk score (highest first)
    employee_risks.sort(key=lambda x: x["risk_score"], reverse=True)
    
    return {
        "total_employees": len(employees),
        "summary": summary,
        "employees": employee_risks
    }


@router.get("/trend/{employee_id}")
async def get_risk_trend(
    employee_id: str,
    days: int = 7,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    """
    Get risk score trend for a specific employee over the last N days
    """
    # Check if employee exists
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get activities for the specified period
    from datetime import datetime, timedelta
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    activities = await activity_collection.find({
        "employee_id": employee_id,
        "timestamp": {"$gte": cutoff_date}
    }).to_list(length=1000)
    
    if not activities:
        return {
            "employee_id": employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "days": days,
            "trend": [],
            "message": "No activities found for the specified period"
        }
    
    # Group activities by day
    daily_activities = {}
    for act in activities:
        timestamp = act.get("timestamp")
        if timestamp:
            day = timestamp.strftime("%Y-%m-%d")
            if day not in daily_activities:
                daily_activities[day] = []
            daily_activities[day].append(act)
    
    # Calculate risk score for each day
    trend_data = []
    for day, day_activities in sorted(daily_activities.items()):
        # Detect anomalies for this day
        event_types = {}
        source_systems = {}
        ip_addresses = {}
        
        for act in day_activities:
            event = act.get("event_type", "UNKNOWN")
            event_types[event] = event_types.get(event, 0) + 1
            source = act.get("source_system", "UNKNOWN")
            source_systems[source] = source_systems.get(source, 0) + 1
            ip = act.get("ip_address", "UNKNOWN")
            ip_addresses[ip] = ip_addresses.get(ip, 0) + 1
        
        top_events = sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:5]
        top_sources = sorted(source_systems.items(), key=lambda x: x[1], reverse=True)[:5]
        top_ips = sorted(ip_addresses.items(), key=lambda x: x[1], reverse=True)[:5]
        
        normal_events = [e[0] for e in top_events]
        normal_sources = [s[0] for s in top_sources]
        normal_ips = [i[0] for i in top_ips]
        
        anomalies = []
        for act in day_activities:
            anomaly_reasons = []
            event = act.get("event_type", "UNKNOWN")
            source = act.get("source_system", "UNKNOWN")
            ip = act.get("ip_address", "UNKNOWN")
            
            if event not in normal_events:
                anomaly_reasons.append(f"Unusual event: {event}")
            if source not in normal_sources:
                anomaly_reasons.append(f"Unusual source: {source}")
            if ip not in normal_ips:
                anomaly_reasons.append(f"Unusual IP: {ip}")
            
            if anomaly_reasons:
                anomalies.append({
                    "event_type": event,
                    "source_system": source,
                    "ip_address": ip,
                    "reasons": anomaly_reasons
                })
        
        risk_result = risk_engine.calculate_risk_score(anomalies, day_activities)
        
        trend_data.append({
            "date": day,
            "risk_score": risk_result["risk_score"],
            "risk_level": risk_result["risk_level"],
            "anomaly_count": risk_result["anomaly_count"],
            "activity_count": len(day_activities)
        })
    
    return {
        "employee_id": employee_id,
        "employee_name": f"{employee.first_name} {employee.last_name}",
        "days": days,
        "trend": trend_data
    }