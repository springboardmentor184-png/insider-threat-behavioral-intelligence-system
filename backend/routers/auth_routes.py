import hashlib
import logging
import os
import secrets
import smtplib
import ssl
from datetime import datetime, timedelta
from email.message import EmailMessage
from html import escape

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import PasswordResetToken, User
from schemas import PasswordResetConfirm, PasswordResetRequest, UserCreate, UserLogin, Token
from auth import hash_password, verify_password, create_access_token

router = APIRouter()
logger = logging.getLogger(__name__)


def _reset_link(token: str) -> str:
    """Use the configured public UI URL, falling back to the local frontend."""
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    return f"{frontend_url}/reset-password?token={token}"


def _send_password_reset_email(recipient: str, reset_link: str) -> tuple[bool, str | None]:
    """Send the reset mail using STARTTLS. Never log the token or SMTP secret."""
    config = {
        "SMTP_HOST": os.getenv("SMTP_HOST"),
        "SMTP_PORT": os.getenv("SMTP_PORT"),
        "SMTP_USERNAME": os.getenv("SMTP_USERNAME"),
        "SMTP_PASSWORD": os.getenv("SMTP_PASSWORD"),
        "SMTP_FROM_ADDRESS": os.getenv("SMTP_FROM_ADDRESS"),
    }
    missing = [name for name, value in config.items() if not value]
    if missing:
        logger.error("Password reset email was not sent: missing SMTP configuration (%s)", ", ".join(missing))
        return False, "Email is not configured on this server."
    try:
        port = int(config["SMTP_PORT"])
        if not 1 <= port <= 65535:
            raise ValueError("SMTP_PORT must be between 1 and 65535")
    except (TypeError, ValueError) as exc:
        logger.error("Password reset email was not sent: invalid SMTP_PORT (%s)", exc)
        return False, "Email server configuration is invalid."

    message = EmailMessage()
    message["Subject"] = "Password Reset - Aegis Insider Threat System"
    message["From"] = config["SMTP_FROM_ADDRESS"]
    message["To"] = recipient
    message.set_content(
        "A password reset was requested for your Aegis account. "
        f"Use this link within 30 minutes: {reset_link}"
    )
    message.set_content(f"""\
<!doctype html>
<html><body style="font-family:Arial,sans-serif;color:#14181F;line-height:1.5">
  <h2 style="color:#3E5C8A">Aegis password reset</h2>
  <p>A password reset was requested for your Aegis Insider Threat System account.</p>
  <p><a href="{escape(reset_link, quote=True)}" style="display:inline-block;background:#3E5C8A;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none">Reset password</a></p>
  <p>Or copy this link into your browser:<br><a href="{escape(reset_link, quote=True)}">{escape(reset_link)}</a></p>
  <p>This link expires in 30 minutes. If you did not request a password reset, you can ignore this email.</p>
</body></html>""", subtype="html")
    try:
        with smtplib.SMTP(config["SMTP_HOST"], port, timeout=15) as server:
            server.ehlo()
            server.starttls(context=ssl.create_default_context())
            server.ehlo()
            server.login(config["SMTP_USERNAME"], config["SMTP_PASSWORD"])
            server.send_message(message)
        return True, None
    except (OSError, smtplib.SMTPException) as exc:
        logger.error("Password reset email delivery failed for account %s: %s", recipient, exc)
        return False, "The email could not be sent."


@router.post("/register", status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "user_id": new_user.id}


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": user.email, "role": user.role})

    return {"access_token": access_token, "token_type": "bearer", "role": user.role}


@router.post("/password-reset/request")
def request_password_reset(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Create a one-time token and email it; expose it only after delivery failure."""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Do not disclose whether an address is registered.
        return {"message": "If the account exists, a password reset link has been emailed.", "email_sent": True}

    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None)
    ).update({PasswordResetToken.used_at: datetime.utcnow()}, synchronize_session=False)
    raw_token = secrets.token_urlsafe(32)
    db.add(PasswordResetToken(
        user_id=user.id,
        token_hash=hashlib.sha256(raw_token.encode()).hexdigest(),
        expires_at=datetime.utcnow() + timedelta(minutes=30),
    ))
    db.commit()
    reset_link = _reset_link(raw_token)
    email_sent, delivery_error = _send_password_reset_email(user.email, reset_link)
    if email_sent:
        return {"message": "If the account exists, a password reset link has been emailed.", "email_sent": True}
    return {
        "message": "Email delivery failed. Use the local fallback reset link below.",
        "email_sent": False,
        "delivery_error": delivery_error,
        "reset_token": raw_token,
        "reset_link": reset_link,
        "expires_in_minutes": 30,
    }


@router.post("/password-reset/confirm")
def confirm_password_reset(request: PasswordResetConfirm, db: Session = Depends(get_db)):
    if len(request.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    reset = db.query(PasswordResetToken).filter(
        PasswordResetToken.token_hash == token_hash,
        PasswordResetToken.used_at.is_(None),
    ).first()
    if not reset or reset.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This reset token is invalid or has expired")
    reset.user.password_hash = hash_password(request.password)
    reset.used_at = datetime.utcnow()
    db.commit()
    return {"message": "Password reset successfully. You can now sign in."}
