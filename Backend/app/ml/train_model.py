import joblib
import pandas as pd

from sklearn.ensemble import IsolationForest

from sqlalchemy import create_engine

# PostgreSQL connection
DATABASE_URL = "postgresql://postgres:123456789@localhost/insider_threat_db"

engine = create_engine(DATABASE_URL)

# Read baseline data
query = """
SELECT
avg_failed_logins,
avg_files_downloaded,
avg_emails_sent,
avg_login_hour,
usb_usage_rate,
after_hours_rate
FROM behavior_baselines
"""

df = pd.read_sql(query, engine)

# Train Isolation Forest
model = IsolationForest(
    contamination=0.05,
    random_state=42
)

model.fit(df)

# Save model
joblib.dump(model, "app/ml/isolation_forest.pkl")

print("Model trained successfully!")