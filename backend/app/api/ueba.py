# backend/app/api/ueba.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from ..core.database import get_db
from ..core.security import require_roles
from ..models import models
from ..core.mongodb import activity_collection
from ..core.ueba_engine import UEBADetector

router = APIRouter(prefix="/ueba", tags=["UEBA"])
ueba = UEBADetector()

@router.get("/peer-analysis/{employee_id}")
async def peer_analysis(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Administrator", "Security Manager", "SOC Engineer", "Security Analyst", "Analyst"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    emp_name = f"{employee.first_name} {employee.last_name}" if employee else f"Employee {employee_id[:8]}"
    department = employee.department if employee else "Cybersecurity"
    
    peers = db.query(models.Employee).filter(
        models.Employee.department == department,
        models.Employee.employee_id != employee_id
    ).all() if employee else []
    
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    
    peer_data = []
    for p in peers:
        p_acts = await activity_collection.find({"employee_id": p.employee_id}).to_list(length=100)
        p_anomalies = ueba._count_anomalies(p_acts)
        peer_data.append({
            "employee_id": p.employee_id,
            "employee_name": f"{p.first_name} {p.last_name}",
            "activity_count": len(p_acts) or 20,
            "anomaly_count": p_anomalies or 1,
            "risk_score": min(100.0, (p_anomalies * 18.0) + (len(p_acts) * 0.75))
        })
    
    result = ueba.analyze_peer_group(employee_id, activities, peer_data)
    result["employee_name"] = emp_name
    result["department"] = department
    return result

@router.get("/patterns/{employee_id}")
async def detect_patterns(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Administrator", "Security Manager", "SOC Engineer", "Security Analyst", "Analyst"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    emp_name = f"{employee.first_name} {employee.last_name}" if employee else f"Employee {employee_id[:8]}"
    
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    patterns = ueba.detect_patterns(activities)
    
    return {
        "employee_id": employee_id,
        "employee_name": emp_name,
        "patterns": patterns,
        "total_patterns": len(patterns)
    }

@router.get("/baseline/{employee_id}")
async def get_baseline(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Administrator", "Security Manager", "SOC Engineer", "Security Analyst", "Analyst"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    emp_name = f"{employee.first_name} {employee.last_name}" if employee else f"Employee {employee_id[:8]}"
    
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    baseline_data = ueba.generate_behavioral_baseline(activities)
    
    return {
        "employee_id": employee_id,
        "employee_name": emp_name,
        "baseline": baseline_data
    }

@router.get("/drift/{employee_id}")
async def get_behavior_drift(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Administrator", "Security Manager", "SOC Engineer", "Security Analyst", "Analyst"])),
    db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    emp_name = f"{employee.first_name} {employee.last_name}" if employee else f"Employee {employee_id[:8]}"
    
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    drift_res = ueba.calculate_behavior_drift(activities)
    drift_res["employee_id"] = employee_id
    drift_res["employee_name"] = emp_name
    return drift_res