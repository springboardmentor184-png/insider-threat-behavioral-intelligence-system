import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import (
    SMTP_SERVER,
    SMTP_PORT,
    SMTP_USERNAME,
    SMTP_PASSWORD,
    ALERT_EMAIL_TO
)


# =====================================================
# Test Email
# =====================================================

def send_test_email():

    subject = "Insider Threat System - Test Email"

    body = """
Hello,

This is a test email from the
Insider Threat Behavioral Intelligence System.

Email notification service is configured successfully.

This is only a system connectivity test.

Regards,
Insider Threat Behavioral Intelligence System
"""

    message = MIMEMultipart()

    message["From"] = SMTP_USERNAME
    message["To"] = ALERT_EMAIL_TO
    message["Subject"] = subject

    message.attach(
        MIMEText(
            body,
            "plain"
        )
    )

    try:

        with smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT
        ) as server:

            server.starttls()

            server.login(
                SMTP_USERNAME,
                SMTP_PASSWORD
            )

            server.sendmail(
                SMTP_USERNAME,
                ALERT_EMAIL_TO,
                message.as_string()
            )

        print(
            "✅ Test email sent successfully."
        )

        return True

    except Exception as error:

        print(
            "❌ Email sending failed:",
            error
        )

        return False


# =====================================================
# Threat Alert Email
# =====================================================

def send_threat_alert_email(
    employee,
    prediction,
    alert_id=None,
    investigation_id=None
):

    # ---------------------------------
    # Only High/Critical threats
    # ---------------------------------

    if prediction["risk_level"] not in [
        "High",
        "Critical"
    ]:
        return False

    # ---------------------------------
    # Check Email Configuration
    # ---------------------------------

    if not SMTP_USERNAME or not SMTP_PASSWORD:

        print(
            "❌ Email configuration is missing."
        )

        return False

    # ---------------------------------
    # Email Subject
    # ---------------------------------

    subject = (
        f"🚨 {prediction['risk_level']} "
        f"Insider Threat Alert - "
        f"{employee.employee_id}"
    )

    # ---------------------------------
    # Triggered Rules
    # ---------------------------------

    triggered_rules = prediction.get(
        "triggered_rules",
        []
    )

    if triggered_rules:

        rules_text = "\n".join(
            f"- {rule}"
            for rule in triggered_rules
        )

    else:

        rules_text = "None"

    # ---------------------------------
    # Email Body
    # ---------------------------------

    body = f"""
Insider Threat Behavioral Intelligence System
================================================

🚨 SECURITY THREAT ALERT

Employee Information
--------------------
Employee ID   : {employee.employee_id}
Name          : {employee.full_name}
Department    : {employee.department}
Role          : {employee.role}

Threat Details
--------------
Risk Level    : {prediction['risk_level']}
Risk Score    : {prediction['risk_score']}
Prediction    : {prediction['prediction']}
Detection     : {prediction['detection_method']}

Risk Summary
------------
{prediction['risk_summary']}

Triggered Rules
---------------
{rules_text}

Recommendation
--------------
{prediction['recommendation']}

Investigation Details
---------------------
Alert ID          : {alert_id if alert_id else "N/A"}
Investigation ID   : {
    investigation_id
    if investigation_id
    else "N/A"
}

Please review this threat in the
Insider Threat Behavioral Intelligence System.

================================================
Automated Security Notification
"""

    # ---------------------------------
    # Create Email
    # ---------------------------------

    message = MIMEMultipart()

    message["From"] = SMTP_USERNAME
    message["To"] = ALERT_EMAIL_TO
    message["Subject"] = subject

    message.attach(
        MIMEText(
            body,
            "plain"
        )
    )

    # ---------------------------------
    # Send Email
    # ---------------------------------

    try:

        with smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT
        ) as server:

            server.starttls()

            server.login(
                SMTP_USERNAME,
                SMTP_PASSWORD
            )

            server.sendmail(
                SMTP_USERNAME,
                ALERT_EMAIL_TO,
                message.as_string()
            )

        print(
            "✅ Threat alert email sent successfully."
        )

        return True

    except Exception as error:

        print(
            "❌ Threat alert email failed:",
            error
        )

        return False