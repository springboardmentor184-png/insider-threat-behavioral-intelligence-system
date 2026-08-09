from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()


# ==========================
# Database
# ==========================

DATABASE_URL = os.getenv("DATABASE_URL")


# ==========================
# Email Configuration
# ==========================

SMTP_SERVER = os.getenv(
    "SMTP_SERVER",
    "smtp.gmail.com"
)

SMTP_PORT = int(
    os.getenv(
        "SMTP_PORT",
        "587"
    )
)

SMTP_USERNAME = os.getenv("SMTP_USERNAME")

SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

ALERT_EMAIL_TO = os.getenv("ALERT_EMAIL_TO")


# ==========================
# Security
# ==========================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = os.getenv("ALGORITHM")

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "30"
    )
)