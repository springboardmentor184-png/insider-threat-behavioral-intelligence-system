from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database.models.investigation import Investigation
from services import investigation_service
from utils.security import get_current_user, require_role

router = APIRouter(prefix="/investigations", tags=["Threat Investigation"])


@router.post("/generate")
def generate(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager", "soc_engineer")),
):
    return investigation_service.generate_investigations(db)


@router.get("/")
def list_investigations(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    cases = db.query(Investigation).order_by(Investigation.created_at.desc()).all()
    return [
        {
            "id": c.id,
            "employee_id": c.employee_id,
            "severity": c.severity,
            "status": c.status,
            "summary": c.summary,
            "created_at": c.created_at,
        }
        for c in cases
    ]


@router.get("/{investigation_id}")
def get_one(
    investigation_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = investigation_service.get_investigation_timeline(db, investigation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return result


@router.post("/peer-comparison")
def peer_comparison(
    db: Session = Depends(get_db),
    user: dict = Depends(require_role("administrator", "security_manager")),
):
    return investigation_service.compute_peer_comparison(db)