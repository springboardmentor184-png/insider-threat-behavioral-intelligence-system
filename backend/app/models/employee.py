from sqlalchemy import Column, Integer, String, Boolean

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        String,
        unique=True,
        nullable=False
    )

    full_name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    department = Column(
        String,
        nullable=False
    )

    designation = Column(
        String,
        nullable=False
    )

    manager = Column(
        String,
        nullable=True
    )

    risk_score = Column(
        Integer,
        default=0
    )

    is_active = Column(
        Boolean,
        default=True
    )