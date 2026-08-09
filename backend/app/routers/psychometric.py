from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_role
from ..models import User, PsychometricProfile
from .. import schemas


router = APIRouter(
    prefix="/psychometric",
    tags=["Psychometric"]
)


ANALYST_ROLES = (
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst"
)


@router.get(
    "/{employee_id}",
    response_model=schemas.PsychometricOut
)
def get_psychometric_profile(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(*ANALYST_ROLES)
    ),
):
    profile = (
        db.query(PsychometricProfile)
        .filter(
            PsychometricProfile.employee_id == employee_id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="No psychometric profile found for this employee"
        )

    return profile