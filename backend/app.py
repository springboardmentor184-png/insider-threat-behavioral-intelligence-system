from flask import Flask, request, jsonify
from flask_cors import CORS
from models.user import User
from database import SessionLocal
from models.employee import EmployeeProfile
from models.department import Department
from models.device import Device
from models.alert import Alert
from models.employee import EmployeeProfile

app = Flask(__name__)

CORS(app, origins=["http://localhost:5173"])


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

            return jsonify({

                "message": "Login successful",

                "user_id": user.user_id,

                "name": user.name,

                "role": user.role

            }), 200

        else:

            return jsonify({
                "message": "Invalid email or password"
            }), 401

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
def admin_dashboard():

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

        employees = db.query(EmployeeProfile).all()

        employee_list = []

        for emp in employees:

            employee_list.append({

                "employee_id": emp.employee_id,

                "department": emp.department,

                "designation": emp.designation,

                "manager": emp.manager,

                "phone": emp.phone,

                "status": emp.status

            })

        return jsonify(employee_list)

    finally:

        db.close()


if __name__ == "__main__":
    app.run(debug=True)