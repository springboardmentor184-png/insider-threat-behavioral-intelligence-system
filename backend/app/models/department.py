import uuid
from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base
from app.database.types import GUID

class Department(Base):
    """
    Department model representing organization units.
    Used for grouping employees and applying department-level security policies.
    """
    __tablename__ = "departments"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    department_name = Column(String(100), nullable=False, unique=True, index=True)
    department_code = Column(String(50), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    employees = relationship("Employee", back_populates="department", lazy="select")
