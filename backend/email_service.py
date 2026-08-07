import os
import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_critical_alert(
    employee,
    risk_score,
    risk_level,
    analysis,
    recommendation,
    receiver_email
):

    try:

        subject = f"🚨 CRITICAL Insider Threat Alert - {employee}"

        body = f"""
INSIDER THREAT ALERT

Employee:
{employee}

Risk Score:
{risk_score}/100

Risk Level:
{risk_level}

AI Analysis:
{analysis}

Recommendation:
{recommendation}

Please investigate this employee immediately.

------------------------------------
Insider Threat Behavioral Intelligence System
"""

        message = MIMEMultipart()

        message["From"] = EMAIL_ADDRESS
        message["To"] = receiver_email
        message["Subject"] = subject

        message.attach(
            MIMEText(body, "plain")
        )

        server = smtplib.SMTP(
            "smtp.gmail.com",
            587
        )

        server.starttls()

        server.login(
            EMAIL_ADDRESS,
            EMAIL_PASSWORD
        )

        server.sendmail(
            EMAIL_ADDRESS,
            receiver_email,
            message.as_string()
        )

        server.quit()

        print("✅ Critical email sent successfully.")

    except Exception as e:

        print("❌ Email Error:", e)