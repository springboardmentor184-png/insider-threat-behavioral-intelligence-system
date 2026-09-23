from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, EmployeeProfile
from schemas import ProfileUpdate, ProfileOut
from dependencies import get_current_user, require_role

router = APIRouter()


# Logged-in user views their OWN profile (creates an empty one if it doesn't exist yet)
@router.get("/profile/me", response_model=ProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == current_user.id).first()
    if not profile:
        profile = EmployeeProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# Logged-in user updates their OWN profile
@router.put("/profile/me", response_model=ProfileOut)
def update_my_profile(
    updates: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == current_user.id).first()
    if not profile:
        profile = EmployeeProfile(user_id=current_user.id)
        db.add(profile)

    # Only update fields the client actually sent
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


# Admin/Manager/Analyst view ANY employee's profile by user_id
@router.get("/profile/{user_id}", response_model=ProfileOut)
def get_employee_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "manager", "analyst")),
):
    profile = db.query(EmployeeProfile).filter(EmployeeProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
    