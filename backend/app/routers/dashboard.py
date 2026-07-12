from fastapi import APIRouter

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/")
def get_dashboard():

    return {
        "total_users": 120,
        "active_users": 105,
        "high_risk_users": 8,
        "critical_alerts": 4,
        "medium_alerts": 15,
        "low_alerts": 28,
        "system_status": "Running"
    }