from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.jwt_handler import get_current_user
from app.services.behavioral_analytics import compute_risk_scores
from app.models.risk_score import RiskScore
from app.schemas.risk_score import RiskScoreResponse, ComputeResponse

router = APIRouter(prefix="/analytics", tags=["Behavioral Analytics"])


@router.post("/compute", response_model=ComputeResponse)
def compute_scores(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Runs the anomaly detection model over all activity events and stores fresh risk scores."""
    result = compute_risk_scores(db)
    return {
        "message": "Risk scores computed successfully",
        "users_processed": result["users_processed"],
        "category_counts": result["category_counts"],
    }


@router.get("/risk-scores", response_model=list[RiskScoreResponse])
def get_risk_scores(
    category: str | None = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve computed risk scores, optionally filtered by category (Low/Medium/High/Critical)."""
    query = db.query(RiskScore)

    if category:
        query = query.filter(RiskScore.risk_category == category)

    return query.order_by(RiskScore.risk_score.desc()).all()


@router.get("/risk-summary")
def get_risk_summary(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Quick counts per risk category — used for dashboard stat cards."""
    scores = db.query(RiskScore).all()

    summary = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    for s in scores:
        if s.risk_category in summary:
            summary[s.risk_category] += 1

    return {
        "total_users_analyzed": len(scores),
        "summary": summary,
    }