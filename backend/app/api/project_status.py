from fastapi import APIRouter

router = APIRouter(
    prefix="/project-status",
    tags=["Project Status"]
)


@router.get("")
def get_project_status():

    return {
        "project_name": "Insider Threat Behavioral Intelligence System",
        "version": "1.0.0",
        "status": "Development",

        "modules": {
            "Authentication": "Completed",
            "Role-Based Access Control": "Completed",
            "Email Verification": "Completed",
            "User Profile": "Completed",
            "Employee Management": "Completed",
            "Dashboard": "Completed",
            "Audit Logs": "Completed",
            "Activity Module": "In Progress"
        },

        "database": "Connected",
        "backend": "Completed",
        "frontend": "In Progress"
    }