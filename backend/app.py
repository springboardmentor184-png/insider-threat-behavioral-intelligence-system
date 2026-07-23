from flask import Flask, request, jsonify
from flask_cors import CORS
from models.user import User
from database import SessionLocal
from models.department import Department
from models.device import Device
from models.alert import Alert
from models.employee import EmployeeProfile
from datetime import datetime
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "insider-threat-secret-key"

jwt = JWTManager(app)

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
            joining_date=datetime.strptime(
    data["joining_date"],
    "%Y-%m-%d"
).date(),
            phone=data["phone"],
            status=data["status"]
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
@jwt_required()
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

        employee.department = data["department"]
        employee.designation = data["designation"]
        employee.manager = data["manager"]
        employee.joining_date = data["joining_date"]
        employee.phone = data["phone"]
        employee.status = data["status"]

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

if __name__ == "__main__":
    app.run(debug=True)