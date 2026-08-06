"""
UEBA Intelligence Engine (Module 8)
User & Entity Behavior Analytics:
  - Peer group baseline comparison (Department & Role metrics)
  - Behavioral trend analysis
  - Threat risk prediction & trajectory tracking
"""

from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from backend.models.dataset import Employee, EmployeeBaseline, BehavioralAnomaly, EmployeeRiskHistory


class UEBAEngineService:
    @classmethod
    async def get_department_peer_baselines(cls, db: AsyncSession) -> Dict[str, Dict[str, float]]:
        """
        Aggregate behavioral baselines grouped by department.
        """
        stmt = (
            select(
                Employee.department,
                func.avg(EmployeeBaseline.avg_daily_logons).label("avg_logons"),
                func.avg(EmployeeBaseline.avg_daily_usb_connects).label("avg_usb"),
                func.avg(EmployeeBaseline.avg_daily_file_accesses).label("avg_files"),
                func.avg(EmployeeBaseline.avg_daily_emails_sent).label("avg_emails"),
                func.avg(EmployeeBaseline.avg_email_size).label("avg_email_size"),
                func.avg(EmployeeBaseline.avg_daily_web_browses).label("avg_web"),
                func.avg(EmployeeBaseline.after_hours_logon_ratio).label("avg_after_hours"),
            )
            .join(EmployeeBaseline, Employee.employee_id == EmployeeBaseline.employee_id)
            .group_by(Employee.department)
        )
        res = await db.execute(stmt)
        dept_stats = {}
        for row in res.all():
            dept_name = row[0] or "General"
            dept_stats[dept_name] = {
                "avg_daily_logons": round(float(row[1] or 0), 2),
                "avg_daily_usb_connects": round(float(row[2] or 0), 2),
                "avg_daily_file_accesses": round(float(row[3] or 0), 2),
                "avg_daily_emails_sent": round(float(row[4] or 0), 2),
                "avg_email_size_kb": round(float((row[5] or 0) / 1024), 2),
                "avg_daily_web_browses": round(float(row[6] or 0), 2),
                "after_hours_ratio_pct": round(float((row[7] or 0) * 100), 1),
            }
        return dept_stats

    @classmethod
    async def get_peer_group_comparison(cls, db: AsyncSession, employee_id: str) -> Dict[str, Any]:
        """
        Compare an individual employee's baseline metrics against their department peer average.
        """
        emp_stmt = select(Employee).where(Employee.employee_id == employee_id)
        emp = (await db.execute(emp_stmt)).scalar_one_or_none()
        if not emp:
            raise ValueError(f"Employee {employee_id} not found")

        base_stmt = select(EmployeeBaseline).where(EmployeeBaseline.employee_id == employee_id)
        emp_baseline = (await db.execute(base_stmt)).scalar_one_or_none()

        all_dept_stats = await cls.get_department_peer_baselines(db)
        dept_peer = all_dept_stats.get(emp.department or "General", {
            "avg_daily_logons": 10.0,
            "avg_daily_usb_connects": 1.0,
            "avg_daily_file_accesses": 15.0,
            "avg_daily_emails_sent": 8.0,
            "avg_email_size_kb": 250.0,
            "avg_daily_web_browses": 40.0,
            "after_hours_ratio_pct": 5.0
        })

        emp_stats = {
            "avg_daily_logons": round(emp_baseline.avg_daily_logons, 2) if emp_baseline else 0.0,
            "avg_daily_usb_connects": round(emp_baseline.avg_daily_usb_connects, 2) if emp_baseline else 0.0,
            "avg_daily_file_accesses": round(emp_baseline.avg_daily_file_accesses, 2) if emp_baseline else 0.0,
            "avg_daily_emails_sent": round(emp_baseline.avg_daily_emails_sent, 2) if emp_baseline else 0.0,
            "avg_email_size_kb": round(emp_baseline.avg_email_size / 1024, 2) if emp_baseline else 0.0,
            "avg_daily_web_browses": round(emp_baseline.avg_daily_web_browses, 2) if emp_baseline else 0.0,
            "after_hours_ratio_pct": round(emp_baseline.after_hours_logon_ratio * 100, 1) if emp_baseline else 0.0,
        }

        # Calculate deviation percentages
        deviations = {}
        for k, emp_val in emp_stats.items():
            peer_val = dept_peer.get(k, 1.0)
            if peer_val > 0:
                diff_pct = round(((emp_val - peer_val) / peer_val) * 100, 1)
            else:
                diff_pct = 0.0
            deviations[k] = diff_pct

        return {
            "employee_id": employee_id,
            "name": emp.full_name,
            "department": emp.department,
            "employee_metrics": emp_stats,
            "peer_metrics": dept_peer,
            "deviations_pct": deviations
        }

    @classmethod
    async def predict_threat_trends(cls, db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Analyze employee risk progression and predict insider threat trajectory (Increasing, Stable, Decreasing).
        """
        # Fetch employees with high or critical risk scores
        stmt = (
            select(Employee)
            .where(Employee.risk_score >= 30)
            .order_by(desc(Employee.risk_score))
            .limit(10)
        )
        high_risk_emps = (await db.execute(stmt)).scalars().all()

        predictions = []
        for emp in high_risk_emps:
            # Query risk history
            history_stmt = (
                select(EmployeeRiskHistory)
                .where(EmployeeRiskHistory.employee_id == emp.employee_id)
                .order_by(desc(EmployeeRiskHistory.timestamp))
                .limit(5)
            )
            history = (await db.execute(history_stmt)).scalars().all()

            # Determine trajectory based on recent risk score snapshots
            if len(history) >= 2:
                recent_diff = history[0].risk_score - history[1].risk_score
                if recent_diff > 5:
                    trajectory = "Increasing"
                    pred_threat = "High likelihood of credential misuse or data leak in 7 days"
                elif recent_diff < -5:
                    trajectory = "Decreasing"
                    pred_threat = "Risk stabilizing following mitigation"
                else:
                    trajectory = "Stable"
                    pred_threat = "Persistent elevated risk baseline"
            else:
                trajectory = "Increasing" if emp.risk_score >= 70 else "Stable"
                pred_threat = "Potential data exfiltration candidate"

            predictions.append({
                "employee_id": emp.employee_id,
                "name": emp.full_name,
                "department": emp.department,
                "risk_score": emp.risk_score,
                "risk_category": "Critical Risk" if emp.risk_score >= 85 else "High Risk" if emp.risk_score >= 60 else "Medium Risk",
                "trajectory": trajectory,
                "predicted_threat": pred_threat
            })

        return predictions
