"""
Permission seeding and management service.
"""
from database.db import db
from models.permission import Permission
from models.role import Role
from models.role_permission import RolePermission

# Define all permissions in the system
PERMISSIONS = {
    # Admin Permissions
    "VIEW_ALL_EMPLOYEES": "View all employees",
    "CREATE_USER": "Create new users",
    "DELETE_USER": "Delete users",
    "UPDATE_USER": "Update user information",
    "ASSIGN_ROLES": "Assign roles to users",
    "CHANGE_DEPARTMENTS": "Change employee departments",
    "CONFIGURE_SYSTEM": "Configure system settings",
    "VIEW_ALL_ACTIVITY_LOGS": "View all activity logs",
    "VIEW_ALL_ALERTS": "View all alerts",
    "MANAGE_ML_CONFIG": "Manage ML configuration",
    "GENERATE_REPORTS": "Generate system reports",
    "VIEW_ANALYTICS": "View system analytics",
    "EXPORT_DATA": "Export system data",
    "MANAGE_PERMISSIONS": "Manage permissions",
    
    # Security Analyst Permissions
    "VIEW_ASSIGNED_EMPLOYEES": "View assigned employees",
    "VIEW_ASSIGNED_DEPARTMENTS": "View assigned departments",
    "MONITOR_SUSPICIOUS_ACTIVITY": "Monitor suspicious activities",
    "INVESTIGATE_ALERTS": "Investigate alerts",
    "ADD_INVESTIGATION_NOTES": "Add investigation notes",
    "CLOSE_ALERTS": "Close alerts",
    "VIEW_THREAT_INTELLIGENCE": "View threat intelligence",
    "GENERATE_ANALYST_REPORTS": "Generate analysis reports",
    
    # SOC Engineer Permissions
    "MONITOR_LIVE_ACTIVITY": "Monitor live activity",
    "VIEW_SECURITY_LOGS": "View security logs",
    "MONITOR_LOGIN_EVENTS": "Monitor login events",
    "VIEW_AUTH_ANOMALIES": "View authentication anomalies",
    "ESCALATE_INCIDENTS": "Escalate incidents",
    "VIEW_SYSTEM_HEALTH": "View system health",
    
    # Employee Permissions
    "VIEW_OWN_PROFILE": "View own profile",
    "VIEW_OWN_ACTIVITY": "View own activity logs",
    "VIEW_OWN_RISK_SCORE": "View own risk score",
    "VIEW_NOTIFICATIONS": "View notifications",
    "CHANGE_OWN_PASSWORD": "Change own password",
}

# Role to permissions mapping
ROLE_PERMISSIONS = {
    "ADMINISTRATOR": [
        # Admin can do everything
        "VIEW_ALL_EMPLOYEES",
        "CREATE_USER",
        "DELETE_USER",
        "UPDATE_USER",
        "ASSIGN_ROLES",
        "CHANGE_DEPARTMENTS",
        "CONFIGURE_SYSTEM",
        "VIEW_ALL_ACTIVITY_LOGS",
        "VIEW_ALL_ALERTS",
        "MANAGE_ML_CONFIG",
        "GENERATE_REPORTS",
        "VIEW_ANALYTICS",
        "EXPORT_DATA",
        "MANAGE_PERMISSIONS",
        "VIEW_ASSIGNED_EMPLOYEES",
        "VIEW_ASSIGNED_DEPARTMENTS",
        "MONITOR_SUSPICIOUS_ACTIVITY",
        "INVESTIGATE_ALERTS",
        "ADD_INVESTIGATION_NOTES",
        "CLOSE_ALERTS",
        "VIEW_THREAT_INTELLIGENCE",
        "GENERATE_ANALYST_REPORTS",
        "MONITOR_LIVE_ACTIVITY",
        "VIEW_SECURITY_LOGS",
        "MONITOR_LOGIN_EVENTS",
        "VIEW_AUTH_ANOMALIES",
        "ESCALATE_INCIDENTS",
        "VIEW_SYSTEM_HEALTH",
        "VIEW_OWN_PROFILE",
        "VIEW_OWN_ACTIVITY",
        "VIEW_OWN_RISK_SCORE",
        "VIEW_NOTIFICATIONS",
        "CHANGE_OWN_PASSWORD",
    ],
    "SECURITY_ANALYST": [
        "VIEW_ASSIGNED_EMPLOYEES",
        "VIEW_ASSIGNED_DEPARTMENTS",
        "MONITOR_SUSPICIOUS_ACTIVITY",
        "INVESTIGATE_ALERTS",
        "ADD_INVESTIGATION_NOTES",
        "CLOSE_ALERTS",
        "VIEW_THREAT_INTELLIGENCE",
        "GENERATE_ANALYST_REPORTS",
        "VIEW_OWN_PROFILE",
        "VIEW_OWN_ACTIVITY",
        "VIEW_OWN_RISK_SCORE",
        "VIEW_NOTIFICATIONS",
        "CHANGE_OWN_PASSWORD",
    ],
    "SOC_ENGINEER": [
        "MONITOR_LIVE_ACTIVITY",
        "VIEW_SECURITY_LOGS",
        "MONITOR_LOGIN_EVENTS",
        "VIEW_AUTH_ANOMALIES",
        "ESCALATE_INCIDENTS",
        "VIEW_SYSTEM_HEALTH",
        "VIEW_OWN_PROFILE",
        "VIEW_OWN_ACTIVITY",
        "VIEW_OWN_RISK_SCORE",
        "VIEW_NOTIFICATIONS",
        "CHANGE_OWN_PASSWORD",
    ],
    "EMPLOYEE": [
        "VIEW_OWN_PROFILE",
        "VIEW_OWN_ACTIVITY",
        "VIEW_OWN_RISK_SCORE",
        "VIEW_NOTIFICATIONS",
        "CHANGE_OWN_PASSWORD",
    ],
}

def seed_permissions():
    """Seed all permissions and role-permission mappings."""
    try:
        # Create permissions if they don't exist
        for permission_name, description in PERMISSIONS.items():
            permission = Permission.query.filter_by(permission_name=permission_name).first()
            if not permission:
                permission = Permission(
                    permission_name=permission_name,
                    description=description
                )
                db.session.add(permission)
        
        db.session.commit()
        
        # Assign permissions to roles
        for role_name, permission_names in ROLE_PERMISSIONS.items():
            role = Role.query.filter_by(role_name=role_name).first()
            if role:
                # Clear existing permissions
                RolePermission.query.filter_by(role_id=role.id).delete()
                
                # Assign new permissions
                for permission_name in permission_names:
                    permission = Permission.query.filter_by(permission_name=permission_name).first()
                    if permission:
                        role_perm = RolePermission(role_id=role.id, permission_id=permission.id)
                        db.session.add(role_perm)
        
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding permissions: {str(e)}")
        return False
