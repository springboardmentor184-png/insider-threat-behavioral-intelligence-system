import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.risk_service import RiskScoringService
from app.schemas.risk import (
    RiskAssessmentResponse,
    RiskDashboardStats,
    TopRiskEmployeeItem,
    DepartmentRiskItem,
    RecalculateResponse,
)

router = APIRouter()


@router.get("/current/{employee_id}", response_model=Dict[str, Any])
def get_current_risk(employee_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Get current AI risk assessment, sub-scores, reasons, and recommendations for a specific employee.
    """
    try:
        return RiskScoringService.get_risk_current(employee_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch risk assessment: {str(e)}")


@router.get("/history/{employee_id}", response_model=List[Dict[str, Any]])
def get_risk_history(employee_id: uuid.UUID, limit: int = 30, db: Session = Depends(get_db)):
    """
    Get historical risk scores and trends over time for an employee.
    """
    try:
        return RiskScoringService.get_risk_history(employee_id, db, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch risk history: {str(e)}")


@router.get("/top", response_model=List[TopRiskEmployeeItem])
def get_top_risk_employees(limit: int = 10, db: Session = Depends(get_db)):
    """
    Get highest risk employees across the organization for SOC prioritization.
    """
    try:
        return RiskScoringService.get_top_risk_employees(db, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch top risk employees: {str(e)}")


@router.get("/dashboard", response_model=RiskDashboardStats)
def get_risk_dashboard(db: Session = Depends(get_db)):
    """
    Get executive SOC risk dashboard metrics, risk distribution, department scores, and high-risk highlights.
    """
    try:
        return RiskScoringService.get_risk_dashboard_stats(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch risk dashboard stats: {str(e)}")


@router.get("/department", response_model=List[DepartmentRiskItem])
def get_department_risk(db: Session = Depends(get_db)):
    """
    Get department-wise average risk scores and high-risk employee counts.
    """
    try:
        return RiskScoringService.get_department_risk(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch department risk metrics: {str(e)}")


@router.post("/recalculate/{employee_id}", response_model=RecalculateResponse)
def recalculate_risk(employee_id: uuid.UUID, db: Session = Depends(get_db)):
    """
    Trigger manual on-demand risk score recalculation for an employee.
    Creates a new historical RiskAssessment entry in the database.
    """
    try:
        assessment = RiskScoringService.calculate_employee_risk(employee_id, db)
        return {
            "message": "Risk score recalculated and persisted successfully.",
            "employee_id": assessment.employee_id,
            "new_risk_score": assessment.risk_score,
            "new_risk_level": assessment.risk_level,
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to recalculate risk: {str(e)}")
