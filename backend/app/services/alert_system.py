class AlertSystem:

    def generate_alert(
        self,
        employee,
        risk_score
    ):
        if risk_score >= 80:

            severity = "Critical"

        elif risk_score >= 60:

            severity = "High"

        elif risk_score >= 40:

            severity = "Medium"

        else:

            severity = "Low"

        return {
            "employee": employee,
            "risk_score": risk_score,
            "severity": severity,
            "status": "Open"
        }