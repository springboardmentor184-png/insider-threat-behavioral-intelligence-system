import pandas as pd
import joblib
from database import SessionLocal
from models.employee import EmployeeProfile
from models.user import User

# Load email dataset
dataset = pd.read_csv(
    "ml/datasets/email.csv",
    usecols=[
        "user",
        "date",
        "size",
        "attachments",
        "content"
    ],
    nrows=100000
)

# Load trained Isolation Forest model
model = joblib.load("ml/trained_models/isolation_forest.pkl")


def predict_activity(employee_name):

    db = SessionLocal()

    employee = (
        db.query(EmployeeProfile)
        .join(User)
        .filter(User.name == employee_name)
        .first()
    )

    if employee is None:
        db.close()
        raise Exception("Employee not found.")

    dataset_user = employee.dataset_user

    db.close()

    if dataset_user is None:
        raise Exception("Dataset user not assigned.")

    employee_data = dataset[
        dataset["user"] == dataset_user
    ]

    if employee_data.empty:
        raise Exception("No email records found for employee.")

    # ---------------------------------------
    # Behavioural Baseline (Last 20 Emails)
    # ---------------------------------------

    baseline = employee_data.tail(20)

    baseline_email_size = baseline["size"].mean()

    baseline_attachment_count = baseline["attachments"].mean()

    baseline_content_length = (
        baseline["content"]
        .astype(str)
        .apply(len)
        .mean()
    )

    baseline_hour = (
        pd.to_datetime(baseline["date"])
        .dt.hour
        .mean()
    )

    baseline_day = (
        pd.to_datetime(baseline["date"])
        .dt.dayofweek
        .mode()[0]
    )

    # ---------------------------------------
    # Current Behaviour (Last 5 Emails)
    # ---------------------------------------

    latest = employee_data.tail(5)

    current_email_size = round(
        latest["size"].mean(), 2
    )

    current_attachment_count = round(
        latest["attachments"].mean(), 2
    )

    current_content_length = round(
        latest["content"]
        .astype(str)
        .apply(len)
        .mean(),
        2
    )

    current_hour = round(
        pd.to_datetime(latest["date"])
        .dt.hour
        .mean(),
        2
    )

    current_day = int(
        pd.to_datetime(latest["date"])
        .dt.dayofweek
        .mode()[0]
    )

    # ---------------------------------------
    # Predict EACH of the last 5 emails
    # ---------------------------------------

    anomaly_count = 0

    for _, row in latest.iterrows():

        features = pd.DataFrame([{

            "email_size": row["size"],
            "attachment_count": row["attachments"],
            "hour": pd.to_datetime(row["date"]).hour,
            "day_of_week": pd.to_datetime(row["date"]).dayofweek,
            "content_length": len(str(row["content"]))

        }])

        prediction = model.predict(features)[0]

        if prediction == -1:
            anomaly_count += 1

    if anomaly_count == 0:
        prediction_text = "Normal"

    elif anomaly_count == 1:
        prediction_text = "Suspicious"

    else:
        prediction_text = "Anomaly"

    # ---------------------------------------
    # Return Behaviour Profile
    # ---------------------------------------

    return {

        "prediction": prediction_text,

        "anomaly_count": anomaly_count,

        "baseline": {

            "email_size": round(float(baseline_email_size), 2),

            "attachment_count": round(float(baseline_attachment_count), 2),

            "content_length": round(float(baseline_content_length), 2),

            "hour": round(float(baseline_hour), 2),

            "day_of_week": int(baseline_day)

        },

        "current": {

            "email_size": round(float(current_email_size), 2),

            "attachment_count": round(float(current_attachment_count), 2),

            "content_length": round(float(current_content_length), 2),

            "hour": round(float(current_hour), 2),

            "day_of_week": int(current_day)

        }

    }