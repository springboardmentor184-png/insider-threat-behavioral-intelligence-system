import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load configuration parameters
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
try:
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
except ValueError:
    SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

def send_real_email(to_email: str, subject: str, body: str) -> bool:
    """
    Sends a real email using SMTP (e.g. Gmail with TLS).
    Reads credentials from the backend .env configuration.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[SMTP Warning] SMTP_USER or SMTP_PASSWORD not set in .env. "
              f"Cannot send email to <{to_email}>. Logging details instead:")
        print(f"--- MOCK EMAIL TO: {to_email} ---")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}")
        print("---------------------------------")
        return False

    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain', 'utf-8'))

        # Connect to server
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        
        # Send
        server.sendmail(SMTP_USER, to_email, msg.as_string())
        server.quit()
        print(f"[SMTP Success] Real email successfully sent to <{to_email}>.")
        return True
    except Exception as e:
        print(f"[SMTP Failure] Failed to send real email to <{to_email}>: {e}")
        return False
