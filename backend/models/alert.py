from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import Base
from datetime import datetime


class Alert(Base):

    __tablename__ = "alerts"

    alert_id = Column(Integer, primary_key=True, autoincrement=True)

    employee_id = Column(
        Integer,
        ForeignKey("employee_profiles.employee_id"),
        nullable=False
    )

    alert_type = Column(String(100))

    severity = Column(String(50))

    status = Column(String(50), default="Open")

    created_at = Column(DateTime, default=datetime.utcnow)