from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from app.core.database import Base


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    otp_code = Column(String(6), nullable=False)

    expires_at = Column(DateTime, nullable=False)

    is_used = Column(Boolean, default=False)

    created_at = Column(DateTime)