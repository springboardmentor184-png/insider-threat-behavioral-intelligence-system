import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import (
    SMTP_SERVER,
    SMTP_PORT,
    SMTP_USERNAME,
    SMTP_PASSWORD,
)


def send_otp_email(recipient_email: str, otp: str):

    print("====================================")
    print("OTP EMAIL DEBUG")
    print("Recipient:", recipient_email)
    print("SMTP Server:", SMTP_SERVER)
    print("SMTP Port:", SMTP_PORT)
    print("SMTP Username:", SMTP_USERNAME)
    print("OTP:", otp)
    print("====================================")

    subject = "Insider Threat System - Password Reset OTP"

    body = f"""
Hello,

Your password reset OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this password reset,
please ignore this email.

Regards,
AI Insider Threat Behavioral Intelligence System
"""

    message = MIMEMultipart()
    message["From"] = SMTP_USERNAME
    message["To"] = recipient_email
    message["Subject"] = subject

    message.attach(
        MIMEText(body, "plain")
    )

    try:

        print("Connecting to SMTP server...")

        with smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT
        ) as server:

            print("Starting TLS...")

            server.starttls()

            print("Logging into Gmail...")

            server.login(
                SMTP_USERNAME,
                SMTP_PASSWORD
            )

            print("Gmail authentication successful.")

            server.sendmail(
                SMTP_USERNAME,
                recipient_email,
                message.as_string()
            )

            print("OTP EMAIL SENT SUCCESSFULLY.")

    except Exception as error:

        print("====================================")
        print("SMTP ERROR")
        print(repr(error))
        print("====================================")

        raise