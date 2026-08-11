from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from database.db import Base

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    severity = Column(String, default="Medium")      # Low, Medium, High, Critical
    status = Column(String, default="open")           # open, in_review, closed
    summary = Column(Text, nullable=True)
    linked_log_ids = Column(Text, default="")          # comma-separated ActivityLog ids (the timeline)
    created_at = Column(DateTime(timezone=True), server_default=func.now())