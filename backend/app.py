from flask import Flask, request, jsonify
from flask_cors import CORS
from models.user import User
from database import SessionLocal
from models.department import Department
from models.device import Device
from models.alert import Alert
from models.employee import EmployeeProfile
from datetime import datetime
from models.anomaly_report import AnomalyReport
from ml.ml_service import predict_activity
from models.investigation import Investigation
from models.threat_notification import ThreatNotification
from email_service import send_critical_alert
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "insider-threat-secret-key"

jwt = JWTManager(app)
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"msg": "Token expired"}), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    print("INVALID TOKEN:", error)
    return jsonify({"msg": error}), 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    print("UNAUTHORIZED:", error)
    return jsonify({"msg": error}), 401

CORS(app, origins=["http://localhost:5173"])

@app.route("/employees", methods=["POST"])
def add_employee():

    data = request.get_json()

    db = SessionLocal()

    try:

        employee = EmployeeProfile(
            user_id=data["user_id"],
            department=data["department"],
            designation=data["designation"],
            manager=data["manager"],
            joining_date=data["joining_date"],
            phone=data["phone"],
            status=data["status"],
            dataset_user=data["dataset_user"]
        )

        db.add(employee)
        db.commit()

        return jsonify({
            "message": "Employee profile added successfully"
        }), 201

    except Exception as e:

        db.rollback()

        return jsonify({
            "error": str(e)
        }), 400

    finally:

        db.close()


@app.route("/")
def home():
    return {
        "message": "Insider Threat Behavioral Intelligence System API is running!"
    }


@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    allowed_roles = [
        "Administrator",
        "Security Manager",
        "Security Analyst",
        "SOC Engineer",
        "Employee"
    ]

    if data["role"] not in allowed_roles:
        return jsonify({
            "error": "Invalid role"
        }), 400

    db = SessionLocal()

    try:

        existing_user = db.query(User).filter(
            User.email == data["email"]
        ).first()

        if existing_user:
            return jsonify({
                "error": "Email already registered"
            }), 400

        user = User(
            name=data["name"],
            email=data["email"],
            password=data["password"],
            role=data["role"]
        )

        db.add(user)
        db.commit()

        return jsonify({
            "message": "User registered successfully!"
        }), 201

    except Exception as e:

        db.rollback()

        return jsonify({
            "error": str(e)
        }), 400

    finally:

        db.close()


@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.email == data["email"]
        ).first()

        if user and user.password == data["password"]:

            print("User found:", user.name)

            user.last_login = datetime.utcnow()

            db.commit()

            db.refresh(user)

            print("Last Login Updated:", user.last_login)

            access_token = create_access_token(
                identity=str(user.user_id),
                additional_claims={
                    "name": user.name,
                    "role": user.role
                }
            )

            return jsonify({

                "message": "Login successful",
                "access_token": access_token,
                "user_id": user.user_id,
                "name": user.name,
                "role": user.role

            }), 200

        return jsonify({
            "message": "Invalid email or password"
        }), 401

    except Exception as e:

        db.rollback()

        print(e)

        return jsonify({
            "error": str(e)
        }), 500

    finally:

        db.close()

@app.route("/users", methods=["GET"])
def get_users():

    db = SessionLocal()

    try:

        users = db.query(User).all()

        user_list = []

        for user in users:

            user_list.append({

                "user_id": user.user_id,
                "name": user.name,
                "email": user.email,
                "role": user.role

            })

        return jsonify(user_list)

    finally:

        db.close()

@app.route("/dashboard/admin", methods=["GET"])
@jwt_required()
def admin_dashboard():
    print("Dashboard endpoint reached")
    print("Current User:", get_jwt_identity())
    db = SessionLocal()

    try:

        total_employees = db.query(EmployeeProfile).count()

        total_departments = db.query(Department).count()

        total_devices = db.query(Device).count()

        open_alerts = db.query(Alert).count()

        return jsonify({

            "totalEmployees": total_employees,

            "departments": total_departments,

            "devices": total_devices,

            "alerts": open_alerts

        })

    finally:

        db.close()

@app.route("/employees", methods=["GET"])
def get_employees():

    db = SessionLocal()

    try:

        employees = (
    db.query(EmployeeProfile, User)
    .join(User, EmployeeProfile.user_id == User.user_id)
    .all()
)

        employee_list = []

        for emp, user in employees:
              employee_list.append({

               "employee_id": emp.employee_id,
               "user_id": emp.user_id,
               "name": user.name,
               "email": user.email,
               "department": emp.department,
               "designation": emp.designation,
               "manager": emp.manager,
               "joining_date": emp.joining_date.strftime("%Y-%m-%d"),
               "phone": emp.phone,
               "dataset_user": emp.dataset_user,
               "status": emp.status

})
           

        return jsonify(employee_list)

    finally:

        db.close()
@app.route("/employees/<int:employee_id>", methods=["PUT"])
def update_employee(employee_id):

    data = request.get_json()

    db = SessionLocal()

    try:

        employee = db.query(EmployeeProfile).filter(
            EmployeeProfile.employee_id == employee_id
        ).first()

        if not employee:

            return jsonify({
                "message": "Employee not found"
            }), 404
        employee.user_id = data["user_id"]
        employee.department = data["department"]
        employee.designation = data["designation"]
        employee.manager = data["manager"]
        employee.joining_date = data["joining_date"]
        employee.phone = data["phone"]
        employee.status = data["status"]
        employee.dataset_user = data["dataset_user"]

        db.commit()

        return jsonify({
            "message": "Employee updated successfully"
        })

    except Exception as e:

        db.rollback()

        return jsonify({
            "error": str(e)
        }), 400

    finally:

        db.close()

@app.route("/detect-anomaly", methods=["POST"])
def detect_anomaly():

    data = request.get_json()
    db = SessionLocal()

    try:

        employee_name = data["employee_name"]

        # -----------------------------
        # Get ML prediction + features
        # -----------------------------
        features = predict_activity(employee_name)

        prediction = features["prediction"]

        baseline = features["baseline"]
        current = features["current"]

        email_size = baseline["email_size"]
        attachment_count = baseline["attachment_count"]
        content_length = baseline["content_length"]
        hour = baseline["hour"]
        day_of_week = baseline["day_of_week"]

        # -----------------------------
        # Behaviour Risk Scoring Engine
        # -----------------------------
        risk_score = 10
        justifications = []

        if email_size > 25000:
            risk_score += 20
            justifications.append(
                f"Large average email size ({round(email_size)} bytes)."
            )
        else:
            risk_score += 5

        if attachment_count >= 1:
            risk_score += 15
            justifications.append(
                f"Average attachment count is {round(attachment_count,2)}."
            )

        if content_length > 350:
            risk_score += 10
            justifications.append(
                f"Long average email content ({round(content_length)} characters)."
            )

        if hour < 7 or hour > 20:
            risk_score += 15
            justifications.append(
                f"Email activity outside business hours (avg {round(hour)}:00)."
            )

        if prediction == "Anomaly":
            risk_score += 30
            justifications.append(
                "Isolation Forest detected anomalous behaviour."
            )

        risk_score = min(risk_score, 100)

        # -----------------------------
        # Risk Level
        # -----------------------------
        if risk_score >= 80:
            risk_level = "Critical"
        elif risk_score >= 60:
            risk_level = "High"
        elif risk_score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        # -----------------------------
        # Behaviour Summary
        # -----------------------------
        analysis = (
            "Behavioural intelligence engine analysed the employee's "
            "last 20 emails using communication frequency, email size, "
            "attachments, content characteristics and working hours."
        )

        recommendation = (
            "Immediate investigation recommended."
            if prediction == "Anomaly"
            else
            "Behaviour matches the historical baseline. Continue monitoring."
        )

        # -----------------------------
        # Save Report
        # -----------------------------
        report = AnomalyReport(
            employee_name=employee_name,
            prediction=prediction,
            risk_level=f"{risk_level} ({risk_score}/100)"
        )

        db.add(report)
        

        if risk_score >= 80:

            notification = ThreatNotification(
              employee_name=employee_name,
              risk_score=risk_score,
              risk_level=risk_level,
              message=f"{employee_name} triggered a {risk_level} insider threat alert."
            )

            db.add(notification)

        # -----------------------------
        # Auto Investigation Workflow
        # -----------------------------
        if risk_score >= 60:

            priority = (
                "Critical"
                if risk_score >= 80
                else "High"
            )

            investigation = Investigation(
                employee_name=employee_name,
                risk_score=risk_score,
                priority=priority,
                status="Open",
                assigned_to="Security Analyst",
                description=(
                    f"Behavioural analysis detected suspicious "
                    f"activity for {employee_name}. "
                    f"Investigation required."
                )
            )

            db.add(investigation)
        
        if risk_score >=80:
            send_critical_alert(
                employee=employee_name,
                risk_score=risk_score,
                risk_level=risk_level,
                analysis=analysis,
                recommendation=recommendation,
                receiver_email="insiderthreat.alerts@gmail.com"
            )

        db.commit()

        return jsonify({
    "employee": employee_name,
    "emails_analysed": 20,
    "prediction": prediction,
    "risk_score": risk_score,
    "risk_level": risk_level,
    "analysis": analysis,
    "justification": justifications,
    "recommendation": recommendation,

    "baseline": baseline,
    "current": current,

    "generated_at": datetime.now().strftime("%d-%m-%Y %H:%M:%S")
}), 200

    except Exception as e:

       db.rollback()

       import traceback
       traceback.print_exc()

       return jsonify({
           "error": str(e)
       }), 400

    finally:

        db.close()

@app.route("/reports", methods=["GET"])
def get_reports():

    db = SessionLocal()

    try:

        reports = db.query(AnomalyReport).order_by(
            AnomalyReport.created_at.desc()
        ).all()

        report_list = []

        for report in reports:

            report_list.append({

                "report_id": report.report_id,
                "employee_name": report.employee_name,
                "prediction": report.prediction,
                "risk_level": report.risk_level,
                "created_at": report.created_at.strftime("%Y-%m-%d %H:%M:%S")

            })

        return jsonify(report_list)

    finally:

        db.close()

@app.route("/investigations", methods=["GET"])
def get_investigations():

    db = SessionLocal()

    try:

        investigations = (
            db.query(Investigation)
            .order_by(Investigation.created_at.desc())
            .all()
        )

        investigation_list = []

        for item in investigations:

            investigation_list.append({

                "id": item.investigation_id,
                "employee": item.employee_name,
                "risk_score": item.risk_score,
                "priority": item.priority,
                "status": item.status,
                "assigned_to": item.assigned_to,
                "description": item.description,
                "created_at": item.created_at.strftime("%d-%m-%Y %H:%M:%S")

            })

        return jsonify(investigation_list)

    finally:
        db.close()

@app.route("/notifications", methods=["GET"])
def get_notifications():

    db = SessionLocal()

    try:

        notifications = (
            db.query(ThreatNotification)
            .order_by(
                ThreatNotification.created_at.desc()
            )
            .all()
        )

        notification_list = []

        for item in notifications:

            notification_list.append({

                "id": item.notification_id,
                "employee": item.employee_name,
                "risk_score": item.risk_score,
                "risk_level": item.risk_level,
                "message": item.message,
                "created_at": item.created_at.strftime("%d-%m-%Y %H:%M:%S")

            })

        return jsonify(notification_list)

    finally:
        db.close()

@app.route("/ueba", methods=["GET"])
def ueba_dashboard():

    db = SessionLocal()

    try:

        reports = db.query(AnomalyReport).all()
        investigations = db.query(Investigation).all()
        employees = db.query(EmployeeProfile).all()

        total_users = len(employees)

        anomalies = sum(
            1
            for report in reports
            if report.prediction == "Anomaly"
        )

        risk_scores = []

        highest_employee = "None"
        highest_score = 0

        for report in reports:

            if "(" in report.risk_level:

                score = int(
                    report.risk_level.split("(")[1].split("/")[0]
                )

            else:

                if report.risk_level == "Critical":
                    score = 90
                elif report.risk_level == "High":
                    score = 70
                elif report.risk_level == "Medium":
                    score = 50
                else:
                    score = 20

            risk_scores.append(score)

            if score > highest_score:
                highest_score = score
                highest_employee = report.employee_name

        average_risk = (
            round(sum(risk_scores) / len(risk_scores), 1)
            if risk_scores
            else 0
        )

        return jsonify({

            "averageRisk": average_risk,
            "highestEmployee": highest_employee,
            "highestScore": highest_score,
            "totalUsers": total_users,
            "anomalies": anomalies

        })

    finally:

        db.close()

@app.route("/analytics", methods=["GET"])
def analytics():

    db = SessionLocal()

    try:

        reports = db.query(AnomalyReport).all()
        employees = db.query(EmployeeProfile).all()
        investigations = db.query(Investigation).all()

        # -------------------------
        # Dashboard Summary
        # -------------------------

        total_reports = len(reports)
        total_employees = len(employees)
        total_investigations = len(investigations)

        critical_count = 0
        high_count = 0
        medium_count = 0
        low_count = 0

        highest_score = 0
        highest_employee = "None"

        for report in reports:

            score = int(
                report.risk_level.split("(")[1].split("/")[0]
            )

            if score >= 80:
                critical_count += 1
            elif score >= 60:
                high_count += 1
            elif score >= 40:
                medium_count += 1
            else:
                low_count += 1

            if score > highest_score:
                highest_score = score
                highest_employee = report.employee_name

        # -------------------------
        # Department Risk
        # -------------------------

        department_scores = {}

        for emp in employees:

            employee_reports = [
                r for r in reports
                if r.employee_name == emp.dataset_user
                or r.employee_name == emp.employee_id
                or r.employee_name == emp.user_id
            ]

            if len(employee_reports) == 0:
                continue

            scores = []

            for r in employee_reports:
                scores.append(
                    int(
                        r.risk_level.split("(")[1].split("/")[0]
                    )
                )

            avg = round(sum(scores) / len(scores), 1)

            if emp.department not in department_scores:
                department_scores[emp.department] = []

            department_scores[emp.department].append(avg)

        department_data = []

        for department, values in department_scores.items():

            department_data.append({

                "department": department,

                "risk": round(sum(values) / len(values), 1)

            })

        return jsonify({

            "summary": {

                "employees": total_employees,
                "reports": total_reports,
                "investigations": total_investigations,
                "highestEmployee": highest_employee,
                "highestScore": highest_score

            },

            "riskDistribution": [

                {
                    "name": "Critical",
                    "value": critical_count
                },
                {
                    "name": "High",
                    "value": high_count
                },
                {
                    "name": "Medium",
                    "value": medium_count
                },
                {
                    "name": "Low",
                    "value": low_count
                }

            ],

            "departmentRisk": department_data

        })

    finally:

        db.close()

if __name__ == "__main__":
    app.run(debug=True)