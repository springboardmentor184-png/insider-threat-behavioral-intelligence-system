from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.db import get_db
from services import log_service
from utils.security import get_current_user, require_role
import os

router = APIRouter(prefix="/logs", tags=["Activity Monitoring"])

SAMPLE_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sample", "activity_logs.csv")


class LogCreate(BaseModel):
    employee_code: str
    activity_type: str
    resource: str | None = None
    ip_address: str | None = None
    device: str | None = None
    data_volume_mb: float = 0.0


class LogOut(BaseModel):
    id: int
    employee_id: int
    activity_type: str
    resource: str | None
    ip_address: str | None
    device: str | None
    data_volume_mb: float
    is_flagged: int

    class Config:
        from_attributes = True


@router.post("/", response_model=LogOut, status_code=status.HTTP_201_CREATED)
def log_activity(
    payload: LogCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("soc_engineer", "administrator")),
):
    try:
        return log_service.create_log_entry(db, payload.model_dump())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ingest-sample")
def ingest_sample_csv(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator")),
):
    """Bulk-loads the bundled sample CSV — used to seed demo data for testing/milestone review."""
    if not os.path.exists(SAMPLE_CSV_PATH):
        raise HTTPException(status_code=404, detail="Sample CSV not found on server")
    result = log_service.ingest_csv(db, SAMPLE_CSV_PATH)
    return result


@router.get("/", response_model=list[LogOut])
def list_logs(
    employee_id: int | None = None,
    activity_type: str | None = None,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    return log_service.get_logs(db, employee_id=employee_id, activity_type=activity_type)