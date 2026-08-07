"""Best-effort SMTP delivery for critical security notifications."""
import smtplib
from email.message import EmailMessage

from config import config_instance
from models import Employee, Role, User
from utils.logger import get_logger

logger = get_logger()


class EmailNotificationService:
    @staticmethod
    def _admin_recipients():
        recipients = {
            address.strip().lower()
            for address in config_instance.ADMIN_ALERT_EMAILS.split(',')
            if address.strip()
        }
        admin_emails = (
            Employee.query.join(User, User.employee_id == Employee.id)
            .join(Role, User.role_id == Role.id)
            .filter(Role.role_name.in_(['ADMINISTRATOR', 'ADMIN']))
            .with_entities(Employee.email)
            .all()
        )
        recipients.update(email.lower() for (email,) in admin_emails if email)
        return sorted(recipients)

    @staticmethod
    def send_critical_threat_alert(alert):
        """Send administrators a critical-threat email containing the risk score."""
        if not config_instance.SMTP_ENABLED:
            logger.info('Critical-threat email skipped because SMTP_ENABLED is false.')
            return False
        if not config_instance.SMTP_HOST or not config_instance.SMTP_FROM_EMAIL:
            logger.error('Critical-threat email skipped: SMTP_HOST and SMTP_FROM_EMAIL are required.')
            return False

        recipients = EmailNotificationService._admin_recipients()
        if not recipients:
            logger.error('Critical-threat email skipped: no administrator recipients found.')
            return False

        score = float(alert.risk_score or 0)
        message = EmailMessage()
        message['Subject'] = f'[CRITICAL THREAT] {alert.employee_code} — risk score {score:.1f}/100'
        message['From'] = config_instance.SMTP_FROM_EMAIL
        message['To'] = ', '.join(recipients)
        message.set_content(
            'A critical insider-threat alert has been raised.\n\n'
            f'Employee: {alert.employee_code}\n'
            f'Threat type: {alert.threat_type}\n'
            f'Severity: {alert.severity}\n'
            f'Threat score: {score:.1f}/100\n'
            f'Description: {alert.description or "No description provided."}\n'
            f'Detected at (UTC): {alert.timestamp.isoformat() if alert.timestamp else "Unknown"}\n'
        )
        try:
            with smtplib.SMTP(config_instance.SMTP_HOST, config_instance.SMTP_PORT, timeout=15) as smtp:
                if config_instance.SMTP_USE_TLS:
                    smtp.starttls()
                if config_instance.SMTP_USERNAME:
                    smtp.login(config_instance.SMTP_USERNAME, config_instance.SMTP_PASSWORD or '')
                smtp.send_message(message)
            logger.warning('Critical-threat email delivered for alert %s.', alert.id)
            return True
        except (OSError, smtplib.SMTPException) as error:
            logger.error('Unable to send critical-threat email for alert %s: %s', alert.id, error)
            return False
