import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.base import Base

class Employee(Base):
    """
    Employee model representing users in the enterprise platform.
    Core identity model supporting soft-deletes, password expiry tracking, and failed login locks.
    """
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True, index=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=True, index=True)
    
    job_title = Column(String(100), nullable=True)
    manager_name = Column(String(150), nullable=True)
    status = Column(String(50), nullable=False, default="Active")
    date_joined = Column(DateTime(timezone=True), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    password_hash = Column(String(255), nullable=False)
    
    # Enterprise Security Fields
    is_active = Column(Boolean, nullable=False, default=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, nullable=False, default=0)
    last_password_change = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    department = relationship("Department", back_populates="employees", lazy="select")
    role = relationship("Role", back_populates="employees", lazy="select")
    activities = relationship("ActivityLog", back_populates="employee", cascade="all, delete-orphan", lazy="select")
    risk_assessments = relationship("RiskAssessment", back_populates="employee", cascade="all, delete-orphan", lazy="select")
