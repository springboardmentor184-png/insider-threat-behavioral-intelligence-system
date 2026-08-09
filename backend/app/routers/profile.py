from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user, require_role
from ..models import User

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


# =========================================================
# CREATE PROFILE
# Administrator + Security Manager
# =========================================================

@router.post("/", response_model=schemas.ProfileOut)
def create_profile(
    profile: schemas.ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator", "Security Manager")
    )
):
    existing = (
        db.query(models.UserProfile)
        .filter(
            models.UserProfile.employee_id == profile.employee_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists"
        )

    new_profile = models.UserProfile(
        **profile.model_dump()
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


# =========================================================
# GET PROFILE
# All authenticated users
# =========================================================

@router.get(
    "/{profile_id}",
    response_model=schemas.ProfileOut
)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = (
        db.query(models.UserProfile)
        .filter(
            models.UserProfile.id == profile_id
        )
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile


# =========================================================
# UPDATE PROFILE
# Administrator + Security Manager
# =========================================================

@router.put(
    "/{profile_id}",
    response_model=schemas.ProfileOut
)
def update_profile(
    profile_id: int,
    updates: schemas.ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator", "Security Manager")
    )
):
    profile = (
        db.query(models.UserProfile)
        .filter(
            models.UserProfile.id == profile_id
        )
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    update_data = updates.model_dump(
        exclude_unset=True
    )

    # Prevent duplicate employee IDs
    if "employee_id" in update_data:
        existing = (
            db.query(models.UserProfile)
            .filter(
                models.UserProfile.employee_id
                == update_data["employee_id"],
                models.UserProfile.id != profile_id
            )
            .first()
        )

        if existing:
            raise HTTPException(
                status_code=400,
                detail="Employee ID already exists"
            )

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


# =========================================================
# DELETE PROFILE
# Administrator only
# =========================================================

@router.delete("/{profile_id}")
def delete_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("Administrator")
    )
):
    profile = (
        db.query(models.UserProfile)
        .filter(
            models.UserProfile.id == profile_id
        )
        .first()
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    db.delete(profile)
    db.commit()

    return {
        "message": "Profile deleted successfully"
    }