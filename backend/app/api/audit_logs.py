from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.roles import require_roles

from app.models.user import User

from app.schemas.audit_log import AuditLogResponse

from app.services.audit_service import (
    get_all_logs,
    get_logs_by_user
)

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"]
)


@router.get(
    "",
    response_model=list[AuditLogResponse]
)
def view_all_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator"])
    )
):

    return get_all_logs(db)


@router.get(
    "/{user_id}",
    response_model=list[AuditLogResponse]
)
def view_user_logs(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(["Administrator"])
    )
):

    return get_logs_by_user(
        db,
        user_id
    )