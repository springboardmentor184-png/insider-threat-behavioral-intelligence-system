from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

from app.services.analytics_service import (
    get_executive_dashboard
)


router = APIRouter(
    prefix="/analytics",
    tags=["Security Analytics"]
)


# =====================================================
# EXECUTIVE SECURITY DASHBOARD
# =====================================================

@router.get("/executive-dashboard")
def executive_dashboard(
    db: Session = Depends(get_db)
):

    return get_executive_dashboard(db)