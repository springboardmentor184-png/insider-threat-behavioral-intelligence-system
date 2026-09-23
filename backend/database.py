import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1209@localhost:5432/insider_threat_db")

# PostgreSQL is the configured application database. SQLite-specific handling
# below remains only for compatibility with older local demo files.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_employee_profile_schema():
    """Upgrade the early console-profile table without requiring a reset.

    The original project created employee_profiles around console users.  The
    employee directory now keys profiles to CERT employee IDs, so SQLite needs
    a small table rebuild to make the legacy user_id optional.
    """
    inspector = inspect(engine)
    if "employee_profiles" not in inspector.get_table_names():
        return
    # Recover cleanly if a previous SQLite process stopped after the replacement
    # table was created but before its legacy rows were copied.
    if engine.dialect.name == "sqlite" and "employee_profiles_legacy" in inspector.get_table_names():
        legacy_columns = {column["name"] for column in inspector.get_columns("employee_profiles_legacy")}
        copy_columns = [name for name in ("id", "user_id", "designation", "department", "join_date", "device_ids") if name in legacy_columns]
        with engine.begin() as connection:
            if copy_columns:
                names = ", ".join(copy_columns)
                connection.execute(text(f"INSERT OR IGNORE INTO employee_profiles ({names}) SELECT {names} FROM employee_profiles_legacy"))
            connection.execute(text("DROP TABLE employee_profiles_legacy"))
        inspector = inspect(engine)
    columns = {column["name"]: column for column in inspector.get_columns("employee_profiles")}
    required = {"employee_id", "manager", "device_information", "access_privileges"}
    needs_rebuild = engine.dialect.name == "sqlite" and not columns.get("user_id", {}).get("nullable", True)
    if needs_rebuild:
        legacy_columns = [name for name in ("id", "user_id", "designation", "department", "join_date", "device_ids") if name in columns]
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE employee_profiles RENAME TO employee_profiles_legacy"))
            # SQLite keeps index names globally unique when a table is renamed.
            # Drop the legacy indexes before SQLAlchemy creates the replacement.
            connection.execute(text("DROP INDEX IF EXISTS ix_employee_profiles_id"))
            connection.execute(text("DROP INDEX IF EXISTS ix_employee_profiles_user_id"))
            Base.metadata.tables["employee_profiles"].create(bind=connection)
            if legacy_columns:
                names = ", ".join(legacy_columns)
                connection.execute(text(f"INSERT INTO employee_profiles ({names}) SELECT {names} FROM employee_profiles_legacy"))
            connection.execute(text("DROP TABLE employee_profiles_legacy"))
        return
    with engine.begin() as connection:
        for name in required - set(columns):
            connection.execute(text(f"ALTER TABLE employee_profiles ADD COLUMN {name} VARCHAR"))
        if engine.dialect.name != "sqlite" and not columns.get("user_id", {}).get("nullable", True):
            connection.execute(text("ALTER TABLE employee_profiles ALTER COLUMN user_id DROP NOT NULL"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
