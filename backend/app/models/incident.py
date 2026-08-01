from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    severity = Column(String, nullable=False) # Low, Medium, High, Critical
    status = Column(String, default="Open") # Open, Investigating, Closed
    employee_id = Column(String, nullable=False)
    assigned_to = Column(String, nullable=True)
    timeline = Column(Text, nullable=True) # JSON array of event/timeline objects
    evidence = Column(Text, nullable=True) # JSON array of evidence objects (comments, attachments)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
