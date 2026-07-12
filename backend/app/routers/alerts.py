from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Alert

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get("/")
def get_alerts(db: Session = Depends(get_db)):

    alerts = db.query(Alert).all()

    return alerts


@router.get("/{alert_id}")
def get_alert(alert_id: int, db: Session = Depends(get_db)):

    alert = db.query(Alert).filter(
        Alert.id == alert_id
    ).first()

    if alert is None:
        return {"message": "Alert Not Found"}
    return alert