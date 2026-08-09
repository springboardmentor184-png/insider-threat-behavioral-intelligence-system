import os
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv


load_dotenv()


SMTP_HOST = os.getenv(
    "SMTP_HOST",
    "smtp.gmail.com"
)

SMTP_PORT = int(
    os.getenv(
        "SMTP_PORT",
        587
    )
)

SMTP_USER = os.getenv(
    "SMTP_USER"
)

SMTP_PASSWORD = os.getenv(
    "SMTP_PASSWORD"
)

FROM_EMAIL = os.getenv(
    "FROM_EMAIL",
    SMTP_USER
)


def send_email(
    to_email: str,
    subject: str,
    body: str
) -> bool:

    # =====================================================
    # CHECK SMTP CONFIGURATION
    # =====================================================

    if not SMTP_USER or not SMTP_PASSWORD:
        # SMTP not configured — log instead of crashing,
        # so the application still works without email
        # configuration during development.

        print(
            f"[EMAIL SKIPPED - SMTP not configured] "
            f"To: {to_email} | Subject: {subject}"
        )

        return False

    # =====================================================
    # CREATE EMAIL
    # =====================================================

    msg = MIMEMultipart()

    msg["From"] = FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(
        MIMEText(
            body,
            "plain"
        )
    )

    # =====================================================
    # SEND EMAIL
    # =====================================================

    try:
        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT, timeout=10
        ) as server:

            server.starttls()

            server.login(
                SMTP_USER,
                SMTP_PASSWORD
            )

            server.sendmail(
                FROM_EMAIL,
                to_email,
                msg.as_string()
            )

        return True

    except Exception as e:

        print(
            f"[EMAIL ERROR] "
            f"Failed to send to {to_email}: {e}"
        )

        return False