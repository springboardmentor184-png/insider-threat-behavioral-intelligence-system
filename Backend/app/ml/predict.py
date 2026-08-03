import joblib
import pandas as pd

from app.services.rule_engine import evaluate_rules
from app.services.risk_scoring import calculate_risk_score
from app.services.risk_analysis import generate_risk_analysis

# Load trained model
model = joblib.load("app/ml/isolation_forest.pkl")


def predict_behavior(data: dict):

    print("\n========== AI REQUEST ==========")
    print(data)
    print("================================")

    # ----------------------------------
    # Step 1: Evaluate Business Rules
    # ----------------------------------
    rule_result = evaluate_rules(data)

    # ----------------------------------
    # Step 2: ML Prediction
    # ----------------------------------
    ml_prediction = "Normal"
    detection_method = "Isolation Forest"

    if rule_result["triggered"]:

        print("✅ Business Rule Triggered")

        ml_prediction = "Anomaly"
        detection_method = "Hybrid Rule Engine"

    else:

        print("🤖 Isolation Forest Prediction")

        df = pd.DataFrame([data])
        prediction = model.predict(df)

        if prediction[0] == -1:

            print("⚠ Isolation Forest detected anomaly")

            ml_prediction = "Anomaly"

        else:

            print("✔ Behaviour is normal")

    # ----------------------------------
    # Step 3: Weighted Risk Score
    # ----------------------------------
    risk_result = calculate_risk_score(
        rule_result["category_scores"],
        ml_prediction
    )

    # ----------------------------------
    # Step 4: Risk Analysis
    # ----------------------------------
    analysis = generate_risk_analysis(
        risk_result["risk_level"],
        rule_result["triggered_rules"]
    )

    # ----------------------------------
    # Step 5: Final Response
    # ----------------------------------
    return {

        "prediction": ml_prediction,

        "risk_score": risk_result["risk_score"],

        "risk_level": risk_result["risk_level"],

        "threat_severity": analysis["threat_severity"],

        "risk_trend": analysis["risk_trend"],

        "recommendation": analysis["recommendation"],

        "risk_summary": analysis["risk_summary"],

        "detection_method": detection_method,

        "triggered_rules": rule_result["triggered_rules"]

    }