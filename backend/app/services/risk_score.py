class RiskScore:

    def calculate(self, anomaly_score, unusual_login_ratio, usb_ratio, email_ratio, web_ratio):
        
        normalized_anomaly = anomaly_score / 100

        weighted_score = (
            (normalized_anomaly * 35)
            + (usb_ratio * 25)
            + (email_ratio * 20)
            + (unusual_login_ratio * 10)
            + (web_ratio * 10)
        )

        max_single_signal = max(
            normalized_anomaly * 100,
            usb_ratio * 100,
            email_ratio * 100,
            unusual_login_ratio * 100,
            web_ratio * 100
        )

        final_score = max(weighted_score, max_single_signal * 0.7)

        return round(min(final_score, 100), 2)

    def categorize(self, score):
        if score < 25:
            return "Low"
        elif score < 50:
            return "Medium"
        elif score < 75:
            return "High"
        else:
            return "Critical"

    def apply_categories(self, results):
        for r in results:
            r["risk_category"] = self.categorize(r["risk_score"])
        return results

    def get_risk_distribution(self, results):
        distribution = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
        for r in results:
            distribution[r["risk_category"]] += 1
        return [{"category": k, "count": v} for k, v in distribution.items()]


risk_score_calculator = RiskScore()