from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime

class ThreatNotification(Base):

    __tablename__ = "threat_notifications"

    notification_id = Column(Integer, primary_key=True)

    employee_name = Column(String)

    risk_score = Column(Integer)

    risk_level = Column(String)

    message = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)