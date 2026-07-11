from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def home():
    return {
        "message": "Backend is running successfully!"
    }