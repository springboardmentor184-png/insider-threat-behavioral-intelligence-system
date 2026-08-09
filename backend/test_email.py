from app.services.email_service import send_email


result = send_email(
    "ganesh.gb2005@gmail.com",
    "Test Email from Insider Threat System",
    "This is a test email to confirm SMTP is working."
)


print(
    "Success!"
    if result
    else "Failed — check credentials/network"
)