import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Configurable SMTP settings via environment variables
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "security-alerts@company.com").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@company.com").strip()

def send_critical_risk_email(
    employee_name: str,
    employee_code: str,
    department: str,
    risk_score: float,
    risk_level: str,
    explanation: str,
    description: str = None,
    threat_prediction: dict = None,
    admin_email: str = None
):
    """
    Sends an automated Critical Risk Security Alert Email to the Administrator
    whenever an employee's Insider Risk Score reaches >= 75.0%. Includes full Incident Description.
    """
    target_admin = admin_email or ADMIN_EMAIL
    subject = f"[CRITICAL INSIDER RISK ALERT] {employee_name} ({employee_code}) - Risk Score: {risk_score}%"

    incident_desc = description or f"Critical security policy breach detected for monitored personnel {employee_name} ({employee_code}) in {department}. Activity telemetry indicates statistically significant anomaly density breaching the Critical Risk Threshold ({risk_score}% >= 75.0%). Immediate isolation of endpoint workstation recommended."

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }}
            .container {{ max-width: 650px; background: #ffffff; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 6px solid #b91c1c; }}
            .header {{ background-color: #b91c1c; color: #ffffff; padding: 22px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 22px; font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.02em; }}
            .content {{ padding: 25px; color: #334155; }}
            .badge-critical {{ background-color: #fee2e2; color: #991b1b; padding: 5px 12px; border-radius: 6px; font-weight: bold; display: inline-block; border: 1px solid #f87171; }}
            .score-box {{ font-size: 32px; font-weight: bold; color: #b91c1c; margin: 5px 0; }}
            .table-details {{ width: 100%; border-collapse: collapse; margin-top: 15px; }}
            .table-details td {{ padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }}
            .table-details td.label {{ font-weight: bold; color: #64748b; width: 35%; }}
            .box-description {{ background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px; margin-top: 18px; border-radius: 0 6px 6px 0; font-size: 14px; color: #1e3a8a; line-height: 1.5; }}
            .box-explanation {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 14px; margin-top: 14px; border-radius: 0 6px 6px 0; font-size: 13.5px; color: #7f1d1d; line-height: 1.5; }}
            .footer {{ background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
            .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚨 CRITICAL INSIDER RISK SECURITY NOTIFICATION</h1>
            </div>
            <div class="content">
                <p>Attention <strong>SOC Security Administrator</strong>,</p>
                <p>The Insider Threat Behavioral Intelligence System has detected an employee whose dynamic risk score has breached the <strong>Critical Risk Threshold (≥ 75.0%)</strong>.</p>
                
                <table class="table-details">
                    <tr>
                        <td class="label">Employee Name:</td>
                        <td><strong>{employee_name}</strong> ({employee_code})</td>
                    </tr>
                    <tr>
                        <td class="label">Department:</td>
                        <td>{department}</td>
                    </tr>
                    <tr>
                        <td class="label">Current Risk Score:</td>
                        <td><span class="score-box">{risk_score} / 100</span></td>
                    </tr>
                    <tr>
                        <td class="label">Risk Classification:</td>
                        <td><span class="badge-critical">{risk_level}</span></td>
                    </tr>
                    <tr>
                        <td class="label">Predicted Threat:</td>
                        <td>{threat_prediction.get('predicted_threat_vector', 'High-Risk Data Exfiltration') if threat_prediction else 'High-Risk Data Exfiltration'}</td>
                    </tr>
                    <tr>
                        <td class="label">Recommended Action:</td>
                        <td><strong>{threat_prediction.get('recommended_action', 'Isolate Endpoint & Initiate SOC Case') if threat_prediction else 'Isolate Endpoint & Initiate SOC Case'}</strong></td>
                    </tr>
                </table>

                <!-- Explicit Incident Description Box -->
                <div class="box-description">
                    <strong style="color: #1e40af;">📄 Detailed Incident Description:</strong><br/>
                    {incident_desc}
                </div>

                <!-- Behavioral Explanation Box -->
                <div class="box-explanation">
                    <strong style="color: #991b1b;">⚠️ Behavioral Explanation & Risk Rationale:</strong><br/>
                    {explanation}
                </div>

                <div style="text-align: center; margin-top: 22px;">
                    <a href="http://localhost:3000/investigations" class="btn">Open SOC Threat Investigation Case</a>
                </div>
            </div>
            <div class="footer">
                Insider Threat Behavioral Intelligence System v3.0 • Confidential Security Telemetry Alert
            </div>
        </div>
    </body>
    </html>
    """

    print(f"\n=================================================================")
    print(f"DISPATCHING CRITICAL RISK EMAIL ALERT TO ADMINISTRATOR")
    print(f"Recipient : {target_admin}")
    print(f"Subject   : {subject}")
    print(f"Employee  : {employee_name} ({employee_code}) | Score: {risk_score}/100")
    print(f"=================================================================\n")

    # If SMTP credentials provided, dispatch via SMTP
    if SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SMTP_USER
            msg["To"] = target_admin
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, target_admin, msg.as_string())
            print(f"[OK] Email successfully delivered via SMTP to {target_admin}")
            return True, f"Email delivered via SMTP to {target_admin}"
        except Exception as ex:
            print(f"[WARN] SMTP Delivery Warning (Logged in System): {ex}")
            return False, f"SMTP delivery failed: {str(ex)}"
    else:
        # Development / Simulation mode: Successfully logged & recorded
        print(f"[INFO] Critical Risk Email dispatched to {target_admin} (SMTP Credentials not set).")
        return True, f"Dev simulation mode: Dispatched to server console for {target_admin}"

def send_password_reset_email(
    target_email: str,
    reset_token: str,
    reset_link: str
) -> bool:
    """
    Sends an automated HTML Password Reset Email to the user with a direct reset link.
    """
    full_reset_url = f"http://localhost:3000{reset_link}"
    subject = "[InsiderThreat.AI] Password Reset Request"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }}
            .container {{ max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 6px solid #4f46e5; }}
            .header {{ background-color: #4f46e5; color: #ffffff; padding: 20px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 22px; font-family: 'Space Grotesk', sans-serif; }}
            .content {{ padding: 25px; color: #334155; line-height: 1.5; }}
            .token-box {{ background: #f1f5f9; border: 1px dashed #cbd5e1; padding: 12px; margin: 15px 0; font-family: monospace; font-size: 15px; word-break: break-all; color: #0f172a; text-align: center; border-radius: 6px; }}
            .footer {{ background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
            .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔑 PASSWORD RESET REQUEST</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password for your <strong>InsiderThreat.AI</strong> operator account.</p>
                
                <p>Click the button below to reset your password. This link is valid for <strong>15 minutes</strong>:</p>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="{full_reset_url}" class="btn">Reset My Password Now</a>
                </div>

                <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:</p>
                <div class="token-box">{full_reset_url}</div>

                <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                    If you did not request a password reset, please ignore this email or contact your Security Administrator immediately.
                </p>
            </div>
            <div class="footer">
                InsiderThreat.AI • Secure Identity & Access Management
            </div>
        </div>
    </body>
    </html>
    """

    print(f"\n=================================================================")
    print(f"DISPATCHING PASSWORD RESET EMAIL TO USER")
    print(f"Recipient : {target_email}")
    print(f"Subject   : {subject}")
    print(f"Reset Link: {full_reset_url}")
    print(f"=================================================================\n")

    if SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SMTP_USER
            msg["To"] = target_email
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, target_email, msg.as_string())
            print(f"[OK] Reset email successfully delivered via SMTP to {target_email}")
            return True, f"Password reset email delivered via SMTP to {target_email}"
        except Exception as ex:
            print(f"[WARN] SMTP Reset Email Warning: {ex}")
            return False, f"SMTP delivery failed: {str(ex)}"
    else:
        print(f"[INFO] Password reset link generated for {target_email}: {full_reset_url}")
        return True, f"Dev simulation mode: Dispatched to server console for {target_email}"

def send_otp_email(
    target_email: str,
    otp_code: str,
    purpose: str = "Password Reset & Account Access Verification"
):
    """
    Sends an automated 6-digit OTP verification code via email.
    """
    subject = f"[InsiderThreat.AI] Your 6-Digit Verification Code: {otp_code}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }}
            .container {{ max-width: 550px; background: #ffffff; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-left: 6px solid #06b6d4; }}
            .header {{ background-color: #06b6d4; color: #ffffff; padding: 20px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 20px; font-family: 'Space Grotesk', sans-serif; }}
            .content {{ padding: 25px; color: #334155; line-height: 1.5; text-align: center; }}
            .otp-box {{ background: #f0fdf4; border: 2px dashed #16a34a; padding: 15px 25px; margin: 20px auto; font-family: 'Space Grotesk', monospace; font-size: 36px; font-weight: bold; color: #15803d; letter-spacing: 0.25em; border-radius: 8px; width: fit-content; }}
            .footer {{ background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 ONE-TIME VERIFICATION CODE (OTP)</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Your 6-digit One-Time Password (OTP) for <strong>{purpose}</strong> is:</p>
                
                <div class="otp-box">{otp_code}</div>

                <p style="font-size: 13px; color: #64748b;">
                    This OTP is valid for <strong>10 minutes</strong>. Do not share this verification code with anyone.
                </p>
            </div>
            <div class="footer">
                InsiderThreat.AI • Multi-Factor Authentication & Identity Protection
            </div>
        </div>
    </body>
    </html>
    """

    print(f"\n=================================================================")
    print(f"DISPATCHING 6-DIGIT OTP VERIFICATION CODE TO USER")
    print(f"Recipient : {target_email}")
    print(f"Subject   : {subject}")
    print(f"OTP Code  : {otp_code}")
    print(f"=================================================================\n")

    if SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SMTP_USER
            msg["To"] = target_email
            
            # Send copy to primary operator email for instant testing visibility across all accounts
            recipients = [target_email]
            if target_email.lower() != SMTP_USER.lower():
                msg["Cc"] = SMTP_USER
                recipients.append(SMTP_USER)

            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, recipients, msg.as_string())
            print(f"[OK] 6-Digit OTP email successfully delivered via SMTP to {target_email} (and CC: {SMTP_USER})")
            return True, f"OTP email delivered via SMTP to {target_email} (and CC: {SMTP_USER})"
        except Exception as ex:
            print(f"[WARN] SMTP OTP Email Delivery Warning: {ex}")
            return False, f"SMTP delivery failed: {str(ex)}"
    else:
        print(f"[INFO] 6-Digit OTP code generated for {target_email}: {otp_code}")
        return True, f"Dev simulation mode: Dispatched to server console for {target_email}"
