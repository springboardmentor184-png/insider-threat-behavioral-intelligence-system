from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from app.database.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(Integer, ForeignKey("employees.id"))

    activity_type = Column(String, nullable=False)

    ip_address = Column(String)

    device = Column(String)

    timestamp = Column(DateTime, default=datetime.utcnow)