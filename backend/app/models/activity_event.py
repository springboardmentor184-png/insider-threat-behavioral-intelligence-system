from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from datetime import datetime

from app.database import Base


class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id = Column(Integer, primary_key=True, index=True)

    # Raw identifier as it appears in the source log (e.g. CERT username)
    source_user_id = Column(String, nullable=False, index=True)

    # Resolved link to a real employee, once known — nullable until enrichment happens
    employee_id = Column(Integer, ForeignKey("employee_profiles.id"), nullable=True, index=True)

    event_type = Column(String, nullable=False, index=True)  # login, file_download, usb_connect, email_sent, app_usage, etc.

    timestamp = Column(DateTime, nullable=False, index=True)

    source = Column(String, nullable=False, default="live")  # CERT, LANL, CMU, live

    details = Column(JSON, nullable=True)  # anything extra from the row, kept as-is

    ingested_at = Column(DateTime, default=datetime.utcnow)