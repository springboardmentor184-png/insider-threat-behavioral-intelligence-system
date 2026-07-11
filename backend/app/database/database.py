from app.database.base import Base
from app.database.session import engine

# Note: In a real app with Alembic, we don't usually call create_all() here.
# It's kept for reference or simple initialization if needed.
# Base.metadata.create_all(bind=engine)
