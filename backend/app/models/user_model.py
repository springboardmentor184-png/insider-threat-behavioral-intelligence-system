from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # This will link to the 4 roles: Security Analyst, SOC Engineer, Security Manager, Admin
    role = Column(String, default="Security Analyst") 
    
    # Flag to check if they have completed OTP verification
    is_active = Column(Boolean, default=False)