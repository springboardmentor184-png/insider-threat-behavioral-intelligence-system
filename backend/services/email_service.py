"""
Email Notification Service
Sends automated email alerts to Administrators, Security Managers, and Team Leaders
upon Critical/High security anomalies, incident escalations, or policy violations.
"""

import asyncio
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Dict, Any

from backend.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class EmailService:
    @classmethod
    async def verify_smtp_connection(cls) -> dict:
        """
        Diagnostic method to test SMTP server connection and credentials.
        """
        get_settings.cache_clear()
        settings = get_settings()

        if not settings.EMAIL_NOTIFICATIONS_ENABLED:
            return {"status": "disabled", "message": "Email notifications are disabled in configuration."}

        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            return {
                "status": "mock_mode",
                "message": "SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not set. Email service is running in development/console log mode.",
                "config": {
                    "smtp_host": settings.SMTP_HOST,
                    "smtp_port": settings.SMTP_PORT,
                    "from_email": settings.EMAILS_FROM_EMAIL
                }
            }

        def _test_connect():
            try:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                return {
                    "status": "success",
                    "message": f"Successfully connected and authenticated with SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT} as {settings.SMTP_USER}.",
                    "config": {
                        "smtp_host": settings.SMTP_HOST,
                        "smtp_port": settings.SMTP_PORT,
                        "smtp_user": settings.SMTP_USER,
                        "from_email": settings.EMAILS_FROM_EMAIL
                    }
                }
            except Exception as err:
                return {
                    "status": "error",
                    "message": f"SMTP Connection/Auth Error: {str(err)}",
                    "config": {
                        "smtp_host": settings.SMTP_HOST,
                        "smtp_port": settings.SMTP_PORT,
                        "smtp_user": settings.SMTP_USER,
                        "from_email": settings.EMAILS_FROM_EMAIL
                    }
                }

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _test_connect)

    @classmethod
    async def send_email(
        cls,
        recipient_emails: List[str],
        subject: str,
        body_text: str,
        body_html: Optional[str] = None
    ) -> bool:
        """
        Send an email asynchronously to a list of recipients.
        If SMTP server is not configured or fails, logs gracefully to console/logger.
        """
        get_settings.cache_clear()
        settings = get_settings()

        if not recipient_emails or not settings.EMAIL_NOTIFICATIONS_ENABLED:
            return False

        recipients_clean = [e for e in recipient_emails if e and "@" in e]
        if not recipients_clean:
            return False

        def _send():
            if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
                # Log mock dispatch in development mode when SMTP credentials are not set
                logger.info(f"[MOCK EMAIL DISPATCH] To: {', '.join(recipients_clean)} | Subject: '{subject}'")
                logger.info(f"[MOCK EMAIL BODY]\n{body_text}\n" + "=" * 50)
                return True

            msg = MIMEMultipart("alternative")
            msg["From"] = settings.EMAILS_FROM_EMAIL
            msg["To"] = ", ".join(recipients_clean)
            msg["Subject"] = subject

            msg.attach(MIMEText(body_text, "plain"))
            if body_html:
                msg.attach(MIMEText(body_html, "html"))

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, recipients_clean, msg.as_string())
            return True

        try:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, _send)
        except Exception as err:
            logger.warning(f"[EMAIL SERVICE WARNING] Failed to send email alert: {err}")
            return False

    @classmethod
    async def notify_threat_alert(
        cls,
        recipients: List[str],
        employee_id: str,
        anomaly_category: str,
        severity: str,
        details: str,
        employee_name: str = "Unknown Employee",
        department: str = "General",
        pc_val: str = "N/A",
        explanation: Optional[str] = None
    ):
        """
        Dispatch a high-priority threat alert email for critical/high/medium anomalies
        containing full anomaly detection explanation, employee metrics, and workstation context.
        """
        sev_clean = severity.upper()
        header_color = "#dc2626" if sev_clean == "CRITICAL" else "#ea580c" if sev_clean == "HIGH" else "#d97706"
        badge_bg = "#fee2e2" if sev_clean == "CRITICAL" else "#ffedd5" if sev_clean == "HIGH" else "#fef3c7"
        badge_fg = "#991b1b" if sev_clean == "CRITICAL" else "#c2410c" if sev_clean == "HIGH" else "#b45309"

        subject = f"[ITBIS REALTIME ALERT] {sev_clean} Anomaly Detected - EMP-{employee_id} ({employee_name})"
        
        explanation_text = explanation or details

        body_text = (
            f"ITBIS REALTIME ANOMALY MONITORING ALERT\n"
            f"======================================\n"
            f"Severity Level      : {sev_clean}\n"
            f"Employee ID         : EMP-{employee_id}\n"
            f"Employee Name       : {employee_name}\n"
            f"Department          : {department}\n"
            f"Anomaly Category    : {anomaly_category}\n"
            f"Workstation Host PC : {pc_val}\n\n"
            f"ANOMALY EXPLANATION & CONTEXT:\n"
            f"------------------------------\n"
            f"{explanation_text}\n\n"
            f"INVESTIGATION ACTION REQUIRED:\n"
            f"Open Threat Investigation Portal: http://localhost:8000/investigation\n"
            f"Open UEBA Peer Baseline Analytics: http://localhost:8000/ueba\n"
        )

        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
                .container {{ max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
                .header {{ background-color: {header_color}; color: #ffffff; padding: 24px; text-align: left; }}
                .header h1 {{ margin: 0; font-size: 20px; font-weight: 800; tracking: 0.5px; }}
                .header p {{ margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; }}
                .content {{ padding: 24px; }}
                .badge {{ display: inline-block; padding: 4px 12px; background-color: {badge_bg}; color: {badge_fg}; font-size: 11px; font-weight: 800; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }}
                .info-table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }}
                .info-table td {{ padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }}
                .info-table td.label {{ font-weight: 700; color: #64748b; width: 35%; uppercase; font-size: 11px; }}
                .explanation-box {{ background-color: #f1f5f9; border-left: 4px solid {header_color}; padding: 16px; border-radius: 4px; margin-bottom: 24px; font-size: 13px; line-height: 1.6; color: #0f172a; }}
                .btn-group {{ display: flex; gap: 12px; margin-top: 20px; }}
                .btn {{ text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 700; display: inline-block; text-align: center; }}
                .btn-primary {{ background-color: #4f46e5; color: #ffffff; }}
                .btn-secondary {{ background-color: #0f172a; color: #ffffff; }}
                .footer {{ background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚨 REAL-TIME THREAT MONITORING ALERT</h1>
                    <p>Insider Threat Behavioral Intelligence System (ITBIS)</p>
                </div>
                <div class="content">
                    <span class="badge">SEVERITY: {sev_clean}</span>
                    
                    <h3 style="margin-top: 0; font-size: 15px; color: #0f172a;">Anomaly Pattern: {anomaly_category}</h3>

                    <table class="info-table">
                        <tr>
                            <td class="label">Target Employee</td>
                            <td><strong>{employee_name}</strong> (EMP-{employee_id})</td>
                        </tr>
                        <tr>
                            <td class="label">Department</td>
                            <td>{department}</td>
                        </tr>
                        <tr>
                            <td class="label">Workstation PC</td>
                            <td><code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px;">{pc_val}</code></td>
                        </tr>
                        <tr>
                            <td class="label">Detection Category</td>
                            <td>{anomaly_category}</td>
                        </tr>
                    </table>

                    <h4 style="font-size: 12px; color: #475569; text-transform: uppercase; margin-bottom: 8px;">Technical Anomaly Explanation</h4>
                    <div class="explanation-box">
                        {explanation_text}
                    </div>

                    <div class="btn-group">
                        <a href="http://localhost:8000/investigation?employee_id={employee_id}" class="btn btn-primary">🔍 Open Investigation Case</a>
                        <a href="http://localhost:8000/ueba" class="btn btn-secondary">📈 View UEBA Peer Baseline</a>
                    </div>
                </div>
                <div class="footer">
                    This is an automated real-time alert sent to ITBIS Security Administrators & Managers.
                </div>
            </div>
        </body>
        </html>
        """
        await cls.send_email(recipients, subject, body_text, body_html)

    @classmethod
    async def send_employee_anomaly_report_email(
        cls,
        recipients: List[str],
        employee_id: str,
        employee_name: str,
        department: str,
        risk_score: int,
        risk_category: str,
        anomalies: List[dict]
    ) -> bool:
        """
        Dispatch a full individual employee anomaly detection report email to managers/admins.
        """
        sev_color = "#dc2626" if risk_score >= 85 else "#ea580c" if risk_score >= 60 else "#d97706" if risk_score >= 30 else "#2563eb"
        subject = f"[ITBIS THREAT REPORT] Full Anomaly Report for EMP-{employee_id} ({employee_name}) - Risk: {risk_score} ({risk_category})"

        anomalies_rows_html = ""
        for a in anomalies:
            cat = a.get("category", "General Anomaly")
            sev = a.get("severity", "Medium").upper()
            desc = a.get("description", "")
            ts = a.get("timestamp", "")
            pc = a.get("pc", "N/A")
            bg = "#fee2e2" if sev == "CRITICAL" else "#ffedd5" if sev == "HIGH" else "#fef3c7" if sev == "MEDIUM" else "#dbeafe"
            fg = "#991b1b" if sev == "CRITICAL" else "#c2410c" if sev == "HIGH" else "#b45309" if sev == "MEDIUM" else "#1e40af"

            anomalies_rows_html += f"""
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: bold; color: #0f172a;">{cat}</td>
                <td style="padding: 10px; text-align: center;">
                    <span style="display: inline-block; padding: 3px 8px; background-color: {bg}; color: {fg}; font-size: 10px; font-weight: bold; border-radius: 9999px;">{sev}</span>
                </td>
                <td style="padding: 10px; color: #475569; font-size: 12px;">{desc}</td>
                <td style="padding: 10px; font-family: monospace; font-size: 11px; color: #64748b;">{pc}</td>
                <td style="padding: 10px; font-size: 11px; color: #94a3b8; text-align: right;">{ts}</td>
            </tr>
            """

        body_text = (
            f"ITBIS INDIVIDUAL EMPLOYEE ANOMALY REPORT\n"
            f"=========================================\n"
            f"Employee ID: EMP-{employee_id}\n"
            f"Full Name  : {employee_name}\n"
            f"Department : {department}\n"
            f"Risk Score : {risk_score} / 100 ({risk_category})\n"
            f"Anomalies  : {len(anomalies)} detected\n\n"
            f"ANOMALY DETAILS:\n" +
            "\n".join([f"- [{a.get('severity')}] {a.get('category')}: {a.get('description')} (PC: {a.get('pc')})" for a in anomalies]) +
            f"\n\nReview & Investigate Case: http://localhost:8000/investigation\n"
        )

        body_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
        .container {{ max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
        .header {{ background-color: #0f172a; color: #ffffff; padding: 24px; text-align: left; border-bottom: 4px solid {sev_color}; }}
        .header h1 {{ margin: 0; font-size: 18px; font-weight: 800; tracking: 0.5px; }}
        .header p {{ margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }}
        .content {{ padding: 24px; }}
        .profile-card {{ background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px; }}
        .risk-pill {{ font-size: 18px; font-weight: 800; color: {sev_color}; background-color: #ffffff; padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; float: right; }}
        .table {{ width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }}
        .table th {{ background-color: #f1f5f9; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }}
        .btn {{ display: inline-block; text-decoration: none; padding: 10px 18px; background-color: #4f46e5; color: #ffffff; border-radius: 8px; font-size: 12px; font-weight: 700; margin-top: 20px; }}
        .footer {{ background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📑 INDIVIDUAL EMPLOYEE ANOMALY REPORT</h1>
            <p>Insider Threat Behavioral Intelligence System — Manager Security Summary</p>
        </div>
        <div class="content">
            <div class="profile-card">
                <div class="risk-pill">
                    {risk_score} <span style="font-size: 10px; display: block; color: #64748b;">{risk_category.upper()}</span>
                </div>
                <div>
                    <h2 style="margin: 0; font-size: 16px; color: #0f172a;">{employee_name}</h2>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: #64748b;">EMP ID: <strong>EMP-{employee_id}</strong> &bull; Department: <strong>{department}</strong></p>
                </div>
                <div style="clear: both;"></div>
            </div>

            <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 8px;">Detected Behavioral Anomalies ({len(anomalies)})</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th style="text-align: center;">Severity</th>
                        <th>Explanation</th>
                        <th>Host PC</th>
                        <th style="text-align: right;">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {anomalies_rows_html}
                </tbody>
            </table>

            <a href="http://localhost:8000/investigation?employee_id={employee_id}" class="btn">🔍 Launch Case & Investigate Activity</a>
        </div>
        <div class="footer">
            Sent automatically to Security Managers & Administrators by ITBIS Threat Intelligence Platform.
        </div>
    </div>
</body>
</html>"""
        return await cls.send_email(recipients, subject, body_text, body_html)

