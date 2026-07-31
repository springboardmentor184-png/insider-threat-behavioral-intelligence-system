# backend/app/core/risk_engine.py

from datetime import datetime, timedelta
from typing import List, Dict, Any
from .risk_factors import RISK_FACTORS, get_risk_level

class RiskEngine:
    """
    Insider Threat Risk Scoring Engine
    Calculates risk scores based on user activities and anomalies
    """
    
    def __init__(self):
        self.risk_factors = RISK_FACTORS
    
    def calculate_risk_score(self, anomalies: List[Dict], activities: List[Dict]) -> Dict:
        """
        Calculate risk score for a user based on their anomalies
        
        Args:
            anomalies: List of anomaly objects
            activities: List of all activities
        
        Returns:
            Dict with risk score, level, factors, and recommendations
        """
        if not anomalies:
            return self._get_zero_risk_response()
        
        # Calculate base score from anomalies
        total_weight = 0
        anomaly_details = []
        risk_factors_detected = []
        
        for anomaly in anomalies:
            anomaly_score = self._score_anomaly(anomaly)
            total_weight += anomaly_score["weight"]
            anomaly_details.append(anomaly_score)
            
            # Track risk factors
            if anomaly_score["weight"] > 10:
                risk_factors_detected.append({
                    "factor": anomaly_score["factor"],
                    "weight": anomaly_score["weight"],
                    "description": anomaly_score["description"],
                    "reason": anomaly.get("reasons", ["Unknown reason"])[0]
                })
        
        # Normalize score to 0-100
        max_possible_score = 100
        raw_score = min(total_weight, max_possible_score)
        
        # Apply activity frequency multiplier
        activity_count = len(activities)
        if activity_count > 100:
            multiplier = min(1.2, 1 + (activity_count / 1000))
        else:
            multiplier = 1.0
        
        final_score = min(raw_score * multiplier, 100)
        
        # Determine risk level
        risk_level = get_risk_level(final_score)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(final_score, risk_factors_detected)
        
        return {
            "risk_score": round(final_score, 2),
            "risk_level": risk_level["label"],
            "risk_level_icon": risk_level["icon"],
            "risk_level_color": risk_level["color"],
            "raw_weight": round(total_weight, 2),
            "anomaly_count": len(anomalies),
            "risk_factors": risk_factors_detected[:5],  # Top 5 risk factors
            "recommendations": recommendations,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def _score_anomaly(self, anomaly: Dict) -> Dict:
        """Score a single anomaly based on its type"""
        anomaly_type = anomaly.get("event_type", "UNKNOWN")
        anomaly_source = anomaly.get("source_system", "UNKNOWN")
        anomaly_ip = anomaly.get("ip_address", "UNKNOWN")
        reasons = anomaly.get("reasons", [])
        
        # Determine which risk factor applies
        factor = "unknown"
        weight = 5
        description = "Unusual activity detected"
        
        # Check for specific risk factors
        if "login" in anomaly_type.lower() or "authentication" in anomaly_type.lower():
            factor = "unusual_login_time"
            weight = RISK_FACTORS.get("unusual_login_time", {}).get("weight", 15)
            description = RISK_FACTORS.get("unusual_login_time", {}).get("description", "Unusual login detected")
        
        elif "file_access" in anomaly_type.lower() or "file" in anomaly_type.lower():
            factor = "unusual_file_access"
            weight = RISK_FACTORS.get("unusual_file_access", {}).get("weight", 20)
            description = RISK_FACTORS.get("unusual_file_access", {}).get("description", "Unusual file access detected")
        
        elif "download" in anomaly_type.lower() or "transfer" in anomaly_type.lower():
            factor = "large_data_download"
            weight = RISK_FACTORS.get("large_data_download", {}).get("weight", 30)
            description = RISK_FACTORS.get("large_data_download", {}).get("description", "Large data transfer detected")
        
        elif "usb" in anomaly_type.lower() or "device" in anomaly_type.lower():
            factor = "usb_device_insertion"
            weight = RISK_FACTORS.get("usb_device_insertion", {}).get("weight", 20)
            description = RISK_FACTORS.get("usb_device_insertion", {}).get("description", "USB device detected")
        
        elif "email" in anomaly_type.lower():
            factor = "unusual_email_activity"
            weight = RISK_FACTORS.get("unusual_email_activity", {}).get("weight", 15)
            description = RISK_FACTORS.get("unusual_email_activity", {}).get("description", "Unusual email activity")
        
        elif "network" in anomaly_type.lower():
            factor = "unusual_network_destination"
            weight = RISK_FACTORS.get("unusual_network_destination", {}).get("weight", 25)
            description = RISK_FACTORS.get("unusual_network_destination", {}).get("description", "Unusual network activity")
        
        elif "privilege" in anomaly_type.lower() or "permission" in anomaly_type.lower():
            factor = "privilege_escalation"
            weight = RISK_FACTORS.get("privilege_escalation", {}).get("weight", 30)
            description = RISK_FACTORS.get("privilege_escalation", {}).get("description", "Privilege change detected")
        
        # Check for unusual IP
        if any("unusual IP" in r for r in reasons):
            weight += RISK_FACTORS.get("unusual_ip", {}).get("weight", 10)
        
        # Check for unusual source
        if any("unusual source" in r for r in reasons):
            weight += RISK_FACTORS.get("unusual_source_system", {}).get("weight", 10)
        
        # Check for unusual event
        if any("unusual event" in r for r in reasons):
            weight += RISK_FACTORS.get("unusual_event_type", {}).get("weight", 10)
        
        # Cap weight at 100
        weight = min(weight, 100)
        
        return {
            "factor": factor,
            "weight": weight,
            "description": description,
            "anomaly_type": anomaly_type,
            "source": anomaly_source,
            "ip": anomaly_ip,
            "reasons": reasons
        }
    
    def _get_zero_risk_response(self) -> Dict:
        """Return response when no anomalies are detected"""
        return {
            "risk_score": 0,
            "risk_level": "No Risk",
            "risk_level_icon": "⚪",
            "risk_level_color": "#6c757d",
            "raw_weight": 0,
            "anomaly_count": 0,
            "risk_factors": [],
            "recommendations": [
                "✅ No anomalies detected - Normal behavior",
                "📊 Continue monitoring activity patterns"
            ],
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def _generate_recommendations(self, score: float, risk_factors: List) -> List[str]:
        """Generate actionable recommendations based on risk score"""
        recommendations = []
        
        if score == 0:
            recommendations.append("✅ No anomalies detected - Normal behavior")
            recommendations.append("📊 Continue monitoring activity patterns")
        
        elif score < 30:
            recommendations.append("🟢 Low risk - Continue monitoring")
            recommendations.append("📊 Review activities if they persist")
        
        elif score < 60:
            recommendations.append("🟡 Medium risk - Review anomalies")
            recommendations.append("🔍 Check for patterns of unusual behavior")
            recommendations.append("📋 Document findings for future reference")
        
        elif score < 80:
            recommendations.append("🟠 High risk - Investigate immediately")
            recommendations.append("🚨 Escalate to Security Operations Center")
            recommendations.append("📋 Collect all relevant logs and evidence")
        
        else:
            recommendations.append("🔴 CRITICAL RISK - Immediate action required")
            recommendations.append("🚨 Escalate to SOC immediately")
            recommendations.append("🛑 Consider restricting user access")
            recommendations.append("📋 Preserve all evidence for investigation")
        
        # Add specific recommendations based on risk factors
        if risk_factors:
            unique_factors = set()
            for rf in risk_factors[:3]:
                if rf["factor"] not in unique_factors:
                    unique_factors.add(rf["factor"])
                    recommendations.append(f"🔍 Investigate: {rf['description']}")
        
        return recommendations[:5]  # Return top 5 recommendations