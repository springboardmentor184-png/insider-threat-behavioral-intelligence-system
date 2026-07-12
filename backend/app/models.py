import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="Security Analyst")  # Administrator, Security Analyst, SOC Engineer, Security Manager
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationship to employee profile if linked
    employee_profile = relationship("EmployeeProfile", back_populates="user", uselist=False)

class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False) # e.g. EMP-1001
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False) # e.g. Engineering, Sales, HR, Finance
    designation = Column(String, nullable=False) # e.g. Senior Software Engineer
    manager = Column(String, nullable=True) # Manager's Name or ID
    access_privileges = Column(String, nullable=True) # Comma-separated list (e.g., "SSH_ACCESS,DB_READ,REPO_WRITE")
    status = Column(String, default="Active") # Active, Suspended, Offboarded
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Link back to User (can be null if the employee doesn't have a portal login)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="employee_profile")
    
    # Relationships for associated assets and devices
    devices = relationship("Device", back_populates="employee", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="employee", cascade="all, delete-orphan")

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False)
    device_name = Column(String, nullable=False) # e.g. MacBook Pro, Windows Desktop
    ip_address = Column(String, nullable=False)
    mac_address = Column(String, nullable=True)
    status = Column(String, default="Active") # Active, Inactive
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    employee = relationship("EmployeeProfile", back_populates="devices")

class Asset(Base):
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employee_profiles.employee_id", ondelete="CASCADE"), nullable=False)
    asset_name = Column(String, nullable=False) # e.g. Customer Database, Code Repository
    asset_type = Column(String, nullable=False) # e.g. SQL Database, GitHub Repository, AWS Bucket
    access_level = Column(String, nullable=False, default="Read") # Read, Write, Admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    employee = relationship("EmployeeProfile", back_populates="assets")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_email = Column(String, nullable=False)
    action = Column(String, nullable=False) # e.g. "USER_LOGIN", "EMPLOYEE_ONBOARDED"
    status = Column(String, nullable=False) # e.g. "SUCCESS", "FAILED"
    ip_address = Column(String, nullable=True)
