from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database.db import Base
import enum

class RoleEnum(str, enum.Enum):
    security_analyst = "security_analyst"
    soc_engineer = "soc_engineer"
    security_manager = "security_manager"
    administrator = "administrator"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default=RoleEnum.security_analyst.value)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())