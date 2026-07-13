from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.roles import require_roles

from app.models.user import User

from app.services.dashboard_service import get_dashboard_stats

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("")
def dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([
            "Administrator",
            "Security Manager"
        ])
    )
):

    return get_dashboard_stats(db)