from sqlalchemy import Column, Integer, String, ForeignKey, Date
from database import Base


class EmployeeProfile(Base):

    __tablename__ = "employee_profiles"

    employee_id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    department = Column(String(100), nullable=False)

    designation = Column(String(100), nullable=False)

    manager = Column(String(100))

    joining_date = Column(Date)

    phone = Column(String(20))

    status = Column(String(30), default="Active")