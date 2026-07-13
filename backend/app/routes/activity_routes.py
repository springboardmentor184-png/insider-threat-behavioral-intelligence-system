from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/activity-logs", tags=["activity-logs"])


@router.post("/", response_model=schemas.ActivityLogOut)
def ingest_log(
    log: schemas.ActivityLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    employee = db.query(models.EmployeeProfile).filter(
        models.EmployeeProfile.employee_id == log.employee_id
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    new_log = models.ActivityLog(**log.model_dump())
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@router.get("/", response_model=list[schemas.ActivityLogOut])
def list_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).limit(100).all()


@router.get("/{employee_id}", response_model=list[schemas.ActivityLogOut])
def get_logs_for_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.ActivityLog).filter(
        models.ActivityLog.employee_id == employee_id
    ).order_by(models.ActivityLog.timestamp.desc()).all()