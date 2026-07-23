from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_roles
from app.models.employee import Employee
from app.models.risk import RiskAssessment
from app.schemas.threat import (
    ThreatAssessmentResponse,
    ThreatHistoryResponse,
    HighRiskEmployeeResponse,
)
from app.services.threat_service import analyze_employee_threat

router = APIRouter()


@router.post(
    "/analyze/{employee_id}",
    response_model=ThreatAssessmentResponse,
    summary="Analyze employee threat and update risk assessment",
)
def analyze_employee_threat_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    assessment = analyze_employee_threat(db, employee_id)
    return ThreatAssessmentResponse(
        employee_id=assessment.employee_id,
        threat_score=assessment.risk_score,
        threat_level=assessment.risk_level,
        confidence_score=assessment.confidence_score,
        explanation=assessment.risk_reason,
        recommendation=assessment.recommendation,
        last_analyzed=assessment.last_analyzed,
    )


@router.get(
    "/high-risk",
    response_model=list[HighRiskEmployeeResponse],
    summary="Get all high and critical risk employees",
)
def get_high_risk_employees_route(db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    assessments = (
        db.query(RiskAssessment)
        .filter(RiskAssessment.risk_level.in_(["High", "Critical"]))
        .order_by(RiskAssessment.last_analyzed.desc())
        .all()
    )

    return [
        HighRiskEmployeeResponse(
            employee_id=assessment.employee_id,
            employee_name=str(assessment.employee.first_name + " " + assessment.employee.last_name) if assessment.employee else "Unknown",
            threat_score=assessment.risk_score,
            threat_level=assessment.risk_level,
            last_analyzed=assessment.last_analyzed,
        )
        for assessment in assessments
    ]


@router.get(
    "/{employee_id}",
    response_model=ThreatAssessmentResponse,
    summary="Get latest threat assessment for an employee",
)
def get_employee_threat_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    assessment = (
        db.query(RiskAssessment)
        .filter(RiskAssessment.employee_id == employee_id)
        .order_by(RiskAssessment.last_analyzed.desc())
        .first()
    )

    if not assessment:
        assessment = analyze_employee_threat(db, employee_id)

    return ThreatAssessmentResponse(
        employee_id=assessment.employee_id,
        threat_score=assessment.risk_score,
        threat_level=assessment.risk_level,
        confidence_score=assessment.confidence_score,
        explanation=assessment.risk_reason,
        recommendation=assessment.recommendation,
        last_analyzed=assessment.last_analyzed,
    )


@router.get(
    "/history/{employee_id}",
    response_model=list[ThreatHistoryResponse],
    summary="Get threat assessment history for an employee",
)
def get_employee_threat_history_route(employee_id: UUID, db: Session = Depends(get_db), current_user: Employee = Depends(require_roles(["Administrator", "Security Analyst"]))):
    assessments = (
        db.query(RiskAssessment)
        .filter(RiskAssessment.employee_id == employee_id)
        .order_by(RiskAssessment.last_analyzed.desc())
        .all()
    )

    return [
        ThreatHistoryResponse(
            employee_id=assessment.employee_id,
            threat_score=assessment.risk_score,
            threat_level=assessment.risk_level,
            confidence_score=assessment.confidence_score,
            explanation=assessment.risk_reason,
            recommendation=assessment.recommendation,
            last_analyzed=assessment.last_analyzed,
        )
        for assessment in assessments
    ]
