# check_env.py

from app.services.email_service import (
    SMTP_USER,
    SMTP_HOST,
    SMTP_PASSWORD
)

print("HOST:", SMTP_HOST)
print("USER:", SMTP_USER)
print(
    "PASS length:",
    len(SMTP_PASSWORD) if SMTP_PASSWORD else "MISSING"
)