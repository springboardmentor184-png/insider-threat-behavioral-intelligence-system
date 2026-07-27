import joblib
import pandas as pd

# Load trained model
model = joblib.load("app/ml/isolation_forest.pkl")


def predict_behavior(data: dict):

    print("\n========== AI REQUEST ==========")
    print(data)
    print("================================")

    # -------------------------------
    # Business Rule Based Detection
    # -------------------------------

    risk_flags = 0

    # Excessive failed login attempts
    if data["avg_failed_logins"] >= 8:
        risk_flags += 1

    # Large number of downloaded files
    if data["avg_files_downloaded"] >= 400:
        risk_flags += 1

    # Unusually high email activity
    if data["avg_emails_sent"] >= 80:
        risk_flags += 1

    # Frequent USB device usage
    if data["usb_usage_rate"] >= 80:
        risk_flags += 1

    # Frequent after-hours activity
    if data["after_hours_rate"] >= 80:
        risk_flags += 1

    print(f"Risk Flags Detected: {risk_flags}")

    # If two or more suspicious behaviours exist,
    # classify immediately as High Risk.
    if risk_flags >= 2:
        print("✅ Business Rule Triggered")

        return {
            "prediction": "Anomaly",
            "risk": "High"
        }

    # -------------------------------
    # Machine Learning Prediction
    # -------------------------------

    print("🤖 Isolation Forest Prediction")

    df = pd.DataFrame([data])

    prediction = model.predict(df)

    if prediction[0] == -1:
        print("⚠ Isolation Forest detected anomaly")

        return {
            "prediction": "Anomaly",
            "risk": "High"
        }

    print("✔ Behaviour is normal")

    return {
        "prediction": "Normal",
        "risk": "Low"
    }