import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Configuration for Gmail SMTP
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "anu.ananya.beckwoad@gmail.com")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD", "your-gmail-app-password")
DEFAULT_RECIPIENT_EMAIL = os.getenv("DEFAULT_RECIPIENT_EMAIL", "anu.ananya.beckwoad@gmail.com")


def send_security_alert_email(
    employee_id: str,
    risk_score: int,
    risk_tier: str,
    reasons: list[str],
    recipient_email: str = DEFAULT_RECIPIENT_EMAIL,
):
    """
    Sends an automated Security Warning Alert to the specified Gmail address
    when an employee exceeds insider risk thresholds or is manually flagged.
    """
    subject = f"🚨 [ITBIS SECURITY ALERT] High Insider Risk Detected for {employee_id} ({risk_tier})"

    reasons_html = "".join([f"<li>{r}</li>" for r in reasons])

    body_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6;">
        <div style="background: #0f172a; padding: 20px; color: #ffffff; border-radius: 8px 8px 0 0;">
          <h2 style="color: #00f2fe; margin: 0;">🛡️ Insider Threat Behavioral Intelligence System</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #94a3b8;">Automated Security Warning Notification</p>
        </div>

        <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 12px 16px; margin-bottom: 20px;">
            <strong style="color: #dc2626;">CRITICAL SECURITY ALERT</strong><br/>
            An employee under continuous monitoring has breached acceptable behavioral risk baselines.
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Employee ID:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #0284c7; font-weight: bold;">{employee_id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><strong>Risk Score:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #ef4444; font-weight: bold;">{risk_score} / 100 ({risk_tier})</td>
            </tr>
          </table>

          <h4 style="color: #0f172a; margin-bottom: 8px;">Triggered Behavioral Indicators:</h4>
          <ul style="color: #334155; padding-left: 20px;">
            {reasons_html}
          </ul>

          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            This alert was generated automatically by the ITBIS Anomaly Detection Engine.<br/>
            Please log into the Security Console to initiate formal threat investigation.
          </div>
        </div>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = recipient_email
    msg.attach(MIMEText(body_html, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure connection via TLS
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, recipient_email, msg.as_string())
        return {"status": "success", "message": f"Alert sent to {recipient_email}"}
    except Exception as e:
        print(f"Failed to send email: {e}")
        return {"status": "error", "error": str(e)}
