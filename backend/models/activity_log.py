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

    description = Column(String(255))

    timestamp = Column(DateTime, default=datetime.utcnow)