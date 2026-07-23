from database import Base, engine

from models.user import User
from models.employee import EmployeeProfile
from models.department import Department
from models.device import Device
from models.alert import Alert
from models.activity_log import ActivityLog
from models.privilege import AccessPrivilege
from models.risk_score import RiskScore

Base.metadata.create_all(bind=engine)

print("✅ All database tables created successfully!")