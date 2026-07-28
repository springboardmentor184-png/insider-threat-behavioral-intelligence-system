from app.services.risk_score import risk_score_calculator


class AlertSystem:

    def generate_alert(self, employee, risk_score, usb_count=0):
        severity = risk_score_calculator.categorize(risk_score)

        return {
            "employee": employee,
            "risk_score": risk_score,
            "severity": severity,
            "status": "Open"
        }


alert_system = AlertSystem()