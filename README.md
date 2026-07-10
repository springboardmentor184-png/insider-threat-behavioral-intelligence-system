# Insider Threat Behavioral Intelligence System

An enterprise-grade, AI-powered Insider Threat Behavioral Intelligence System developed as part of the Infosys Internship Program. This repository hosts the complete platform, which continuously monitors employee activities, analyzes behavioral patterns, detects anomalies, evaluates insider risk levels, and generates security alerts.

This documentation focuses on the backend foundation (Milestone 1) built using a Clean Service-Repository pattern.

---

## 🛠️ Technology Stack
* **Language**: Python 3.12+
* **Framework**: Flask (Modular Blueprint Design)
* **Database & Migrations**: Flask-SQLAlchemy (ORM) & Flask-Migrate
* **Security & Crypto**: Flask-Bcrypt (Blowfish hashing) & Flask-JWT-Extended (JWT auth tokens)
* **Validation**: Marshmallow (Schema validation & serialization)
* **API Configuration**: Flask-CORS (Cross-Origin Resource Sharing) & Python `logging` (Rotating log handlings)
* **Default Database**: SQLite (local fallback) or MySQL / MariaDB

---

## 📂 Project Architecture Layout
The backend follows a clean architecture pattern separating models, route parsing, validation schemas, and database transactions:

```
backend/
├── app.py                      # Application factory, extensions setup, error handlers, DB auto-seeding
├── config.py                   # Environment variable loader with SQLite fallback
├── requirements.txt            # Package dependencies
├── .env                        # Local configuration secrets
│
├── database/
│   ├── db.py                   # Instantiates database ORM, migrate, and encryption objects
│   └── schema.sql              # Raw SQL DDL schema script for manual deployments
│
├── models/
│   ├── role.py                 # Role schema (ADMINISTRATOR, SECURITY_ANALYST, etc.)
│   ├── employee.py             # Employee attributes (code, department, status, stamps)
│   ├── user.py                 # Authentication model mapping roles and profiles
│   └── activity_log.py         # Logs system activity (remote IP, User-Agent, action type)
│
├── routes/
│   ├── auth.py                 # REST API Auth endpoints & HTML UI template loading
│   ├── employee.py             # REST API Employee CRUD operations
│   ├── admin.py                # Admin system diagnosis telemetry summary API
│   └── activity.py             # Retrieves activity log histories
│
├── services/
│   ├── auth_service.py         # Handles logins, token creation, and registration logic
│   ├── employee_service.py     # Employee records maintenance and conflicts checking
│   └── activity_service.py     # Captures user action details (IP and browser user-agent)
│
├── middleware/
│   └── auth.py                 # RBAC authorization decorator (@roles_required)
│
├── utils/
│   ├── logger.py               # Rotating file logging setup writing to logs/app.log
│   ├── validators.py           # Marshmallow validators checking formatting constraints
│   └── response.py             # Consistent success and error response wrappers
│
├── templates/                  # Frontend UI templates served directly by Flask
│   ├── login.html              # Glassmorphic user login interface
│   ├── register.html           # Security enrollment page
│   └── profile.html            # Profile dashboard displaying log timeline
│
└── verify_backend.py           # Automated integration test suite
```

---

## ⚡ Quick Start & Execution

### **1. Set Up Environment**
Navigate to the `backend/` directory and install the dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### **2. Launch the Application**
Run the Flask server:
```bash
python app.py
```
By default, the server will start on **`http://127.0.0.1:5000`**.

### **3. Seed Data & Test Access**
On database boot, tables are created and seeded with:
* **Default Roles**: `ADMINISTRATOR`, `ADMIN`, `SECURITY_ANALYST`, `SOC_ENGINEER`, `SECURITY_MANAGER`, `EMPLOYEE`
* **Default Administrator account**:
  * **Username**: `admin`
  * **Password**: `password123`
  * **Linked Employee Code**: `EMP0001` (Chief Security Architect)

Open your browser and navigate to:
* **Login Portal**: [http://127.0.0.1:5000/login](http://127.0.0.1:5000/login)
* **Registration Portal**: [http://127.0.0.1:5000/register](http://127.0.0.1:5000/register)

Log in with `admin` / `password123` to view the **Identity Dashboard** showing your linked employee code, designation, and a live-updating user behavioral timeline auditing your actions.

---

## 🧪 Automated Testing
Run the integration test suite covering authentication, token refreshing, validation, and role authorization rules:
```bash
cd backend
python -m unittest verify_backend.py
```
All tests are implemented warning-free using modern SQLAlchemy 2.0 getter APIs.

---

## 🛡️ Security Features
1. **Centralized Error Handlers**: Prevents database tracebacks and system execution detail leaks to external clients (mitigating **CWE-209**).
2. **Stateless JWT Authorization**: Custom `@roles_required` decorator extracts user roles directly from JWT payload claims, preventing extra database roundtrips.
3. **Password Cryptography**: Credentials are encrypted using blowfish-based Bcrypt hashing prior to database persistence.
4. **Behavioral Footprinting**: The system captures the remote IP address (resolving proxy headers like `X-Forwarded-For`) and user-agent string for every login, creation, modification, and deletion event automatically.
