from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.roles import require_roles

from app.models.user import User

from app.schemas.activity import (
    ActivityCreate,
    ActivityResponse
)

from app.services.activity_service import (
    create_activity,
    get_all_activities
)

router = APIRouter(
    prefix="/activity",
    tags=["Activity"]
)


@router.get(
    "",
    response_model=list[ActivityResponse]
)
def get_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([
            "Administrator",
            "Security Manager",
            "SOC Engineer"
        ])
    )
):

    return get_all_activities(db)


@router.post(
    "",
    response_model=ActivityResponse
)
def add_activity(
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles([
            "Administrator",
            "Security Manager"
        ])
    )
):

    return create_activity(
        db,
        activity
    )