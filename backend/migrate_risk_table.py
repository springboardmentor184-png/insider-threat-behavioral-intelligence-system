import sqlite3
import os

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "dev.db"))

def migrate():
    print(f"Connecting to SQLite database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get existing columns in risk_assessments
    cursor.execute("PRAGMA table_info(risk_assessments);")
    existing_cols = {row[1] for row in cursor.fetchall()}
    print("Existing columns in risk_assessments:", existing_cols)

    cols_to_add = [
        ("anomaly_score", "REAL DEFAULT 0.0"),
        ("privilege_score", "REAL DEFAULT 0.0"),
        ("data_access_score", "REAL DEFAULT 0.0"),
        ("access_pattern_score", "REAL DEFAULT 0.0"),
        ("history_score", "REAL DEFAULT 0.0"),
        ("confidence_score", "REAL DEFAULT 1.0"),
        ("reasons", "TEXT"),
        ("triggering_events", "TEXT"),
        ("recommendation", "TEXT"),
        ("risk_trend", "VARCHAR(50) DEFAULT 'STABLE'"),
    ]

    for col_name, col_type in cols_to_add:
        if col_name not in existing_cols:
            alter_stmt = f"ALTER TABLE risk_assessments ADD COLUMN {col_name} {col_type};"
            print(f"Executing: {alter_stmt}")
            cursor.execute(alter_stmt)

    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
