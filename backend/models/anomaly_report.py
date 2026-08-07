from sqlalchemy import Column, Integer, String, DateTime
from database import Base
from datetime import datetime


class AnomalyReport(Base):

    __tablename__ = "anomaly_reports"

    report_id = Column(Integer, primary_key=True, autoincrement=True)

    employee_name = Column(String(100), nullable=False)

    prediction = Column(String(20), nullable=False)

    risk_level = Column(String(20), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)