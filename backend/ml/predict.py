import pandas as pd
import joblib

# Load trained model
model = joblib.load(
    "ml/trained_models/isolation_forest.pkl"
)

# Load sample behavioral data
df = pd.read_csv("ml/datasets/features.csv")

# Take first 10 records
sample = df.head(10)

# Predict anomalies
predictions = model.predict(sample)

# Convert prediction labels
# 1 = Normal, -1 = Anomaly
results = []

for pred in predictions:

    if pred == 1:
        results.append("Normal")
    else:
        results.append("Anomaly")

# Display results
sample["Prediction"] = results

print("\nAnomaly Detection Results\n")

print(sample)