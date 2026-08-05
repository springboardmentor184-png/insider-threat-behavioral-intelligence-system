import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.ueba_service import UEBAService
from app.schemas.ueba import (
    BehaviorBaselineSchema,
    PeerComparisonSchema,
    BehaviorDeviationSchema,
    BehaviorDriftSchema,
    PredictionHistorySchema,
    EntityRiskSchema,
    UEBADashboardStatsSchema,
)

router = APIRouter()


@router.get("/baseline/{employee_id}", response_model=BehaviorBaselineSchema)
def get_behavior_baseline(employee_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get baseline behavior profile for a specific employee.
    """
    try:
        return UEBAService.generate_baseline(employee_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch baseline: {str(e)}")


@router.get("/peer/{employee_id}", response_model=PeerComparisonSchema)
def get_peer_comparison(employee_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get peer group analytics, deviation percentages, and outlier detection for an employee.
    """
    try:
        return UEBAService.calculate_peer_comparison(employee_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch peer comparison: {str(e)}")


@router.get("/deviation/{employee_id}", response_model=List[BehaviorDeviationSchema])
def get_behavior_deviations(employee_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get recent behavioral deviations and severity assignments for an employee.
    """
    try:
        return UEBAService.detect_deviations(employee_id, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch deviations: {str(e)}")


@router.get("/drift/{employee_id}", response_model=BehaviorDriftSchema)
def get_behavior_drift(employee_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get 4-week behavior drift progression, trend direction, and magnitude for an employee.
    """
    try:
        return UEBAService.detect_behavior_drift(employee_id, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch behavior drift: {str(e)}")


@router.get("/prediction/{employee_id}", response_model=PredictionHistorySchema)
def get_risk_prediction(employee_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get short-term risk forecasting (Tomorrow, Next Week, Next Month) using Linear Regression.
    """
    try:
        return UEBAService.predict_risk(employee_id, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch prediction: {str(e)}")


@router.get("/entities", response_model=List[EntityRiskSchema])
def get_monitored_entities(db: Session = Depends(get_db)):
    """
    Get all monitored non-user entities (Devices, Servers, Applications, VPN, USB, IP Subnets, Cloud Services).
    """
    try:
        return UEBAService.seed_entity_analytics(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch entities: {str(e)}")


@router.get("/entities/{entity_type}/{entity_name:path}", response_model=Dict[str, Any])
def get_entity_detail(entity_type: str, entity_name: str, db: Session = Depends(get_db)):
    """
    Get entity telemetry detail, correlated users, timeline feed, and SOC recommendations.
    """
    try:
        from app.repositories.ueba_repository import UEBARepository
        detail = UEBARepository.get_entity_detail(db, entity_type, entity_name)
        if not detail:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found")
        return detail
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch entity detail: {str(e)}")


@router.get("/dashboard", response_model=UEBADashboardStatsSchema)
def get_ueba_dashboard(db: Session = Depends(get_db)):
    """
    Get overall UEBA & Entity SOC Dashboard metrics, peer comparison matrices, and entity risks.
    """
    try:
        return UEBAService.get_ueba_dashboard_stats(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch UEBA dashboard: {str(e)}")


@router.post("/recalculate/{employee_id}", response_model=Dict[str, Any])
def recalculate_employee_ueba(employee_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Trigger full on-demand recalculation of UEBA baselines, peer group ratios, deviations, drift, and predictions.
    """
    try:
        return UEBAService.recalculate_employee_ueba(employee_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to recalculate UEBA: {str(e)}")
