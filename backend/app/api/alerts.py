from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.dependencies import get_db
from app.core.roles import require_roles
from app.models.user import User
from app.models.alert import Alert
from app.schemas.alert import AlertResponse, AlertUpdate

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    employee_id: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    query = db.query(Alert)
    
    if employee_id:
        query = query.filter(Alert.employee_id == employee_id)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)
    if category:
        query = query.filter(Alert.category == category)
        
    return query.order_by(Alert.timestamp.desc()).all()

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert_by_id(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return alert

@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    alert_data: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
        
    if alert_data.status is not None:
        alert.status = alert_data.status
    if alert_data.assigned_to is not None:
        alert.assigned_to = alert_data.assigned_to
    if alert_data.resolution_notes is not None:
        alert.resolution_notes = alert_data.resolution_notes
        
    db.commit()
    db.refresh(alert)
    return alert

@router.post("/{alert_id}/assign", response_model=AlertResponse)
def assign_alert(
    alert_id: int,
    assignee: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator", "Security Manager", "SOC Engineer", "Security Analyst"])
    )
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
        
    alert.assigned_to = assignee
    alert.status = "Investigating"
    db.commit()
    db.refresh(alert)
    return alert
