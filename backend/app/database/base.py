from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import all models here so Base.metadata.create_all and Alembic discover them
import app.models.department
import app.models.role
import app.models.employee
import app.models.activity
import app.models.risk
import app.models.behavior_profile
import app.models.ueba
import app.models.investigation
import app.models.incident
