from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_role
from ..models import UserProfile, User

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


# =========================================================
# GET ALL EMPLOYEES
# All authorized roles
# =========================================================

@router.get("/")
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(
            "Administrator",
            "Security Manager",
            "SOC Engineer",
            "Security Analyst"
        )
    ),
):
    profiles = (
        db.query(UserProfile)
        .order_by(UserProfile.employee_id)
        .all()
    )

    return [
        {
            "employee_id": profile.employee_id,
            "department": profile.department,
            "designation": profile.designation,
            "risk_score": profile.risk_score
        }
        for profile in profiles
    ]