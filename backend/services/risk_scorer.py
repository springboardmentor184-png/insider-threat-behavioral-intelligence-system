"""
Insider Risk Scoring Engine (Module 6)
Implements the exact 5-factor weighted scoring model:
  - Behavioral Anomalies: 35%
  - Privilege Misuse Indicators: 25%
  - Data Access Violations: 20%
  - Access Pattern Deviations: 10%
  - Historical Security Events: 10%

Risk Categories:
  - Low Risk: < 30
  - Medium Risk: 30 - 59
  - High Risk: 60 - 84
  - Critical Risk: 85 - 100
"""

from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.dataset import (
    Employee, BehavioralAnomaly, EmployeeBaseline, EmployeeRiskHistory, LogonEvent, DeviceEvent, FileEvent
)


class RiskScorerService:
    @classmethod
    def categorize_risk(cls, score: int) -> str:
        if score >= 85:
            return "Critical Risk"
        elif score >= 60:
            return "High Risk"
        elif score >= 30:
            return "Medium Risk"
        else:
            return "Low Risk"

    @classmethod
    async def compute_employee_risk(cls, db: AsyncSession, employee_id: str) -> dict:
        """
        Calculate weighted risk score for a single employee.
        """
        emp_stmt = select(Employee).where(Employee.employee_id == employee_id)
        emp = (await db.execute(emp_stmt)).scalar_one_or_none()
        if not emp:
            return {"employee_id": employee_id, "risk_score": 0, "risk_category": "Low Risk"}

        # Fetch employee anomalies
        anom_stmt = select(BehavioralAnomaly).where(BehavioralAnomaly.employee_id == employee_id)
        anomalies = (await db.execute(anom_stmt)).scalars().all()

        # Fetch baseline
        base_stmt = select(EmployeeBaseline).where(EmployeeBaseline.employee_id == employee_id)
        baseline = (await db.execute(base_stmt)).scalar_one_or_none()

        # 1. Behavioral Anomalies Score (35% weight)
        # Scale: Critical=30, High=20, Medium=10, Low=5. Max capped at 100
        anom_raw = sum(
            30 if a.severity == "Critical" else
            20 if a.severity == "High" else
            10 if a.severity == "Medium" else 5
            for a in anomalies
        )
        behavioral_score = min(100.0, float(anom_raw))

        # 2. Privilege Misuse Indicators Score (25% weight)
        # Based on unauthorized PC login attempts and off-hours USB connects
        privilege_anoms = [a for a in anomalies if "Unauthorized Access" in a.category or "Suspicious Device" in a.category]
        privilege_score = min(100.0, float(len(privilege_anoms) * 35.0))

        # 3. Data Access Violations Score (20% weight)
        # Based on abnormal data download / file touch anomalies or exfiltration indicators
        data_anoms = [a for a in anomalies if "Abnormal Data" in a.category or "Exfiltration" in a.category]
        data_access_score = min(100.0, float(len(data_anoms) * 30.0))

        # 4. Access Pattern Deviations Score (10% weight)
        # Based on unusual logon hours / weekend ratios from baseline
        access_pattern_score = 0.0
        if baseline:
            if baseline.after_hours_logon_ratio > 0.30:
                access_pattern_score += 40.0
            if baseline.weekend_logon_ratio > 0.20:
                access_pattern_score += 40.0
            if len(baseline.common_pcs.split(",")) > 3:
                access_pattern_score += 20.0
        access_pattern_score = min(100.0, access_pattern_score)

        # 5. Historical Security Events Score (10% weight)
        # Based on total logged security events count
        total_anomalies_count = len(anomalies)
        historical_events_score = min(100.0, float(total_anomalies_count * 15.0))

        # Calculate Composite Weighted Score
        weighted_score = (
            (behavioral_score * 0.35) +
            (privilege_score * 0.25) +
            (data_access_score * 0.20) +
            (access_pattern_score * 0.10) +
            (historical_events_score * 0.10)
        )
        final_risk_score = min(100, max(0, int(round(weighted_score))))
        risk_category = cls.categorize_risk(final_risk_score)

        # Update employee risk score
        emp.risk_score = final_risk_score

        # Save snapshot in EmployeeRiskHistory
        history = EmployeeRiskHistory(
            employee_id=employee_id,
            risk_score=final_risk_score,
            behavioral_score=behavioral_score,
            privilege_score=privilege_score,
            data_access_score=data_access_score,
            access_pattern_score=access_pattern_score,
            historical_events_score=historical_events_score,
            risk_category=risk_category,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(history)
        await db.flush()

        return {
            "employee_id": employee_id,
            "name": emp.full_name,
            "department": emp.department,
            "risk_score": final_risk_score,
            "risk_category": risk_category,
            "components": {
                "behavioral_anomalies": round(behavioral_score, 1),
                "privilege_misuse": round(privilege_score, 1),
                "data_access_violations": round(data_access_score, 1),
                "access_pattern_deviations": round(access_pattern_score, 1),
                "historical_security_events": round(historical_events_score, 1)
            }
        }

    @classmethod
    async def compute_all_risk_scores(cls, db: AsyncSession) -> int:
        """
        Recalculate weighted risk scores for all active employees.
        """
        employees = (await db.execute(select(Employee).where(Employee.is_active == True))).scalars().all()
        count = 0
        for emp in employees:
            await cls.compute_employee_risk(db, emp.employee_id)
            count += 1
        await db.commit()
        return count
