import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest

print("Loading engineered features...")

df = pd.read_csv("ml/datasets/features.csv")

print(df.head())

print("\nTraining Isolation Forest...")

model = IsolationForest(

    n_estimators=100,

    contamination=0.02,

    random_state=42

)

model.fit(df)

print("Training completed!")

joblib.dump(

    model,

    "ml/trained_models/isolation_forest.pkl"

)

print("\nModel saved successfully!")