from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import get_db
from services import employee_service
from utils.security import get_current_user, require_role
import os
from services import baseline_service

router = APIRouter(prefix="/employees", tags=["Employee Management"])

# --- Schemas ---
class EmployeeCreate(BaseModel):
    employee_code: str
    full_name: str
    department: str
    designation: str
    manager_name: str | None = None
    device_id: str | None = None
    access_level: str = "standard"

class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    department: str | None = None
    designation: str | None = None
    manager_name: str | None = None
    device_id: str | None = None
    access_level: str | None = None

class EmployeeOut(BaseModel):
    id: int
    employee_code: str
    full_name: str
    department: str
    designation: str
    manager_name: str | None
    device_id: str | None
    access_level: str
    risk_score: int
    openness: float | None = None
    conscientiousness: float | None = None
    extraversion: float | None = None
    agreeableness: float | None = None
    neuroticism: float | None = None

    class Config:
        from_attributes = True

# --- Routes ---
@router.post("/", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager")),
):
    try:
        employee = employee_service.create_employee(db, payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return employee

@router.get("/", response_model=list[EmployeeOut])
def list_employees(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),   # any logged-in role can view
):
    return employee_service.get_all_employees(db)

@router.get("/{employee_id}", response_model=EmployeeOut)
def get_one(
    employee_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    employee = employee_service.get_employee_by_id(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.put("/{employee_id}", response_model=EmployeeOut)
def update(
    employee_id: int,
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager")),
):
    employee = employee_service.update_employee(db, employee_id, payload.model_dump())
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

PSYCHOMETRIC_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sample", "psychometric.csv")

@router.post("/ingest-psychometric")
def ingest_psychometric(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator")),
):
    if not os.path.exists(PSYCHOMETRIC_CSV_PATH):
        raise HTTPException(status_code=404, detail="psychometric.csv not found on server")
    return employee_service.ingest_psychometric_csv(db, PSYCHOMETRIC_CSV_PATH)

@router.post("/compute-baselines")
def compute_baselines(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager")),
):
    return baseline_service.compute_all_baselines(db)

@router.post("/detect-anomalies")
def detect_anomalies_route(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager")),
):
    return baseline_service.detect_anomalies(db)
@router.post("/compute-risk-scores")
def compute_risk_scores_route(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager")),
):
    return baseline_service.compute_risk_scores(db)