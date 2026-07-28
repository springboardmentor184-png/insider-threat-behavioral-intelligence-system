from sklearn.ensemble import IsolationForest
import joblib

class AnomalyDetection:

    MODEL_PATH = "app/models/isolation_forest.pkl"

    def train(self, dataframe):
        
        model = IsolationForest(
            contamination=0.05,
            random_state=42
        )
        model.fit(dataframe)
        joblib.dump(model, self.MODEL_PATH)
        return model

    def load_model(self):
        return joblib.load(self.MODEL_PATH)

    def get_anomaly_score(self, model, dataframe, employee_ids):
        raw_scores = model.decision_function(dataframe)
        raw_preds = model.predict(dataframe)   

        min_score = min(raw_scores)
        max_score = max(raw_scores)
        range_score = max_score - min_score

        results = []
        for i, score in enumerate(raw_scores):
            if range_score == 0:
                normalized = 0
            else:
                normalized = ((max_score - score) / range_score) * 100

            results.append({
                "employee_id": employee_ids[i],
                "risk_score": round(normalized, 2),
                "is_anomaly": bool(raw_preds[i] == -1)
            })

        return results