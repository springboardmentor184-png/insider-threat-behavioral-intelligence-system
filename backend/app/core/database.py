# backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Format: mysql+pymysql://<username>:<password>@localhost/<database_name>
# REPLACE 'root' and 'your_password' with your actual MySQL credentials
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:1234@localhost/insider_threat_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
