import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.employee import Employee
from app.models.activity import ActivityLog
from app.models.behavior_profile import BehaviorProfile
from app.models.role import Role
from app.models.risk import RiskAssessment, RiskLevel
from app.repositories.risk_repository import RiskRepository


class RiskScoringService:
    """
    Enterprise AI Risk Scoring Engine.
    Implements deterministic weighted risk scoring using real database records:
      - Behavioral Anomalies (35%)
      - Privilege Misuse (25%)
      - Data Access Violations (20%)
      - Access Pattern Deviations (10%)
      - Historical Security Events (10%)
    Provides Explainable AI (XAI) outputs including confidence score, triggering events,
    detailed reasons, trend direction, and actionable SOC recommendations.
    """

    @classmethod
    def calculate_risk(cls, employee_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        """
        Calculates a deterministic risk assessment for an employee based on actual stored activity logs,
        behavioral baselines, privilege profiles, and security history.
        Does NOT generate fake or random numbers.
        """
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise ValueError(f"Employee with ID {employee_id} not found.")

        # 1. Fetch real DB context records
        activities = (
            db.query(ActivityLog)
            .filter(ActivityLog.employee_id == employee_id)
            .order_by(desc(ActivityLog.timestamp))
            .limit(200)
            .all()
        )
        profile = (
            db.query(BehaviorProfile)
            .filter(BehaviorProfile.employee_id == employee_id)
            .first()
        )
        role = db.query(Role).filter(Role.id == employee.role_id).first() if employee.role_id else None
        prev_assessment = RiskRepository.get_latest_by_employee(db, employee_id)

        reasons = []
        triggering_events = []

        # --- A. Behavioral Anomalies Score (35% weight) ---
        anomaly_score = 0.0
        if activities:
            anomalous_acts = [
                a for a in activities
                if getattr(a, "is_anomaly", False) or "HIGH" in str(a.severity or "").upper() or "CRITICAL" in str(a.severity or "").upper()
            ]
            anomaly_count = len(anomalous_acts)
            
            if anomaly_count > 0:
                anomaly_ratio = anomaly_count / len(activities)
                anomaly_score = min(100.0, (anomaly_ratio * 70.0) + (anomaly_count * 5.0))
                reasons.append(f"Detected {anomaly_count} behavioral anomalies in recent activity logs ({round(anomaly_ratio*100, 1)}% anomaly rate).")
                
                for act in anomalous_acts[:3]:
                    act_desc = act.description or str(act.activity_type or "Unusual activity")
                    act_ts = act.timestamp.strftime('%Y-%m-%d %H:%M') if act.timestamp else 'recent'
                    triggering_events.append(f"Anomaly: {act_desc} at {act_ts}")
            
            if profile and profile.profile_score > 0:
                anomaly_score = min(100.0, anomaly_score + (profile.profile_score * 0.3))

        # --- B. Privilege Misuse Score (25% weight) ---
        privilege_score = 0.0
        is_admin_role = role and ("admin" in role.role_name.lower() or "security" in role.role_name.lower())
        
        # Check failed logins & privileged action attempts
        failed_logins = employee.failed_login_attempts or 0
        if activities:
            priv_acts = [
                a for a in activities
                if any(kw in str(a.activity_type or "").lower() or kw in (a.description or "").lower()
                       for kw in ["admin", "sudo", "privilege", "config", "delete", "grant", "permission"])
            ]
            failed_acts = [
                a for a in activities
                if "FAILED" in str(a.activity_type or "").upper() or "DENIED" in str(a.description or "").upper()
            ]
            
            if failed_logins > 0 or failed_acts:
                privilege_score += min(50.0, (failed_logins * 15.0) + (len(failed_acts) * 10.0))
                reasons.append(f"Identified {failed_logins} failed login attempts and {len(failed_acts)} unauthorized access events.")
            
            if priv_acts:
                privilege_score += min(50.0, len(priv_acts) * 8.0)
                reasons.append(f"Performed {len(priv_acts)} high-privilege configuration or system administrative actions.")

        # --- C. Data Access Violations Score (20% weight) ---
        data_access_score = 0.0
        if activities:
            data_acts = [
                a for a in activities
                if any(kw in str(a.activity_type or "").lower() or kw in (a.description or "").lower()
                       for kw in ["download", "export", "file", "exfil", "database", "bulk", "sensitive"])
                or (getattr(a, "download_size", 0) or 0) > 100000000
            ]
            
            off_hour_data_acts = []
            for a in data_acts:
                if getattr(a, "is_after_hours", False):
                    off_hour_data_acts.append(a)
                elif a.timestamp:
                    hour = a.timestamp.hour
                    if hour < 7 or hour > 19:
                        off_hour_data_acts.append(a)

            if data_acts:
                data_access_score = min(70.0, len(data_acts) * 12.0)
                reasons.append(f"High-volume data access detected: {len(data_acts)} file downloads or export events.")
                
            if off_hour_data_acts:
                data_access_score = min(100.0, data_access_score + (len(off_hour_data_acts) * 15.0))
                reasons.append(f"Off-hours data exfiltration risk: {len(off_hour_data_acts)} file activities outside business hours.")
                for act in off_hour_data_acts[:2]:
                    act_desc = act.description or str(act.activity_type)
                    act_time = act.timestamp.strftime('%H:%M') if act.timestamp else 'off-hours'
                    triggering_events.append(f"Off-Hours Data Access: {act_desc} at {act_time}")

        # --- D. Access Pattern Deviations Score (10% weight) ---
        access_pattern_score = 0.0
        if activities and profile:
            device_mismatches = 0
            os_mismatches = 0
            
            for a in activities:
                dev = a.device_name or getattr(a, "device_info", "")
                if profile.preferred_device and dev and profile.preferred_device.lower() not in dev.lower():
                    device_mismatches += 1
                if profile.preferred_operating_system and a.operating_system and profile.preferred_operating_system.lower() not in a.operating_system.lower():
                    os_mismatches += 1
            
            if device_mismatches > 0 or os_mismatches > 0:
                mismatch_total = device_mismatches + os_mismatches
                access_pattern_score = min(100.0, mismatch_total * 8.0)
                reasons.append(f"Device and OS environment deviations detected across {device_mismatches} sessions.")

        # --- E. Historical Security Events Score (10% weight) ---
        history_score = 0.0
        if prev_assessment:
            # Factor past risk level into current historical score
            if prev_assessment.risk_level == RiskLevel.CRITICAL:
                history_score = 90.0
                reasons.append("Employee has a prior history of Critical risk level classifications.")
            elif prev_assessment.risk_level == RiskLevel.HIGH:
                history_score = 65.0
                reasons.append("Employee has a prior history of High risk level classifications.")
            elif prev_assessment.risk_level == RiskLevel.MEDIUM:
                history_score = 35.0

        # Ensure default baseline reason if employee has clean activity
        if not reasons:
            reasons.append("Activity patterns match baseline behavior with no significant risk anomalies detected.")

        # --- Calculate Final Composite Risk Score (Weighted) ---
        weighted_score = (
            (anomaly_score * 0.35) +
            (privilege_score * 0.25) +
            (data_access_score * 0.20) +
            (access_pattern_score * 0.10) +
            (history_score * 0.10)
        )
        final_risk_score = round(min(100.0, max(0.0, weighted_score)), 1)

        # Categorize Risk Level
        if final_risk_score >= 76.0:
            risk_level = RiskLevel.CRITICAL
        elif final_risk_score >= 51.0:
            risk_level = RiskLevel.HIGH
        elif final_risk_score >= 26.0:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        # Confidence Score: Scale based on quantity of activity logs & baseline profile presence
        activity_sample_count = len(activities)
        if activity_sample_count >= 50 and profile:
            confidence_score = 0.98
        elif activity_sample_count >= 20:
            confidence_score = 0.92
        elif activity_sample_count >= 5:
            confidence_score = 0.85
        else:
            confidence_score = 0.70

        # Calculate Risk Trend
        if prev_assessment:
            diff = final_risk_score - prev_assessment.risk_score
            if diff > 3.0:
                risk_trend = "UP"
            elif diff < -3.0:
                risk_trend = "DOWN"
            else:
                risk_trend = "STABLE"
        else:
            risk_trend = "STABLE"

        # Generate Actionable SOC Recommendations
        recommendations = []
        if risk_level in [RiskLevel.CRITICAL, RiskLevel.HIGH]:
            recommendations.append("Initiate SOC threat investigation and review recent activity logs.")
            if data_access_score > 40.0:
                recommendations.append("Review recent file downloads and export activity for potential data exfiltration.")
            if privilege_score > 40.0:
                recommendations.append("Verify privilege changes and audit administrative actions.")
            recommendations.append("Temporarily restrict high-privilege system access pending review.")
        elif risk_level == RiskLevel.MEDIUM:
            recommendations.append("Monitor user activity closely over the next 48 hours.")
            if data_access_score > 20.0:
                recommendations.append("Verify authorization for recent file access.")
            recommendations.append("Conduct security awareness check-in with manager.")
        else:
            recommendations.append("Standard monitoring. Continue standard security baselining.")

        recommendation_str = " | ".join(recommendations)

        return {
            "employee_id": employee_id,
            "risk_score": final_risk_score,
            "risk_level": risk_level,
            "anomaly_score": round(anomaly_score, 1),
            "privilege_score": round(privilege_score, 1),
            "data_access_score": round(data_access_score, 1),
            "access_pattern_score": round(access_pattern_score, 1),
            "history_score": round(history_score, 1),
            "confidence_score": confidence_score,
            "reasons": reasons,
            "triggering_events": triggering_events if triggering_events else ["No severe triggering events logged."],
            "recommendation": recommendation_str,
            "risk_trend": risk_trend,
            "anomaly_detected": (anomaly_score > 30.0 or risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]),
            "last_analyzed": datetime.utcnow(),
        }

    @classmethod
    def calculate_employee_risk(cls, employee_id: uuid.UUID, db: Session) -> RiskAssessment:
        """
        Calculates and persists a NEW historical Risk Assessment record.
        Maintains complete audit history without overwriting previous score records.
        """
        assessment_data = cls.calculate_risk(employee_id, db)
        return RiskRepository.create_assessment(db, assessment_data)

    @classmethod
    def get_risk_current(cls, employee_id: uuid.UUID, db: Session) -> Dict[str, Any]:
        """
        Returns current risk assessment for an employee.
        If no score exists yet, performs on-demand deterministic calculation and saves it.
        """
        latest = RiskRepository.get_latest_by_employee(db, employee_id)
        if not latest:
            latest = cls.calculate_employee_risk(employee_id, db)

        emp = db.query(Employee).filter(Employee.id == employee_id).first()
        dept_name = emp.department.department_name if (emp and emp.department) else "Unassigned"

        return {
            "id": str(latest.id),
            "employee_id": str(latest.employee_id),
            "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
            "department_name": dept_name,
            "risk_score": latest.risk_score,
            "risk_level": latest.risk_level,
            "anomaly_score": latest.anomaly_score,
            "privilege_score": latest.privilege_score,
            "data_access_score": latest.data_access_score,
            "access_pattern_score": latest.access_pattern_score,
            "history_score": latest.history_score,
            "confidence_score": latest.confidence_score,
            "reasons": latest.reasons or [],
            "triggering_events": latest.triggering_events or [],
            "recommendation": latest.recommendation,
            "risk_trend": latest.risk_trend,
            "anomaly_detected": latest.anomaly_detected,
            "created_at": latest.created_at.isoformat() if latest.created_at else None,
        }

    @classmethod
    def get_risk_history(cls, employee_id: uuid.UUID, db: Session, limit: int = 30) -> List[Dict[str, Any]]:
        """Returns chronological risk score history for trend visualization."""
        history = RiskRepository.get_history_by_employee(db, employee_id, limit)
        return [
            {
                "id": str(h.id),
                "risk_score": h.risk_score,
                "risk_level": h.risk_level,
                "anomaly_score": h.anomaly_score,
                "privilege_score": h.privilege_score,
                "data_access_score": h.data_access_score,
                "access_pattern_score": h.access_pattern_score,
                "history_score": h.history_score,
                "confidence_score": h.confidence_score,
                "risk_trend": h.risk_trend,
                "timestamp": h.created_at.isoformat() if h.created_at else None,
            }
            for h in reversed(history)  # Chronological order
        ]

    @classmethod
    def get_top_risk_employees(cls, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """Returns employees with the highest risk scores."""
        return RiskRepository.get_top_risk_employees(db, limit)

    @classmethod
    def get_department_risk(cls, db: Session) -> List[Dict[str, Any]]:
        """Returns department risk metrics."""
        return RiskRepository.get_department_risk_summary(db)

    @classmethod
    def get_risk_dashboard_stats(cls, db: Session) -> Dict[str, Any]:
        """Returns overall SOC risk dashboard metrics."""
        stats = RiskRepository.get_dashboard_stats(db)
        stats["department_risk"] = cls.get_department_risk(db)
        stats["top_risk_employees"] = cls.get_top_risk_employees(db, limit=5)
        return stats
