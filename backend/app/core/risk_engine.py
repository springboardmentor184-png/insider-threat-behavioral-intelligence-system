# backend/app/core/risk_engine.py
from datetime import datetime
from typing import List, Dict, Any

class RiskEngine:
    """
    Insider Threat Risk Scoring Engine following PDF Specification (Page 5)
    Weighted Scoring Model:
    - Behavioral Anomalies (35%)
    - Privilege Misuse Indicators (25%)
    - Data Access Violations (20%)
    - Access Pattern Deviations (10%)
    - Historical Security Events (10%)
    """

    def calculate_risk_score(self, anomalies: List[Dict], activities: List[Dict]) -> Dict:
        if not activities and not anomalies:
            return self._get_zero_risk_response()

        total_activities = len(activities) or 1
        
        # 1. Behavioral Anomalies Score (35%)
        # Ratio of anomalous activities or specific behavioral triggers
        behavioral_anomalies_count = len(anomalies)
        behavioral_raw = min(100.0, (behavioral_anomalies_count / max(1, total_activities / 2)) * 100)
        score_behavioral = round(behavioral_raw * 0.35, 2)

        # 2. Privilege Misuse Indicators (25%)
        privilege_events = [
            act for act in activities 
            if "PRIVILEGE" in act.get("event_type", "").upper() 
            or "ADMIN" in act.get("event_type", "").upper()
            or act.get("severity") == "CRITICAL"
        ]
        privilege_raw = min(100.0, len(privilege_events) * 25.0)
        score_privilege = round(privilege_raw * 0.25, 2)

        # 3. Data Access Violations (20%)
        data_events = [
            act for act in activities
            if any(k in act.get("event_type", "").upper() for k in ["DOWNLOAD", "UPLOAD", "TRANSFER", "EXFILTRATION", "USB"])
            or (act.get("metadata") and act.get("metadata").get("bytes_transferred", 0) > 1000000)
        ]
        data_raw = min(100.0, len(data_events) * 20.0)
        score_data_access = round(data_raw * 0.20, 2)

        # 4. Access Pattern Deviations (10%)
        access_events = [
            act for act in activities
            if "UNUSUAL" in act.get("event_type", "").upper()
            or "VPN" in act.get("source_system", "").upper()
            or (act.get("timestamp") and hasattr(act.get("timestamp"), "hour") and (act["timestamp"].hour < 7 or act["timestamp"].hour > 20))
        ]
        access_raw = min(100.0, len(access_events) * 25.0)
        score_access_pattern = round(access_raw * 0.10, 2)

        # 5. Historical Security Events (10%)
        historical_warning_critical = [
            act for act in activities
            if act.get("severity") in ["WARNING", "CRITICAL"]
        ]
        historical_raw = min(100.0, len(historical_warning_critical) * 15.0)
        score_historical = round(historical_raw * 0.10, 2)

        # Total Insider Risk Score
        total_risk_score = round(score_behavioral + score_privilege + score_data_access + score_access_pattern + score_historical, 2)
        final_score = min(100.0, max(0.0, total_risk_score))

        # Risk Category Assignment (PDF Page 5)
        if final_score < 30:
            risk_level = "Low Risk"
            risk_icon = "🟢"
            risk_color = "#22c55e"
        elif final_score < 60:
            risk_level = "Medium Risk"
            risk_icon = "🟡"
            risk_color = "#eab308"
        elif final_score < 80:
            risk_level = "High Risk"
            risk_icon = "🟠"
            risk_color = "#f97316"
        else:
            risk_level = "Critical Risk"
            risk_icon = "🔴"
            risk_color = "#ef4444"

        # Risk Factors Breakdown for Dashboard
        risk_factors_detected = []
        if score_behavioral > 5:
            risk_factors_detected.append({
                "factor": "Behavioral Anomalies",
                "weight": score_behavioral,
                "description": "Deviations from standard behavioral baseline",
                "reason": f"{behavioral_anomalies_count} anomalies identified"
            })
        if score_privilege > 5:
            risk_factors_detected.append({
                "factor": "Privilege Misuse Indicators",
                "weight": score_privilege,
                "description": "Active Directory & administrative privilege changes",
                "reason": f"{len(privilege_events)} elevated privilege events"
            })
        if score_data_access > 5:
            risk_factors_detected.append({
                "factor": "Data Access Violations",
                "weight": score_data_access,
                "description": "High volume transfers & unapproved USB device usage",
                "reason": f"{len(data_events)} data access violations detected"
            })
        if score_access_pattern > 2:
            risk_factors_detected.append({
                "factor": "Access Pattern Deviations",
                "weight": score_access_pattern,
                "description": "Off-hours VPN logins and non-standard IP endpoints",
                "reason": f"{len(access_events)} access pattern deviations"
            })
        if score_historical > 2:
            risk_factors_detected.append({
                "factor": "Historical Security Events",
                "weight": score_historical,
                "description": "Prior warning and critical security incidents",
                "reason": f"{len(historical_warning_critical)} past warning/critical events"
            })

        # Recommendations
        recommendations = []
        if final_score >= 80:
            recommendations.append("🔴 CRITICAL RISK: Escalate immediately to SOC Commander")
            recommendations.append("🛑 Restrict user privileges and isolate host workstation")
        elif final_score >= 60:
            recommendations.append("🟠 HIGH RISK: Assign Security Analyst for active investigation")
            recommendations.append("📋 Audit cloud exfiltration logs and active VPN sessions")
        elif final_score >= 30:
            recommendations.append("🟡 MEDIUM RISK: Monitor employee off-hours activity")
            recommendations.append("🔍 Review USB device whitelist policies")
        else:
            recommendations.append("🟢 LOW RISK: User activity within standard parameters")

        return {
            "risk_score": final_score,
            "risk_level": risk_level,
            "risk_level_icon": risk_icon,
            "risk_level_color": risk_color,
            "weighted_breakdown": {
                "behavioral_anomalies": score_behavioral,
                "privilege_misuse": score_privilege,
                "data_access_violations": score_data_access,
                "access_pattern_deviations": score_access_pattern,
                "historical_events": score_historical
            },
            "raw_weight": final_score,
            "anomaly_count": len(anomalies),
            "total_activities": total_activities,
            "risk_factors": risk_factors_detected,
            "recommendations": recommendations,
            "last_updated": datetime.utcnow().isoformat()
        }

    def _get_zero_risk_response(self) -> Dict:
        return {
            "risk_score": 0,
            "risk_level": "Low Risk",
            "risk_level_icon": "🟢",
            "risk_level_color": "#22c55e",
            "raw_weight": 0,
            "anomaly_count": 0,
            "total_activities": 0,
            "risk_factors": [],
            "recommendations": ["🟢 LOW RISK: No activity recorded for employee"],
            "last_updated": datetime.utcnow().isoformat()
        }