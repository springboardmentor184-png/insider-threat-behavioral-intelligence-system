import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, select, extract, case
from app.models.risk import RiskAssessment, RiskLevel
from app.models.employee import Employee
from app.models.department import Department


class RiskRepository:
    """
    Data Access Repository for Risk Assessments.
    Encapsulates all database operations, historical querying, and metric aggregations.
    """

    @staticmethod
    def create_assessment(db: Session, assessment_dict: Dict[str, Any]) -> RiskAssessment:
        """Create and persist a new historical Risk Assessment entry."""
        assessment = RiskAssessment(**assessment_dict)
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    def get_latest_by_employee(db: Session, employee_id: uuid.UUID) -> Optional[RiskAssessment]:
        """Fetch the most recent risk assessment record for an employee."""
        return (
            db.query(RiskAssessment)
            .filter(RiskAssessment.employee_id == employee_id)
            .order_by(desc(RiskAssessment.created_at))
            .first()
        )

    @staticmethod
    def get_history_by_employee(
        db: Session, employee_id: uuid.UUID, limit: int = 30
    ) -> List[RiskAssessment]:
        """Fetch historical risk assessments for trend visualization."""
        return (
            db.query(RiskAssessment)
            .filter(RiskAssessment.employee_id == employee_id)
            .order_by(desc(RiskAssessment.created_at))
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_top_risk_employees(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Fetch employees with the highest current risk score.
        Queries the latest assessment for each active employee.
        """
        subquery = (
            db.query(
                RiskAssessment.employee_id,
                func.max(RiskAssessment.created_at).label("max_created")
            )
            .group_by(RiskAssessment.employee_id)
            .subquery()
        )

        query = (
            db.query(RiskAssessment, Employee, Department)
            .join(Employee, RiskAssessment.employee_id == Employee.id)
            .outerjoin(Department, Employee.department_id == Department.id)
            .join(
                subquery,
                (RiskAssessment.employee_id == subquery.c.employee_id) &
                (RiskAssessment.created_at == subquery.c.max_created)
            )
            .filter(Employee.is_active == True)
            .order_by(desc(RiskAssessment.risk_score))
            .limit(limit)
        )

        results = []
        for assessment, emp, dept in query.all():
            results.append({
                "employee_id": str(emp.id),
                "employee_code": emp.employee_id,
                "employee_name": f"{emp.first_name} {emp.last_name}",
                "email": emp.email,
                "department_name": dept.department_name if dept else "Unassigned",
                "job_title": emp.job_title or "Staff",
                "risk_score": assessment.risk_score,
                "risk_level": assessment.risk_level,
                "anomaly_score": assessment.anomaly_score,
                "privilege_score": assessment.privilege_score,
                "data_access_score": assessment.data_access_score,
                "access_pattern_score": assessment.access_pattern_score,
                "history_score": assessment.history_score,
                "confidence_score": assessment.confidence_score,
                "reasons": assessment.reasons or [],
                "recommendation": assessment.recommendation,
                "risk_trend": assessment.risk_trend,
                "last_assessed": assessment.created_at.isoformat() if assessment.created_at else None,
            })
        return results

    @staticmethod
    def get_department_risk_summary(db: Session) -> List[Dict[str, Any]]:
        """Calculate average risk scores grouped by department."""
        subquery = (
            db.query(
                RiskAssessment.employee_id,
                func.max(RiskAssessment.created_at).label("max_created")
            )
            .group_by(RiskAssessment.employee_id)
            .subquery()
        )

        query = (
            db.query(
                Department.department_name,
                func.avg(RiskAssessment.risk_score).label("avg_risk"),
                func.count(Employee.id).label("employee_count"),
                func.sum(
                    case(
                        (RiskAssessment.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL]), 1),
                        else_=0
                    )
                ).label("high_risk_count")
            )
            .select_from(Department)
            .join(Employee, Employee.department_id == Department.id)
            .join(
                RiskAssessment,
                (RiskAssessment.employee_id == Employee.id)
            )
            .join(
                subquery,
                (RiskAssessment.employee_id == subquery.c.employee_id) &
                (RiskAssessment.created_at == subquery.c.max_created)
            )
            .group_by(Department.id, Department.department_name)
            .all()
        )

        results = []
        for dept_name, avg_risk, emp_count, high_count in query:
            results.append({
                "department_name": dept_name,
                "avg_risk": round(float(avg_risk or 0.0), 1),
                "employee_count": emp_count,
                "high_risk_count": high_count or 0,
            })
        return results

    @staticmethod
    def get_dashboard_stats(db: Session) -> Dict[str, Any]:
        """Aggregate high-level metrics for the executive SOC dashboard."""
        subquery = (
            db.query(
                RiskAssessment.employee_id,
                func.max(RiskAssessment.created_at).label("max_created")
            )
            .group_by(RiskAssessment.employee_id)
            .subquery()
        )

        latest_assessments = (
            db.query(RiskAssessment)
            .join(
                subquery,
                (RiskAssessment.employee_id == subquery.c.employee_id) &
                (RiskAssessment.created_at == subquery.c.max_created)
            )
            .all()
        )

        total_employees = db.query(Employee).filter(Employee.is_active == True).count()
        
        if not latest_assessments:
            return {
                "total_employees": total_employees,
                "average_risk": 0.0,
                "critical_employees": 0,
                "high_risk_employees": 0,
                "medium_risk_employees": 0,
                "low_risk_employees": 0,
                "today_new_risks": 0,
                "risk_distribution": {"Low": 0, "Medium": 0, "High": 0, "Critical": 0},
            }

        scores = [a.risk_score for a in latest_assessments]
        avg_risk = round(sum(scores) / len(scores), 1) if scores else 0.0

        critical_count = sum(1 for a in latest_assessments if a.risk_level == RiskLevel.CRITICAL)
        high_count = sum(1 for a in latest_assessments if a.risk_level == RiskLevel.HIGH)
        medium_count = sum(1 for a in latest_assessments if a.risk_level == RiskLevel.MEDIUM)
        low_count = sum(1 for a in latest_assessments if a.risk_level == RiskLevel.LOW)

        # Count new high/critical risks detected today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        today_new_risks = (
            db.query(RiskAssessment)
            .filter(
                RiskAssessment.created_at >= today_start,
                RiskAssessment.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL])
            )
            .count()
        )

        return {
            "total_employees": total_employees,
            "average_risk": avg_risk,
            "critical_employees": critical_count,
            "high_risk_employees": high_count,
            "medium_risk_employees": medium_count,
            "low_risk_employees": low_count,
            "today_new_risks": today_new_risks,
            "risk_distribution": {
                "Low": low_count,
                "Medium": medium_count,
                "High": high_count,
                "Critical": critical_count,
            },
        }
