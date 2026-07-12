from fastapi import APIRouter

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.get("/")
def generate_report():

    report = {
        "total_users": 120,
        "active_users": 105,
        "high_risk_users": 8,
        "critical_alerts": 4,
        "generated_by": "Insider Threat Behavioral Intelligence System"
    }

    return report