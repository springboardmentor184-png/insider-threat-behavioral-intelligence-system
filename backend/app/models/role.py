import uuid
from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base
from app.database.types import GUID

class Role(Base):
    """
    Role model representing employee access and permissions (RBAC).
    Stores granular permissions in a structured JSONB format for dynamic enterprise security policies.
    """
    __tablename__ = "roles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    role_name = Column(String(100), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    employees = relationship("Employee", back_populates="role", lazy="select")
