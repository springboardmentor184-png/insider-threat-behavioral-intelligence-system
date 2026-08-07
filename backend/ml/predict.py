import pandas as pd
import joblib

# Load the trained model only once when Flask starts
model = joblib.load("ml/trained_models/isolation_forest.pkl")


def predict_activity(
    email_size,
    attachments,
    hour,
    day_of_week,
    content_length
):
    """
    Predict whether an employee activity is Normal or Anomaly.
    """

    data = pd.DataFrame([{
        "email_size": email_size,
        "attachments": attachments,
        "hour": hour,
        "day_of_week": day_of_week,
        "content_length": content_length
    }])

    prediction = model.predict(data)[0]

    if prediction == 1:
        return "Normal"

    return "Anomaly"