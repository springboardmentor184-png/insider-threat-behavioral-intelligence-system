"""
Permission-based access control decorator for Flask routes.
"""
from functools import wraps
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask import jsonify
from database.db import db
from models.user import User

def requires_permission(*permissions):
    """
    Decorator to require specific permissions.
    
    Usage:
        @app.route('/admin/users')
        @requires_permission('VIEW_ALL_EMPLOYEES', 'MANAGE_USERS')
        def get_users():
            ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                
                user = db.session.get(User, int(user_id))
                if not user:
                    return jsonify({"message": "User not found", "status_code": 401}), 401
                
                # Get user's permissions
                user_permissions = user.role.get_permissions() if user.role else []
                
                # Check if user has any of the required permissions
                has_permission = any(perm in user_permissions for perm in permissions)
                
                if not has_permission:
                    return jsonify({
                        "message": "Access denied. You do not have the required permissions.",
                        "required_permissions": list(permissions),
                        "status_code": 403
                    }), 403
                
                return fn(*args, **kwargs)
                
            except Exception as e:
                return jsonify({
                    "message": "Authentication failed.",
                    "error": str(e),
                    "status_code": 401
                }), 401
        
        return wrapper
    return decorator


def requires_role(*roles):
    """
    Decorator to require specific roles.
    
    Usage:
        @app.route('/admin/dashboard')
        @requires_role('ADMINISTRATOR')
        def admin_dashboard():
            ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                
                user = db.session.get(User, int(user_id))
                if not user:
                    return jsonify({"message": "User not found", "status_code": 401}), 401
                
                # Normalize role names for comparison
                user_role = user.role.role_name.upper() if user.role else None
                normalized_roles = [r.upper() for r in roles]
                
                # Support role aliases
                if "ADMIN" in normalized_roles and "ADMINISTRATOR" not in normalized_roles:
                    normalized_roles.append("ADMINISTRATOR")
                
                if user_role not in normalized_roles:
                    return jsonify({
                        "message": "Access denied. You do not have the required role.",
                        "required_roles": roles,
                        "status_code": 403
                    }), 403
                
                return fn(*args, **kwargs)
                
            except Exception as e:
                return jsonify({
                    "message": "Authentication failed.",
                    "error": str(e),
                    "status_code": 401
                }), 401
        
        return wrapper
    return decorator


def get_current_user():
    """
    Get the current authenticated user.
    """
    try:
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        return user
    except:
        return None
