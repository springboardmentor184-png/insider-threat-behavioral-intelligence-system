from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import Base
from datetime import datetime


class ActivityLog(Base):

    __tablename__ = "activity_logs"

    log_id = Column(Integer, primary_key=True, autoincrement=True)

    employee_id = Column(
        Integer,
        ForeignKey("employee_profiles.employee_id"),
        nullable=False
    )

    activity_type = Column(String(100), nullable=False)

    source = Column(String(100))

    destination = Column(String(255))

    device = Column(String(100))

    size = Column(Integer)

    attachments = Column(Integer)

    description = Column(String(500))

    timestamp = Column(DateTime, nullable=False)

    risk_level = Column(String(20), default="Normal")