from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import require_roles
from ..models import models

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users")
def get_all_users(
    current_user: models.User = Depends(require_roles(["Admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()
    return users