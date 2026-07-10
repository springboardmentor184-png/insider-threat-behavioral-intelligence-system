from sqlalchemy import Column, Integer, String
from database import Base


class Department(Base):

    __tablename__ = "departments"

    department_id = Column(Integer, primary_key=True, autoincrement=True)

    department_name = Column(String(100), unique=True)

    department_head = Column(String(100))