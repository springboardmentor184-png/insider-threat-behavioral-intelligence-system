from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from database.db import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    activity_type = Column(String, nullable=False)   # login, file_download, file_upload, usb_connect, email_sent...
    resource = Column(String, nullable=True)          # file name, app name, endpoint, etc.
    ip_address = Column(String, nullable=True)
    device = Column(String, nullable=True)
    data_volume_mb = Column(Float, default=0.0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_flagged = Column(Integer, default=0)           # will be set by anomaly engine in Milestone 2