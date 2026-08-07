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
│   │   ├── __init__.py                 # Database models export interface
│   │   ├── role.py                     # User Roles (ADMINISTRATOR, SECURITY_ANALYST, etc.)
│   │   ├── permission.py               # Security action permissions definitions for RBAC
│   │   ├── role_permission.py          # Association table mapping roles to permissions
│   │   ├── employee.py                 # Employee attributes, workstations, USB assets, status
│   │   ├── user.py                     # Auth profiles mapping roles and credentials
│   │   ├── activity_log.py             # Raw employee event activity logs (system interactions)
│   │   ├── audit_log.py                # Dedicated system admin/investigation audit logs
│   │   ├── notification.py             # Targeted security notifications (by user ID or role)
│   │   ├── behavior_baseline.py        # Normal user baseline hour limits and volume counts
│   │   ├── behavior_profile.py         # UEBA behavior profiles (login time, file/web frequencies)
│   │   ├── behavioral_feature.py       # Computed feature shifts (late logins, mass file access)
│   │   ├── risk_score.py               # Calculated employee risk index percentages
│   │   ├── risk_history.py             # Historical risk scores timeline per employee
│   │   ├── anomaly.py                  # Detected UEBA model anomalies
│   │   ├── alert.py                    # Generated alerts with risk scores & case associations
│   │   ├── investigation.py            # Case files, notes timeline, and digital evidence models
│   │   ├── threat_report.py            # Security analyst reports and recommendation dossiers
│   │   └── analytics_cache.py          # Cached aggregated telemetry dashboard data
│   ├── routes/
│   │   ├── __init__.py                 # Blueprints loader
│   │   ├── auth.py                     # API logins, registers, token refreshes, page routing
│   │   ├── employee.py                 # CRUD endpoints for employee management
│   │   ├── activity.py                 # Employee log timeline retrievals
│   │   ├── admin.py                    # Administrator dashboard system summary
│   │   ├── alerts.py                   # Custom alert generation, acknowledgements, escalations
│   │   ├── investigations.py           # Investigation case updates, notes, evidence attachments
│   │   ├── risk.py                     # Risk registry metrics & on-demand recalculation
│   │   ├── analytics.py                # Cached aggregated SOC metrics and notification retrievals
│   │   └── reports.py                  # Filterable threat reports list and exports compilation
│   ├── services/
│   │   ├── auth_service.py             # Auth flow & credential bcrypt hashes
│   │   ├── employee_service.py         # Employee records maintenance and conflicts validation
│   │   ├── activity_service.py         # Captures client browser user-agent & IP footprint
│   │   ├── risk_service.py             # UEBA baseline deviation calculations and scheduler
│   │   ├── investigation_service.py    # Case operations, timeline audit logger, and alert dispatchers
│   │   ├── permission_service.py       # Dynamic RBAC roles/permissions seeder
│   │   └── email_service.py            # SMTP simulation module for alert email transmissions
│   ├── middleware/
│   │   ├── auth.py                     # JWT token extraction & validations
│   │   └── permissions.py              # Role-Based Access Control decorator
│   ├── utils/
│   │   ├── logger.py                   # Rotating file logs writing to logs/app.log
│   │   ├── validators.py               # Marshmallow validation schemas
│   │   └── response.py                 # Consistent JSON response wrapper helpers
│   ├── verify_backend.py               # Backend unit test suite
│   ├── verify_analytics.py             # UEBA & Analytics integration test suite
│   └── verify_milestone3.py            # Case lifecycle, auditing & notifications test suite
└── frontend/                           # Client static files
    ├── api.js                          # Centralized JavaScript API client (JWT tokens management, auto-refresh)
    └── admin/
        └── dashboard.html              # Sleek, glassmorphic dark-theme SecOps Console (SPA Tab Layout)
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

### 1. **Modern SOC Admin Portal (SPA Tabbed Layout)**
A high-tech, glassmorphic dark-theme console housing modular dashboards:
* **SecOps Telemetry & KPIs**: Real-time status cards showing Total Employees, MTTD (Mean Time to Detect), MTTR (Mean Time to Resolve), Open Cases, and Average Risk Score.
* **Risk Registry Tab**: Ledger of all tracked employee risk scores, featuring on-demand calculations, baseline comparison grids, and historical line-graph trend telemetry.
* **Alert Inbox Tab**: Lists generated security violations. Supports manually creating custom alerts and executing action controls (*Acknowledge, Resolve, Escalate*).
* **Investigations Ledger Tab**: Direct access to case folders, enabling notes logging, assigning security analysts, status updates, and digital evidence attachments.
* **Reports Exports Tab**: Dedicated threat reports library with support for instant CSV file exports and downloads.
* **Notifications Hub**: Visual popup notifications to alert security staff of critical risk score threshold breaches.

### 2. **Access Control Boundaries (Admin-only Controls)**
When viewing an employee security dossier:
* **Administrators** (`ADMIN` or `ADMINISTRATOR` roles) have full edit permissions, including designating departments, changing titles, altering workstation access, promoting user system roles, and toggling suspension status (Active/Suspended).
* **Other Security Staff** (e.g. `SECURITY_MANAGER` / `SECURITY_ANALYST` / `SOC_ENGINEER`) are restricted to a **read-only view**. All form inputs are disabled, and update buttons are hidden to enforce strict separation of duties.

### 3. **Behavioral Risk Score Engine**
* Continuous comparison of raw employee activities against statistical baselines.
* Configurable risk weights (in `backend/config.py`) to customize penalty scoring.
* Integrated **APScheduler** background task manager for daily automatic risk calculations.

### 4. **Timeline-based Case Management**
* Automated opening of cases when employee risk scores exceed the threshold of `70`.
* Structured chronological events stored in an `InvestigationEvent` database model.
* Analyst comments logging and digital evidence attachments (*evidence size, location, and metadata*).

### 5. **Security Auditing & Notifications**
* A dedicated `AuditLog` table capturing action keywords, target components, descriptions, operator IDs, IP addresses, and timestamps.
* Targeted notifications dispatched by role or recipient user ID when security events occur.

### 6. **Performance Caching**
* Aggregated telemetry endpoints cached inside `AnalyticsCache` to optimize dashboard response times.
* Automatic cache invalidation triggers on database write states to guarantee fresh telemetry.

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
* **Case Lifecycle & Auditing Tests (Milestone 3)**:
  ```bash
  python -m unittest verify_milestone3.py
  ```
All tests run warning-free and execute successfully.
