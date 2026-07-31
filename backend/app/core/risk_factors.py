# backend/app/core/risk_factors.py

"""
Risk Factors Configuration for Insider Threat Scoring
Each risk factor has a weight and description.
"""

RISK_FACTORS = {
    # Authentication & Access
    "unusual_login_time": {
        "weight": 15,
        "description": "Login outside normal working hours",
        "category": "Authentication"
    },
    "failed_login_attempts": {
        "weight": 20,
        "description": "Multiple failed login attempts in a short period",
        "category": "Authentication"
    },
    "login_from_new_ip": {
        "weight": 10,
        "description": "Login from an IP address never seen before",
        "category": "Authentication"
    },
    "login_from_new_location": {
        "weight": 15,
        "description": "Login from a new geographic location",
        "category": "Authentication"
    },
    
    # Data Access
    "unusual_file_access": {
        "weight": 20,
        "description": "Accessing files not normally accessed",
        "category": "Data Access"
    },
    "large_data_download": {
        "weight": 30,
        "description": "Downloading unusually large amounts of data",
        "category": "Data Access"
    },
    "data_exfiltration": {
        "weight": 35,
        "description": "Transferring data to external destinations",
        "category": "Data Access"
    },
    "file_deletion": {
        "weight": 25,
        "description": "Deleting large numbers of files",
        "category": "Data Access"
    },
    
    # System & Privilege
    "privilege_escalation": {
        "weight": 30,
        "description": "Unusual role or permission changes",
        "category": "System"
    },
    "unusual_event_type": {
        "weight": 10,
        "description": "Event type never seen before",
        "category": "System"
    },
    "unusual_source_system": {
        "weight": 10,
        "description": "Source system never seen before",
        "category": "System"
    },
    "unusual_ip": {
        "weight": 10,
        "description": "IP address never seen before",
        "category": "System"
    },
    
    # Device & Media
    "usb_device_insertion": {
        "weight": 20,
        "description": "USB device insertion detected",
        "category": "Device"
    },
    "unusual_device_usage": {
        "weight": 15,
        "description": "Using devices not normally used",
        "category": "Device"
    },
    
    # Email & Communication
    "unusual_email_activity": {
        "weight": 15,
        "description": "Unusual email sending patterns",
        "category": "Communication"
    },
    "external_communication": {
        "weight": 20,
        "description": "Communicating with external domains",
        "category": "Communication"
    },
    
    # Network
    "unusual_network_destination": {
        "weight": 25,
        "description": "Accessing unusual network destinations",
        "category": "Network"
    },
    "large_data_transfer": {
        "weight": 30,
        "description": "Large data transfers over network",
        "category": "Network"
    }
}

# Risk Level Thresholds
RISK_LEVELS = {
    "critical": {"min_score": 80, "color": "#dc3545", "icon": "🔴", "label": "Critical Risk"},
    "high": {"min_score": 60, "color": "#fd7e14", "icon": "🟠", "label": "High Risk"},
    "medium": {"min_score": 30, "color": "#ffc107", "icon": "🟡", "label": "Medium Risk"},
    "low": {"min_score": 1, "color": "#28a745", "icon": "🟢", "label": "Low Risk"},
    "no_risk": {"min_score": 0, "color": "#6c757d", "icon": "⚪", "label": "No Risk"}
}

def get_risk_level(score: float) -> dict:
    """Get risk level based on score"""
    if score >= RISK_LEVELS["critical"]["min_score"]:
        return RISK_LEVELS["critical"]
    elif score >= RISK_LEVELS["high"]["min_score"]:
        return RISK_LEVELS["high"]
    elif score >= RISK_LEVELS["medium"]["min_score"]:
        return RISK_LEVELS["medium"]
    elif score > 0:
        return RISK_LEVELS["low"]
    else:
        return RISK_LEVELS["no_risk"]