from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import all models here so Alembic can discover them
import app.models.department
import app.models.role
import app.models.employee
import app.models.activity
import app.models.risk
