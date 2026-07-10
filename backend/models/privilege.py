from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class AccessPrivilege(Base):

    __tablename__ = "access_privileges"

    privilege_id = Column(Integer, primary_key=True, autoincrement=True)

    employee_id = Column(
        Integer,
        ForeignKey("employee_profiles.employee_id"),
        nullable=False
    )

    resource_name = Column(String(100), nullable=False)

    permission = Column(String(50), nullable=False)