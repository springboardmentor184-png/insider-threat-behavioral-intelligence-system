from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class Device(Base):

    __tablename__ = "devices"

    device_id = Column(Integer, primary_key=True, autoincrement=True)

    employee_id = Column(
        Integer,
        ForeignKey("employee_profiles.employee_id")
    )

    device_name = Column(String(100))

    operating_system = Column(String(100))

    serial_number = Column(String(100))

    status = Column(String(50))