from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker
from config import *

DATABASE_URL = URL.create(
    drivername="postgresql+psycopg2",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME
)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

def test_connection():
    try:
        with engine.connect() as connection:
            print("✅ Connected to PostgreSQL successfully!")
    except Exception as e:
        print("❌ Connection failed")
        print(e)

if __name__ == "__main__":
    test_connection()