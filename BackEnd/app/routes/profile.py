from fastapi import APIRouter

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.get("/")
def get_profile():
    return {
        "username": "admin",
        "name": "System Administrator",
        "email": "admin@insiderai.com",
        "role": "Security Manager",
        "status": "Active"
    }