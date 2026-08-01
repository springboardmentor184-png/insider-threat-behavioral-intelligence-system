from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    severity = Column(String, nullable=False) # Informational, Low, Medium, High, Critical
    status = Column(String, default="Open") # Open, Investigating, Resolved, False Positive
    category = Column(String, nullable=False) # Unusual Login Time, Abnormal Data Download, etc.
    timestamp = Column(DateTime, default=datetime.utcnow, server_default=func.now())
    assigned_to = Column(String, nullable=True)
    resolution_notes = Column(String, nullable=True)
