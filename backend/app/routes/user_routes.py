from fastapi import APIRouter, Depends
from app.auth.dependencies import verify_token, require_admin

router = APIRouter(prefix="/users", tags=["User Management"])

# 1. Standard Protected Route: Anyone with a valid token can access this
@router.get("/profile")
def get_user_profile(current_user: dict = Depends(verify_token)):
    return {
        "message": "Access granted to secure profile area.",
        "user_email": current_user.get("user_email"),
        "role": current_user.get("role")
    }

# 2. RBAC Protected Route: ONLY Administrators can access this
@router.get("/admin/dashboard")
def get_admin_dashboard(current_user: dict = Depends(require_admin)):
    return {
        "message": "Welcome to the Admin-Only Dashboard.",
        "system_status": "All behavioral logs are currently nominal.",
        "admin_user": current_user.get("user_email")
    }