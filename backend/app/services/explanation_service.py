from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.employee import Employee
from app.models.risk import RiskAssessment


def get_employee_explanation(db: Session, employee_id: UUID) -> str:
    record = (
        db.query(RiskAssessment, Employee)
        .join(Employee, RiskAssessment.employee_id == Employee.id)
        .filter(RiskAssessment.employee_id == employee_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk explanation not found for employee")

    risk, employee = record
    explanation_text = risk.risk_reason or ""
    return explanation_text
