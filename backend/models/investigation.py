from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime


class Investigation(Base):

    __tablename__ = "investigations"

    investigation_id = Column(Integer, primary_key=True)

    employee_name = Column(String(100))

    risk_score = Column(Integer)

    priority = Column(String(20))

    status = Column(String(20), default="Open")

    assigned_to = Column(String(100))

    description = Column(String(500))

    created_at = Column(DateTime, default=datetime.utcnow)