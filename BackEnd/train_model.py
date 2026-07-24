import pandas as pd
import joblib
import os
from sklearn.ensemble import IsolationForest

# Create synthetic training data
data = {
    "failed_logins": [0, 1, 0, 2, 5, 7, 0, 1, 8, 10],
    "file_reads": [2, 3, 1, 5, 15, 20, 2, 3, 25, 30],
    "file_writes": [1, 1, 0, 2, 8, 10, 1, 2, 12, 15],
    "file_deletes": [0, 0, 0, 1, 2, 3, 0, 0, 4, 5]
}

df = pd.DataFrame(data)

# Train Isolation Forest
model = IsolationForest(
    contamination=0.2,
    random_state=42
)

model.fit(df)

# Create folder if it doesn't exist
os.makedirs("trained_models", exist_ok=True)

# Save model
joblib.dump(model, "trained_models/isolation_forest.pkl")

print("Model trained successfully!")