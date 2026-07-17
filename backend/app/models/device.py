from sqlalchemy import Column, Integer, String, ForeignKey

from app.database import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employee_profiles.id"),
        nullable=False
    )

    device_name = Column(String, nullable=False)

    device_type = Column(String, nullable=False)

    serial_number = Column(String, unique=True)

    operating_system = Column(String)

    status = Column(String, default="Active")