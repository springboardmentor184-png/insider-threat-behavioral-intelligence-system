from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.db import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    manager_name = Column(String, nullable=True)
    device_id = Column(String, nullable=True)
    access_level = Column(String, default="standard")   # standard, elevated, privileged
    risk_score = Column(Integer, default=0)              # 0-100, updated by risk engine later
    created_at = Column(DateTime(timezone=True), server_default=func.now())