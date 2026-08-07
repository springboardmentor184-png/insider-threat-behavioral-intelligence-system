# Insider Threat Behavioral Intelligence System (ITBIS)

An AI-powered Enterprise Insider Threat Behavioral Intelligence & Risk Scoring Platform developed to continuously monitor employee activity, analyze behavioral patterns, detect anomalous events, compute weighted risk scores, and trigger automated security alerts.

**Project Status:** Milestone 3 Operational (Risk Scoring Engine, UEBA Analytics, Threat Investigation Workbench, Executive PDF Reports, & Automated Email Alerts Operational)

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Backend API** | Python 3.13, FastAPI, Uvicorn |
| **Database & ORM** | PostgreSQL / SQLite, SQLAlchemy, Alembic |
| **Machine Learning & Analytics** | Scikit-learn (Isolation Forest), Pandas, NumPy |
| **Frontend UI** | React 19, Vite, Recharts, Vanilla CSS (SOC Cyber Dark Theme) |
| **Authentication & RBAC** | JWT Tokens (`python-jose`), `bcrypt` password hashing |
| **Alert & Notification System** | Python `smtplib` + Gmail SMTP TLS (`anu.ananya.beckwoad@gmail.com`) |
| **Evidence Reporting** | JSON Export & Native Printable Executive PDF Export |

---

## 📊 Modules Implemented

### 1. User Authentication & Role-Based Access Control (RBAC)
- JWT token-based authentication (`/auth/login`, `/auth/register`, `/auth/me`).
- Granular Role-Based Access Control with 4 user roles:
  - **Security Analyst**: Monitored data review, threat investigation workbench access.
  - **SOC Engineer**: Technical telemetry review & model parameters.
  - **Security Manager**: Employee management, risk scoring posture oversight, manual security flagging.
  - **Administrator**: Full administrative control, system logs, & profile deletion privileges.

### 2. Employee Identity & Profile Directory
- Management of employee metadata: Employee ID, Department, Designation, Manager, Device/Asset SN, and Access Privileges.
- Instant search by ID/Department/Role and modal interface to onboard new profiles.

### 3. Activity Monitoring & Telemetry Ingestion
- Ingestion of activity event logs: Logins, File Downloads/Uploads, USB Devices, Database Access, Remote Sessions, and Privilege Changes.

### 4. Behavioral Profiling & UEBA Engine
- Baselining user historical behavior (login times, file transfer volumes, application usage).
- Peer group comparison and trend telemetry over time.

### 5. Anomaly Detection Engine
- Isolation Forest ML model combined with rule-based anomaly heuristics.
- Categorizes anomalies into Unusual Login Time, Abnormal Data Download, Unauthorized Access Attempt, Privilege Abuse, and Suspicious Device Usage.

### 6. Insider Risk Scoring Engine
- **Weighted Multi-Factor Scoring Model**:
  $$\text{Insider Risk Score} = (0.35 \times \text{Behavioral Anomalies}) + (0.25 \times \text{Privilege Misuse}) + (0.20 \times \text{Data Access Violations}) + (0.10 \times \text{Access Pattern Deviations}) + (0.10 \times \text{Historical Events})$$
- Categorization into 4 Risk Tiers:
  - 🟢 **Low Risk** (0–25)
  - 🟡 **Medium Risk** (26–50)
  - 🟠 **High Risk** (51–75)
  - 🔴 **Critical Risk** (76–100)

### 7. Threat Investigation Workbench
- Subject risk overview and real-time status tracker (`Open`, `Under Investigation`, `Escalated to SOC Tier 3`, `Resolved`).
- Interactive **Activity Telemetry Timeline** detailing timestamps, event types, and risk levels.
- Correlated Risk Indicators and associated asset/device metadata.
- Analyst Investigation Log & Evidence Notes.

### 8. Notification & Escalation System
- Automated Gmail SMTP alert integration sending instant critical warning notifications to **`anu.ananya.beckwoad@gmail.com`** when an employee's risk breaches threshold or when manually flagged by an analyst.

### 9. Evidence Export & Reports System
- **JSON Export**: Raw structured threat case payload for SIEM / SOAR integration.
- **PDF Export**: Clean executive printable PDF report formatted with badges, timeline, and analyst notes.

---

## 📂 Project Structure

```
Insider-Threat-Behavioral-Intelligence-System/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application & router registration
│   │   ├── database.py             # SQLAlchemy session & database engine
│   │   ├── models.py               # SQLAlchemy ORM models (User, EmployeeProfile, ActivityLog)
│   │   ├── schemas.py              # Pydantic validation schemas (UserCreate, FlagCreate, etc.)
│   │   ├── auth.py                 # JWT token creation, password hashing, RBAC dependencies
│   │   ├── services/
│   │   │   └── email_service.py    # Gmail SMTP alert dispatch system
│   │   └── routes/
│   │       ├── auth_routes.py      # Authentication endpoints (/auth/login, /auth/register)
│   │       ├── employee_routes.py  # Employee CRUD & manual flagging (/employees/{id}/flag)
│   │       ├── activity_routes.py  # Activity log ingestion (/activity-logs/)
│   │       └── anomalies.py        # Anomaly telemetry retrieval (/api/anomalies)
│   └── check_schema.py
├── frontend/
│   ├── index.html                  # Vite HTML entrypoint with Google Fonts
│   ├── src/
│   │   ├── main.jsx                # React 19 mounting script
│   │   ├── index.css               # SOC Cyber Dark Design System
│   │   ├── App.jsx                 # Client-side router configuration
│   │   ├── api/axios.js            # Axios interceptors & backend API calls
│   │   ├── context/AuthContext.jsx # Global JWT session state
│   │   ├── routes/ProtectedRoute.jsx # Auth route guard
│   │   ├── components/
│   │   │   └── Layout.jsx          # Sidebar, header with system clock, role badges
│   │   └── pages/
│   │       ├── Login.jsx           # Cyber SOC authentication page & demo role buttons
│   │       ├── Dashboard.jsx       # Risk Scoring Engine & UEBA Analytics Dashboard
│   │       ├── Employees.jsx       # Identity Directory, Onboarding & Flagging
│   │       ├── Anomalies.jsx       # Anomaly Detection & Classification Center
│   │       └── AnomalyDetail.jsx   # Threat Investigation Workbench & PDF/JSON Export
│   └── package.json
├── data-processing/                # Isolation Forest training scripts & CERT sample datasets
└── README.md
```

---

## 🔑 Roles & Permissions Matrix

| User Role | View Telemetry | Onboard Employees | Flag Entities | Delete Employees | Escalate Incidents |
|---|:---:|:---:|:---:|:---:|:---:|
| **Security Analyst** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **SOC Engineer** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Security Manager** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Administrator** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## ⚡ Quick Start Guide

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`

### 2. Frontend Setup (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Web Application Console: `http://localhost:5173`

---

## 🚀 Quick Demo Login Credentials

You can log in directly using the pre-configured quick demo role buttons on the Sign In page:

| Role | Demo Username | Default Password |
|---|---|---|
| **Security Analyst** | `analyst_demouser` | `password123` |
| **SOC Engineer** | `soc_engineer_demo` | `password123` |
| **Security Manager** | `sec_manager_demo` | `password123` |
| **Administrator** | `admin_demo` | `password123` |

---

## 📧 Email Alert Configuration

Alert notifications are configured to send warning emails via Gmail SMTP (`smtp.gmail.com:587`). Environment variables can be defined in a `.env` file or system environment:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=anu.ananya.beckwoad@gmail.com
SENDER_PASSWORD=your-16-char-gmail-app-password
DEFAULT_RECIPIENT_EMAIL=anu.ananya.beckwoad@gmail.com
```
