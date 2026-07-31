# backend/app/core/ueba_engine.py

from typing import List, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict

class UEBADetector:
    """
    User and Entity Behavior Analytics Engine
    Detects behavioral patterns and anomalies using peer group analysis
    """
    
    def __init__(self):
        self.pattern_weights = {
            "after_hours_access": 25,
            "data_hoarding": 30,
            "privilege_abuse": 35,
            "unusual_peer_behavior": 20,
            "location_anomaly": 15
        }
    
    def analyze_peer_group(self, employee_id: str, activities: List[Dict], peers: List[Dict]) -> Dict:
        """
        Compare employee behavior against peers in same department/role
        """
        if not peers or len(peers) < 2:
            return {
                "employee_id": employee_id,
                "peer_count": len(peers),
                "deviations": [],
                "message": "Not enough peers for comparison"
            }
        
        # Calculate peer averages
        peer_activity_counts = []
        peer_anomaly_counts = []
        peer_risk_scores = []
        
        for peer in peers:
            peer_activity_counts.append(peer.get("activity_count", 0))
            peer_anomaly_counts.append(peer.get("anomaly_count", 0))
            peer_risk_scores.append(peer.get("risk_score", 0))
        
        avg_activity = sum(peer_activity_counts) / len(peer_activity_counts) if peer_activity_counts else 0
        avg_anomalies = sum(peer_anomaly_counts) / len(peer_anomaly_counts) if peer_anomaly_counts else 0
        avg_risk = sum(peer_risk_scores) / len(peer_risk_scores) if peer_risk_scores else 0
        
        # Calculate deviations
        deviations = []
        employee_activity = len(activities)
        employee_anomalies = self._count_anomalies(activities)
        
        # Activity deviation
        if employee_activity > avg_activity * 1.5:
            deviations.append({
                "type": "excessive_activity",
                "description": f"User has {employee_activity} activities vs peer average of {avg_activity:.1f}",
                "severity": "medium",
                "weight": 15
            })
        
        # Anomaly deviation
        if employee_anomalies > avg_anomalies * 2:
            deviations.append({
                "type": "excessive_anomalies",
                "description": f"User has {employee_anomalies} anomalies vs peer average of {avg_anomalies:.1f}",
                "severity": "high",
                "weight": 25
            })
        
        return {
            "employee_id": employee_id,
            "peer_count": len(peers),
            "peer_averages": {
                "avg_activity": round(avg_activity, 2),
                "avg_anomalies": round(avg_anomalies, 2),
                "avg_risk": round(avg_risk, 2)
            },
            "employee_metrics": {
                "activity_count": employee_activity,
                "anomaly_count": employee_anomalies
            },
            "deviations": deviations,
            "is_anomalous": len(deviations) > 0
        }
    
    def detect_patterns(self, activities: List[Dict]) -> List[Dict]:
        """
        Detect behavioral patterns in activities
        """
        patterns = []
        
        # Pattern 1: After-hours access
        after_hours_count = 0
        for act in activities:
            timestamp = act.get("timestamp")
            if timestamp:
                hour = timestamp.hour
                if hour < 7 or hour > 20:  # Before 7am or after 8pm
                    after_hours_count += 1
        
        if after_hours_count > 5:
            patterns.append({
                "pattern": "after_hours_access",
                "description": f"User accessed systems {after_hours_count} times outside normal hours",
                "severity": "high",
                "weight": 25
            })
        
        # Pattern 2: Data hoarding (unusual file access volume)
        file_access_count = 0
        for act in activities:
            if "file" in act.get("event_type", "").lower():
                file_access_count += 1
        
        if file_access_count > 20:
            patterns.append({
                "pattern": "data_hoarding",
                "description": f"User accessed files {file_access_count} times (unusually high)",
                "severity": "medium",
                "weight": 20
            })
        
        # Pattern 3: Unusual event diversity
        event_types = set()
        for act in activities:
            event_types.add(act.get("event_type", "UNKNOWN"))
        
        if len(event_types) > 10:
            patterns.append({
                "pattern": "diverse_activity",
                "description": f"User performed {len(event_types)} different types of activities",
                "severity": "low",
                "weight": 10
            })
        
        return patterns
    
    def _count_anomalies(self, activities: List[Dict]) -> int:
        """
        Count anomalies in activities (simplified)
        """
        anomaly_count = 0
        for act in activities:
            # Check if this activity has anomaly markers
            reasons = []
            if "metadata" in act and "reasons" in act["metadata"]:
                reasons = act["metadata"]["reasons"]
            if reasons:
                anomaly_count += 1
        return anomaly_count
    
    def generate_behavioral_baseline(self, activities: List[Dict]) -> Dict:
        """
        Generate a behavioral baseline for a user
        """
        if not activities:
            return {
                "message": "No activities to build baseline",
                "baseline": None
            }
        
        # Calculate baseline metrics
        event_types = {}
        source_systems = {}
        ip_addresses = {}
        hour_distribution = {}
        
        for act in activities:
            event = act.get("event_type", "UNKNOWN")
            event_types[event] = event_types.get(event, 0) + 1
            
            source = act.get("source_system", "UNKNOWN")
            source_systems[source] = source_systems.get(source, 0) + 1
            
            ip = act.get("ip_address", "UNKNOWN")
            ip_addresses[ip] = ip_addresses.get(ip, 0) + 1
            
            timestamp = act.get("timestamp")
            if timestamp:
                hour = timestamp.hour
                hour_distribution[hour] = hour_distribution.get(hour, 0) + 1
        
        # Find most common patterns
        most_common_event = max(event_types, key=event_types.get) if event_types else None
        most_common_source = max(source_systems, key=source_systems.get) if source_systems else None
        most_common_ip = max(ip_addresses, key=ip_addresses.get) if ip_addresses else None
        most_active_hour = max(hour_distribution, key=hour_distribution.get) if hour_distribution else None
        
        return {
            "baseline": {
                "total_activities": len(activities),
                "event_types": event_types,
                "source_systems": source_systems,
                "ip_addresses": ip_addresses,
                "hour_distribution": hour_distribution,
                "most_common_event": most_common_event,
                "most_common_source": most_common_source,
                "most_common_ip": most_common_ip,
                "most_active_hour": most_active_hour
            }
        }