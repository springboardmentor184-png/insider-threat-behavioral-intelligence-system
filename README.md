# Insider Threat Behavioral Intelligence System (CyberGuard)

An enterprise-grade, AI-powered Insider Threat Behavioral Intelligence System developed as part of the Infosys Internship Program. This repository hosts a complete, production-ready platform that continuously monitors employee activity logs, builds normal behavioral baselines, detects anomalies using machine learning (UEBA), evaluates insider threat risk profiles, and compiles security assessment reports for security operations staff.

---

## 🛠️ Technology Stack
* **Language & Runtime**: Python 3.12+ / Node (npx)
* **Backend Framework**: Flask (Modular Blueprint Design)
* **Database & Migrations**: Flask-SQLAlchemy (ORM) & Flask-Migrate (SQLite dev / MySQL prod)
* **Security & Auth**: Flask-Bcrypt (Blowfish hashing) & Flask-JWT-Extended (Stateless token verification)
* **API Validation & Serialization**: Marshmallow Schemas
* **UI Frontend**: HTML5, Vanilla JS, CSS3, Tailwind CSS (Visual Framework), Chart.js (Telemetry charts)
* **ML & Behavioral Analytics (UEBA)**: Custom heuristics for risk scoring, behavior baselines, feature vectors, and anomalies detection

---

## 📂 Project Architecture Layout
The platform utilizes a Clean Service-Repository layout separating database persistence, route handlers, validation schemas, and analytical services:

```
Insider-Threat-Behavioral-Intelligence-System/
├── README.md                           # Main project documentation
├── INTEGRATION_REPORT.md               # End-to-end integration status
├── backend/                            # Python Flask REST API
│   ├── app.py                          # Application factory, extensions setup, error handlers, DB auto-seeding
│   ├── config.py                       # Environment loader (SQLite/MySQL configurations)
│   ├── requirements.txt                # Package dependencies
│   ├── .env                            # Local configuration secrets
│   ├── database/
│   │   ├── db.py                       # Instantiates SQLAlchemy, migrate, and encryption
│   │   └── schema.sql                  # Raw SQL DDL schema script
│   ├── models/
│   │   ├── role.py                     # User Roles (ADMINISTRATOR, SECURITY_ANALYST, etc.)
│   │   ├── employee.py                 # Employee attributes, workstations, USB assets, status
│   │   ├── user.py                     # Auth profiles mapping roles and credentials
│   │   ├── activity_log.py             # Event audit logs (activity types, IP addresses, computer names)
│   │   ├── behavior_profile.py         # UEBA behavior profiles (login time, file/web frequencies)
│   │   ├── behavior_baseline.py        # Normal user baseline hour limits and volume counts
│   │   ├── behavior_feature.py         # Computed feature shifts (late logins, mass file access)
│   │   ├── risk_score.py               # Calculated employee risk index percentages
│   │   ├── anomaly.py                  # Detected UEBA model anomalies
│   │   ├── alert.py                    # Generated alerts for security operations
│   │   └── threat_report.py            # Security analyst reports and recommendation dossiers
│   ├── routes/
│   │   ├── auth.py                     # API logins, registers, token refreshes, page routing
│   │   ├── employee.py                 # CRUD endpoints for employee management
│   │   ├── activity.py                 # Employee log timeline retrievals
│   │   └── analytics.py                # UEBA and dashboard metric telemetry APIs
│   ├── services/
│   │   ├── auth_service.py             # Auth flow & credential hashes
│   │   ├── employee_service.py         # Employee records maintenance and conflicts validation
│   │   ├── activity_service.py         # captures client browser user-agent & IP footprint
│   │   └── analytics_service.py        # Compiles risk indexes and telemetry aggregations
│   ├── middleware/
│   │   ├── auth.py                     # JWT token extraction & validations
│   │   └── permissions.py              # Role-Based Access Control decorator
│   ├── utils/
│   │   ├── logger.py                   # Rotating file logs writing to logs/app.log
│   │   ├── validators.py               # Marshmallow regex validators
│   │   └── response.py                 # Consistent JSON response wrapper helpers
│   ├── verify_backend.py               # Backend unit test suite
│   └── verify_analytics.py             # UEBA & Analytics integration test suite
└── frontend/                           # Client static files
    ├── api.js                          # Centralized JavaScript API client (JWT tokens management, auto-refresh)
    └── admin/
        └── dashboard.html              # Sleek, glassmorphic dark-theme SecOps Console
```

---

## ⚡ Quick Start & Execution

### **1. Set Up Environment**
Navigate to the `backend/` directory and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### **2. Launch the Application**
Start the Flask application server:
```bash
python app.py
```
By default, the server runs on **`http://127.0.0.1:5000`**.

### **3. Seeding Default Accounts**
On database instantiation, the schema is automatically built and populated with:
* **Default Roles**: `ADMINISTRATOR`, `ADMIN`, `SECURITY_ANALYST`, `SOC_ENGINEER`, `SECURITY_MANAGER`, `EMPLOYEE`
* **Root Administrator Account**:
  * **Username**: `admin`
  * **Password**: `password123`
  * **Linked Employee Code**: `EMP0001` (Chief Security Architect)
* **Custom Seed Account (Surya)**:
  * **Username**: `Morampudi Surya Sai`
  * **Password**: `password123`
  * **Linked Employee Code**: `EMP001` (Administrator)
* **845 Employees & Behavior Records**: Hydrated with CERT insider threat behavioral telemetry metrics (login hours, USB usage, web access frequencies).

---

## 🛡️ Key Features Built & Configured

### 1. **Modern SOC Admin Portal**
A high-tech, glassmorphic dark-theme console housing:
* **Tri-Chart SecOps Telemetry**: Chart.js visualizations showing Risk Distribution (pie), Activity Volumes (bar), and Classification Summary (pie).
* **Summary Metrics**: Real-time status cards showing Total Employees (845), Active Threats, Online Logs count, and System Health.
* **Top Risk Users Ledger**: Dynamically loaded table highlighting high-risk profiles along with threat details (risk score, login count, after-hours activity %, and weekend activity %).
* **Recent File Access Table**: Parsed system file logs showing the latest document interactions (User, Computer, Date, Filename).

### 2. **Access Control Boundaries (Admin-only Controls)**
When viewing an employee security dossier:
* **Administrators** (`ADMIN` or `ADMINISTRATOR` roles) have full edit permissions, including designating departments, changing titles, altering workstation access, promoting user system roles, and toggling suspension status (Active/Suspended).
* **Other Security Staff** (e.g. `SECURITY_MANAGER` / `SECURITY_ANALYST`) are restricted to a **read-only view**. All form inputs are disabled, and update buttons are hidden to enforce strict separation of duties.

### 3. **UEBA Behavioral Analytics & ML Anomaly Engine**
* Continuous comparison of raw employee events against statistical baselines.
* Calculation of deviation metrics for early detection of anomalous behavior (late logins, massive downloads, or unauthorized USB access).
* Chronological display of threat reports.

### 4. **Diagnostic Reports & PDF Print Export**
* Detailed security assessment popups displaying behavioral shifts and analyst recommendations.
* Embedded `@media print` style wrappers to cleanly format dossiers and reports for physical or PDF print layouts, automatically hiding navigation sidebars and headers.

---

## 🧪 Automated Testing
Run the comprehensive integration test suites:
* **Core Backend Tests**:
  ```bash
  python -m unittest verify_backend.py
  ```
* **UEBA & Analytics Tests**:
  ```bash
  python -m unittest verify_analytics.py
  ```
All tests run warning-free and execute successfully.
