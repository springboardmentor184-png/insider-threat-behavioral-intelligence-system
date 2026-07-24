from app.database.database import engine
from app.database.database import Base
from app.models import models

print("Deleting old tables...")

Base.metadata.drop_all(bind=engine)

print("Creating new tables...")

Base.metadata.create_all(bind=engine)

print("Database reset completed ✅")