from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/activity", tags=["Activity"])

@router.post("/")
def create_activity(activity: schemas.ActivityCreate, db: Session = Depends(get_db)):
    new_activity = models.ActivityLog(**activity.dict())
    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)
    return new_activity

@router.get("/")
def get_all_activities(db: Session = Depends(get_db)):
    return db.query(models.ActivityLog).all()

@router.get("/activity/{activity_id}")
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(models.ActivityLog).filter(
        models.ActivityLog.id == activity_id
    ).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    return activity

@router.delete("/activity/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = db.query(models.ActivityLog).filter(
        models.ActivityLog.id == activity_id
    ).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    db.delete(activity)
    db.commit()

    return {"message": "Activity deleted"}