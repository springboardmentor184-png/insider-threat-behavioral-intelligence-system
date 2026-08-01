from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.alert import Alert

def calculate_category_score(alerts, severity_weights):
    if not alerts:
        return 0
    
    score = 0
    for alert in alerts:
        weight = severity_weights.get(alert.severity, 0)
        score += weight
        
    return min(score, 100) # Cap each category at 100 points

def recalculate_risk_scores(db: Session):
    employees = db.query(Employee).all()
    
    # Severity weights for alert scoring
    weights = {
        "Informational": 10,
        "Low": 25,
        "Medium": 50,
        "High": 75,
        "Critical": 100
    }
    
    results = []
    
    for emp in employees:
        # Fetch all alerts for this employee
        emp_alerts = db.query(Alert).filter(Alert.employee_id == emp.employee_id).all()
        
        # 1. Behavioral Anomalies (35%)
        # Categories: "Abnormal Data Download", "Excessive File Transfers", "Unusual Login Time" (normal working hours deviations)
        behavioral_alerts = [a for a in emp_alerts if a.category in ["Abnormal Data Download", "Excessive File Transfers"] or (a.category == "Unusual Login Time" and "Off-Hours" in a.title)]
        behavioral_score = calculate_category_score(behavioral_alerts, weights)
        
        # 2. Privilege Misuse Indicators (25%)
        # Categories: "Insider Risk Indicators" (privilege change / actions)
        privilege_alerts = [a for a in emp_alerts if "Privilege" in a.title or a.category == "Insider Risk Indicators"]
        privilege_score = calculate_category_score(privilege_alerts, weights)
        
        # 3. Data Access Violations (20%)
        # Categories: "Unauthorized Access Attempts"
        violation_alerts = [a for a in emp_alerts if a.category == "Unauthorized Access Attempts"]
        violation_score = calculate_category_score(violation_alerts, weights)
        
        # 4. Access Pattern Deviations (10%)
        # Categories: "Unusual Login Time" (excluding off-hours, focused on unusual IPs or locations)
        deviation_alerts = [a for a in emp_alerts if a.category == "Unusual Login Time" and "Off-Hours" not in a.title]
        deviation_score = calculate_category_score(deviation_alerts, weights)
        
        # 5. Historical Security Events (10%)
        # We look at all alerts that are resolved or false positive, or count total closed alerts
        historical_alerts = [a for a in emp_alerts if a.status in ["Resolved", "False Positive"]]
        historical_score = min(len(historical_alerts) * 25, 100) # 25 pts per historical security alert, max 100

        # Weighted calculation
        weighted_score = (
            (behavioral_score * 0.35) +
            (privilege_score * 0.25) +
            (violation_score * 0.20) +
            (deviation_score * 0.10) +
            (historical_score * 0.10)
        )
        
        final_score = int(round(weighted_score))
        
        # Update the employee's risk score
        emp.risk_score = final_score
        results.append({
            "employee_id": emp.employee_id,
            "full_name": emp.full_name,
            "risk_score": final_score,
            "category": "Critical" if final_score >= 80 else ("High" if final_score >= 60 else ("Medium" if final_score >= 30 else "Low"))
        })
        
    db.commit()
    return {"success": True, "message": "Successfully recalculated risk scores.", "scores": results}
