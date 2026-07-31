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

# Initialize UEBA engine
ueba = UEBADetector()


@router.get("/peer-analysis/{employee_id}")
async def peer_analysis(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    """
    Compare employee against peers in same department
    """
    # Check if employee exists
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get all employees in same department
    peers = db.query(models.Employee).filter(
        models.Employee.department == employee.department,
        models.Employee.employee_id != employee_id
    ).all()
    
    if not peers:
        return {
            "employee_id": employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "department": employee.department,
            "peer_count": 0,
            "message": "No peers found in this department"
        }
    
    # Get activities for this employee
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    
    # Get peer data
    peer_data = []
    for peer in peers:
        peer_activities = await activity_collection.find({"employee_id": peer.employee_id}).to_list(length=100)
        peer_data.append({
            "employee_id": peer.employee_id,
            "activity_count": len(peer_activities),
            "anomaly_count": 0,  # Simplified
            "risk_score": 0
        })
    
    # Analyze
    result = ueba.analyze_peer_group(employee_id, activities, peer_data)
    result["employee_name"] = f"{employee.first_name} {employee.last_name}"
    result["department"] = employee.department
    
    return result


@router.get("/patterns/{employee_id}")
async def detect_patterns(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    """
    Detect behavioral patterns for an employee
    """
    # Check if employee exists
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get activities
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    
    if not activities:
        return {
            "employee_id": employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "patterns": [],
            "message": "No activities found"
        }
    
    # Detect patterns
    patterns = ueba.detect_patterns(activities)
    
    return {
        "employee_id": employee_id,
        "employee_name": f"{employee.first_name} {employee.last_name}",
        "patterns": patterns,
        "total_patterns": len(patterns)
    }


@router.get("/baseline/{employee_id}")
async def get_baseline(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer", "Analyst"])),
    db: Session = Depends(get_db)
):
    """
    Get behavioral baseline for an employee
    """
    # Check if employee exists
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get activities
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    
    if not activities:
        return {
            "employee_id": employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "message": "No activities found",
            "baseline": None
        }
    
    # Generate baseline
    baseline = ueba.generate_behavioral_baseline(activities)
    
    return {
        "employee_id": employee_id,
        "employee_name": f"{employee.first_name} {employee.last_name}",
        "baseline": baseline
    }