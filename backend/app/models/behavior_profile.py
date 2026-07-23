import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.database.types import GUID


class BehaviorProfile(Base):
    """
    Stores the normal behavioural baseline of an employee.
    Generated from ActivityLog records and used for anomaly detection.
    """

    __tablename__ = "behavior_profiles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)

    employee_id = Column(
        GUID(),
        ForeignKey("employees.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    avg_login_hour = Column(Float, nullable=True)
    preferred_device = Column(String(150), nullable=True)
    preferred_browser = Column(String(100), nullable=True)
    preferred_operating_system = Column(String(100), nullable=True)
    avg_daily_activities = Column(Integer, nullable=True)

    profile_score = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    employee = relationship(
        "Employee",
        back_populates="behavior_profile",
    )