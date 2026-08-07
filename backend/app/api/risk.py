from fastapi import APIRouter
from app.services.risk_service import calculate_risk_score

router = APIRouter(prefix="/risk", tags=["Risk Scoring"])


@router.post("/calculate")
def calculate(payload: dict):
    return calculate_risk_score(
        payload.get("behavioral_anomalies", 0),
        payload.get("privilege_misuse", 0),
        payload.get("data_access_violations", 0),
        payload.get("access_pattern_deviations", 0),
        payload.get("historical_security_events", 0),
    )