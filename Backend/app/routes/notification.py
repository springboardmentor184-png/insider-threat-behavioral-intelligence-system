from fastapi import APIRouter

from app.services.email_service import send_test_email


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("/test-email")
def test_email():

    result = send_test_email()

    if result:

        return {
            "message": "Test email sent successfully"
        }

    return {
        "message": "Failed to send test email"
    }