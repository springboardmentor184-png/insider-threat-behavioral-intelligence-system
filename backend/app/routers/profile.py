from fastapi import APIRouter, Depends,HTTPException
from sqlalchemy.orm import Session
from app import models
from ..database import get_db
from .. import schemas

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get("/{profile_id}",response_model=schemas.ProfileOut)
def get_profile(profile_id: int, db: Session = Depends(get_db)):

    profile = db.query(models.UserProfile).filter(
        models.UserProfile.id == profile_id
    ).first()

    
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    
    return profile


@router.put("/{profile_id}",response_model=schemas.ProfileOut)
def update_profile(
    profile_id: int,
    updates: schemas.ProfileUpdate,
    db: Session = Depends(get_db)
):
    profile = db.query(models.UserProfile).filter(
        UserProfile.id == profile_id
    ).first()

    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile