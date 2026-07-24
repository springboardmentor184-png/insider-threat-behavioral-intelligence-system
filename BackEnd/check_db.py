from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = (
    f"postgresql://{os.getenv('DB_USER')}:"
    f"{os.getenv('DB_PASSWORD')}@"
    f"{os.getenv('DB_HOST')}:"
    f"{os.getenv('DB_PORT')}/"
    f"{os.getenv('DB_NAME')}"
)

engine = create_engine(DATABASE_URL)


with engine.connect() as conn:

    tables = [
        "login_activity",
        "file_access",
        "device_activity",
        "email_activity"
    ]

    for table in tables:
        result = conn.execute(
            text(f"SELECT COUNT(*) FROM {table};")
        )

        count = result.fetchone()[0]

        print(
            f"{table}: {count} records"
        )