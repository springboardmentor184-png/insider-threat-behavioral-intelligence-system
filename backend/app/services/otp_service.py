from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.user import User
from app.models.otp import OTPCode

from app.core.security import generate_otp

from app.services.email_service import send_email


from app.services.audit_service import create_audit_log



def create_otp(db: Session, email: str):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return None

    # Mark all previous unused OTPs as used
    db.query(OTPCode).filter(
        OTPCode.user_id == user.id,
        OTPCode.is_used == False
    ).update(
        {"is_used": True}
    )

    db.commit()

    # Generate new OTP
    otp = generate_otp()

    otp_record = OTPCode(
        user_id=user.id,
        otp_code=otp,
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        is_used=False
    )

    db.add(otp_record)
    db.commit()

    # Email content
    subject = "Email Verification OTP"

    body = f"""
Hello,

Your One-Time Password (OTP) for email verification is:

{otp}

This OTP is valid for 5 minutes.

If you did not request this OTP, please ignore this email.

Regards,
Insider Threat Behavioral Intelligence System
"""

    # Send OTP email
    email_sent = send_email(
        receiver_email=email,
        subject=subject,
        body=body
    )

    if not email_sent:
        return False

    # Create Audit Log
    create_audit_log(
        db=db,
        user_id=user.id,
        action="REQUEST_OTP",
        status="SUCCESS",
        description="OTP sent to user's email."
    )

    return True

# def create_otp(db: Session, email: str):

#     user = db.query(User).filter(
#         User.email == email
#     ).first()

#     if not user:
#         return None

#     # Mark all previous unused OTPs as used
#     db.query(OTPCode).filter(
#         OTPCode.user_id == user.id,
#         OTPCode.is_used == False
#     ).update(
#         {"is_used": True}
#     )

#     db.commit()

#     # Generate new OTP
#     otp = generate_otp()

#     otp_record = OTPCode(
#         user_id=user.id,
#         otp_code=otp,
#         expires_at=datetime.utcnow() + timedelta(minutes=5),
#         is_used=False
#     )

#     db.add(otp_record)
#     db.commit()

#     # Email content
#     subject = "Email Verification OTP"

#     body = f"""
# Hello,

# Your One-Time Password (OTP) for email verification is:

# {otp}

# This OTP is valid for 5 minutes.

# If you did not request this OTP, please ignore this email.

# Regards,
# Insider Threat Behavioral Intelligence System
# """

#     # Send OTP email
#     email_sent = send_email(
#         receiver_email=email,
#         subject=subject,
#         body=body
#     )

#     if not email_sent:
#         return False

#     return True


from datetime import datetime

def verify_otp(db: Session, email: str, otp: str):

    print(f"\n===== VERIFY OTP =====")
    print(f"Email: {email}")
    print(f"OTP Entered: {otp}")

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        print("User not found")
        return False

    print(f"User ID: {user.id}")

    otp_record = db.query(OTPCode).filter(
        OTPCode.user_id == user.id,
        OTPCode.otp_code == otp,
        OTPCode.is_used == False
    ).first()

    if not otp_record:
        print("OTP not found")
        return False

    print(f"Database OTP: {otp_record.otp_code}")
    print(f"Expires At: {otp_record.expires_at}")
    print(f"Current Time: {datetime.utcnow()}")

    if otp_record.expires_at < datetime.utcnow():
        print("OTP expired")
        return False

    otp_record.is_used = True
    user.is_verified = True

    db.commit()

    create_audit_log(
    db=db,
    user_id=user.id,
    action="VERIFY_OTP",
    status="SUCCESS",
    description="Email verified successfully."
)

    print("OTP verified successfully")

    return True