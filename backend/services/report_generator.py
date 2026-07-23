"""
Report Generator Service: Aggregates detected anomalies into structured executive reports.
"""

import json
import collections
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from typing import Dict, Any

from backend.models.dataset import Employee, BehavioralAnomaly, AnomalyReport


class ReportGeneratorService:
    @classmethod
    async def generate_report(cls, db: AsyncSession, title: str = None) -> AnomalyReport:
        """
        Scan all detected anomalies in the database and generate a structured summary report.
        """
        # Fetch all anomalies
        anom_stmt = select(BehavioralAnomaly)
        anomalies = (await db.execute(anom_stmt)).scalars().all()
        
        total_count = len(anomalies)

        severity_counts = collections.defaultdict(int)
        category_counts = collections.defaultdict(int)
        employee_anomaly_counts = collections.defaultdict(list)

        for anom in anomalies:
            severity_counts[anom.severity] += 1
            category_counts[anom.category] += 1
            employee_anomaly_counts[anom.employee_id].append(anom)

        critical_count = severity_counts.get("Critical", 0)
        high_count = severity_counts.get("High", 0)
        medium_count = severity_counts.get("Medium", 0)
        low_count = severity_counts.get("Low", 0)

        # Identify top risk employees
        top_risk_users = []
        for emp_id, emp_anoms in employee_anomaly_counts.items():
            # Get employee details
            emp_stmt = select(Employee).where(Employee.employee_id == emp_id)
            emp = (await db.execute(emp_stmt)).scalar_one_or_none()
            name = emp.full_name if emp else "Unknown Employee"
            dept = emp.department if emp else "N/A"
            
            # Calculate a risk score contribution from anomalies
            # Critical = 25 pts, High = 15 pts, Medium = 5 pts, Low = 1 pt
            score = sum(
                25 if a.severity == "Critical" else
                15 if a.severity == "High" else
                5 if a.severity == "Medium" else 1
                for a in emp_anoms
            )
            top_risk_users.append({
                "employee_id": emp_id,
                "name": name,
                "department": dept,
                "anomaly_count": len(emp_anoms),
                "calculated_risk": score
            })

        # Sort top users by risk score descending
        top_risk_users.sort(key=lambda x: x["calculated_risk"], reverse=True)
        top_risk_users = top_risk_users[:5]

        # Generate a dynamic summary text
        report_title = title or f"Executive Threat Report - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')}"
        
        summary_bullets = [
            f"A total of {total_count} anomalies were aggregated and analyzed.",
            f"Threat severity distribution: {critical_count} Critical, {high_count} High, {medium_count} Medium, {low_count} Low.",
            f"Most common anomaly pattern: {max(category_counts.items(), key=lambda x: x[1])[0] if category_counts else 'None detected'}."
        ]
        if top_risk_users:
            summary_bullets.append(
                f"Primary risk suspect: {top_risk_users[0]['name']} (EMP-{top_risk_users[0]['employee_id']}) "
                f"in the {top_risk_users[0]['department']} department, with {top_risk_users[0]['anomaly_count']} anomalies."
            )
        
        summary = " ".join(summary_bullets)

        report_data = {
            "title": report_title,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_anomalies": total_count,
            "severity_breakdown": {
                "Critical": critical_count,
                "High": high_count,
                "Medium": medium_count,
                "Low": low_count
            },
            "category_breakdown": dict(category_counts),
            "top_risk_users": top_risk_users
        }

        report = AnomalyReport(
            title=report_title,
            summary=summary,
            total_anomalies_detected=total_count,
            critical_threat_count=critical_count,
            data=json.dumps(report_data),
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(report)
        await db.commit()
        return report
