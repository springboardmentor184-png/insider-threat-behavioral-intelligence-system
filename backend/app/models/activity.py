from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class Activity(Base):

    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)

    activity_name = Column(String, nullable=False)

    performed_by = Column(String, nullable=False)

    status = Column(String, nullable=False)

    description = Column(String)

    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )