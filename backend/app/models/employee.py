from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class EmployeeProfile(Base):
    __tablename__ = "employee_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    employee_id = Column(String, unique=True, nullable=False)

    #department = Column(String, nullable=False)

    department_id = Column(
        Integer,
        ForeignKey("departments.id")
    )

    designation = Column(String, nullable=False)

    manager = Column(String)

    device_information = Column(String)

    access_privileges = Column(String)

    user = relationship("User")

    department = relationship("Department")