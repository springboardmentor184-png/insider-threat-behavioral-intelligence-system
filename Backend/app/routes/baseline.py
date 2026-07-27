from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import BaselineResponse
from app.services.baseline_service import (
    generate_baselines,
    get_baseline
)

router = APIRouter(
    prefix="/baseline",
    tags=["Baseline"]
)


@router.post("/generate")
def generate_baseline(db: Session = Depends(get_db)):
    return generate_baselines(db)


@router.get("/{employee_id}", response_model=BaselineResponse)
def get_employee_baseline(
    employee_id: int,
    db: Session = Depends(get_db)
):

    baseline = get_baseline(employee_id, db)

    if not baseline:
        raise HTTPException(
            status_code=404,
            detail="Baseline not found"
        )

    return baseline