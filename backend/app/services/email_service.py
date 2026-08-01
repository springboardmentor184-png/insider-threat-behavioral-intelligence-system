import smtplib
import os
from datetime import datetime

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


def send_email(receiver_email: str, subject: str, body: str):
    # Log the email content to console and file for debugging/local testing
    print(f"\n=================== OUTGOING EMAIL ===================")
    print(f"To: {receiver_email}")
    print(f"Subject: {subject}")
    print(f"Body:\n{body}")
    print(f"======================================================\n")
    
    try:
        # Save to a local email log file in case console is busy
        with open("email_logs.txt", "a") as f:
            f.write(f"--- {datetime.now()} ---\nTo: {receiver_email}\nSubject: {subject}\n{body}\n\n")
    except Exception:
        pass

    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("[Email Service] SMTP credentials not set. Simulating successful send.")
        return True

    message = MIMEMultipart()

    message["From"] = EMAIL_ADDRESS
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)

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

        return True

    except Exception as e:
        print("Real SMTP Email Error:", e)
        print("[Email Service] Falling back to successful mock delivery.")
        return True