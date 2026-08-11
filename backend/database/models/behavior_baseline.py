from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.db import Base

class BehaviorBaseline(Base):
    __tablename__ = "behavior_baselines"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)

    avg_data_volume_mb = Column(Float, default=0.0)
    std_data_volume_mb = Column(Float, default=0.0)
    typical_start_hour = Column(Integer, default=9)
    typical_end_hour = Column(Integer, default=18)
    common_devices = Column(String, default="")
    total_events_seen = Column(Integer, default=0)

    last_computed_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())