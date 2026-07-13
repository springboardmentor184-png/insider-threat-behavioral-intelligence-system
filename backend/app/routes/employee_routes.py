from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("/", response_model=schemas.EmployeeProfileOut)
def create_employee(
    profile: schemas.EmployeeProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("security_manager", "administrator")),
):
    existing = db.query(models.EmployeeProfile).filter(
        models.EmployeeProfile.employee_id == profile.employee_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    new_profile = models.EmployeeProfile(**profile.model_dump())
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile


@router.get("/", response_model=list[schemas.EmployeeProfileOut])
def list_employees(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return db.query(models.EmployeeProfile).all()


@router.get("/{employee_id}", response_model=schemas.EmployeeProfileOut)
def get_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    profile = db.query(models.EmployeeProfile).filter(
        models.EmployeeProfile.employee_id == employee_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Employee not found")
    return profile


@router.put("/{employee_id}", response_model=schemas.EmployeeProfileOut)
def update_employee(
    employee_id: str,
    updates: schemas.EmployeeProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("security_manager", "administrator")),
):
    profile = db.query(models.EmployeeProfile).filter(
        models.EmployeeProfile.employee_id == employee_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Employee not found")

    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.delete("/{employee_id}")
def delete_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_role("administrator")),
):
    profile = db.query(models.EmployeeProfile).filter(
        models.EmployeeProfile.employee_id == employee_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(profile)
    db.commit()
    return {"detail": "Employee deleted"}