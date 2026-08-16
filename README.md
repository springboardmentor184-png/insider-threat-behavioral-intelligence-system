# Insider Threat Behavioral Intelligence System

An AI-powered platform that continuously monitors employee activity, builds behavioral baselines, detects anomalies, scores insider risk, and manages threat investigations end-to-end — helping security teams proactively identify insider threats before they escalate.

Built as part of the Infosys Springboard Internship Program.

## Overview

The platform helps organizations identify suspicious behavior, prevent data breaches, detect account misuse, and monitor privilege abuse through behavioral analytics and AI-driven risk assessment. It's designed for enterprises, financial institutions, healthcare organizations, government agencies, and Security Operations Centers (SOCs).

## Project Status: All Core Milestones Complete

- [x] **Milestone 1** (Week 1–2): Project Initialization, Design Process & Core Setup
- [x] **Milestone 2** (Week 3–4): Behavioral Analytics & Anomaly Detection
- [x] **Milestone 3** (Week 5–6): Risk Scoring & Threat Investigation
- [x] **Milestone 4** (Week 7–8): Analytics, Testing & Deployment

## Features

### 1. User Authentication & Role-Based Access
- Secure registration and login with hashed passwords (bcrypt)
- JWT-based stateless authentication
- Role-based access control across four roles: Security Analyst, SOC Engineer, Security Manager, Administrator
- Protected API routes with JWT validation and per-endpoint role checks
- Authenticated profile retrieval (`/me`)

### 2. Employee Identity & Profile Management
- Employee profile creation, retrieval, update, and directory listing
- Employee records linked to user accounts via foreign key
- Fields: employee code, department, designation, manager, device info, access privileges
- Frontend onboarding form and live employee directory

### 3. Behavioral Profiling Engine
- Per-user behavioral baselines built from the CERT Insider Threat Dataset (logon and device activity)
- Tracked features: total login events, unique PCs accessed, average login hour, off-hours login ratio, device connection frequency

### 4. Anomaly Detection Engine
- Isolation Forest machine learning model flags statistically anomalous users based on behavioral deviation from the baseline
- Top-5 baseline comparison flags activity whose event type, source system, or IP address falls outside a user's normal pattern
- Anomaly results computed and persisted to PostgreSQL for fast retrieval
- One-click "Run Analysis" recomputes the full dataset on demand

### 5. Insider Risk Scoring Engine
- Dynamic per-user risk score (0–100), derived from off-hours activity and device usage patterns
- Risk categorization: Critical, High, Medium, Low
- Risk distribution summary and top-risky-users ranking
- Sortable, filterable risk scores table across the full user base

### 6. Threat Investigation Module
- Incidents created directly against flagged anomalous users, with title, description, and severity
- Incident status lifecycle: Open → In Progress → Resolved
- Role-restricted creation and management (Admin / Security Manager / SOC Engineer)
- Investigation context surfaced alongside each flagged user (why they were flagged)

### 7. Alert & Incident Management
- Alerts generated from flagged anomalies, with severity levels (Informational, Low, Medium, High, Critical)
- Centralized Alerts view for active threat signals
- Incident tracking dashboard with Open / In Progress / Resolved counts

### 8. Dashboards & Analytics
- Central dashboard: account status, role, open alerts, high-risk user count
- Risk Distribution pie chart and Top Risky Users bar chart
- Sortable anomaly and risk-score tables with severity indicators
- Recent activity feed

### 9. Reports & Export System
- CSV export of flagged anomalies
- PDF export of anomaly and risk reports

## Tech Stack

**Backend**
- Python, FastAPI
- SQLAlchemy (ORM)
- PostgreSQL (hosted on Neon)
- python-jose (JWT), Passlib + bcrypt (password hashing)
- Pandas, Scikit-learn (Isolation Forest)

**Frontend**
- React (Vite)
- Axios, React Router
- Recharts (data visualization)

**Planned / Extended Scope**
- MongoDB (raw activity log storage), Elasticsearch (search & analytics), Redis (caching/sessions)
- Docker, AWS/Azure (deployment)
- XGBoost, TensorFlow/PyTorch (advanced UEBA and threat prediction models)

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point + CORS config
│   │   ├── database.py      # DB connection & session handling
│   │   ├── models.py        # SQLAlchemy models (User, Employee, AnomalyResult, Incident)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── auth.py          # Password hashing, JWT logic, RBAC
│   │   ├── analytics.py     # Behavioral baseline generation, anomaly detection & risk scoring
│   │   └── routes.py        # API endpoints
│   ├── data/                # CERT insider threat dataset (gitignored — not committed)
│   │   └── r1/                # logon.csv, device.csv, http.csv, LDAP/
│   ├── requirements.txt
│   └── .env                 # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js           # Axios instance/config
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Employees.jsx
│   │       ├── Anomalies.jsx
│   │       ├── RiskDashboard.jsx
│   │       ├── Incidents.jsx
│   │       └── Alerts.jsx
│   └── package.json
│
└── docs/
    └── project-specification.pdf
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A PostgreSQL database (e.g., a free [Neon](https://neon.tech) instance)
- CERT Insider Threat Dataset (r1 or later) placed under `backend/data/r1/` (not included in this repo due to file size — download separately from [KiltHub](https://kilthub.cmu.edu/articles/dataset/Insider_Threat_Test_Dataset/12841247))

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install fastapi uvicorn sqlalchemy psycopg2-binary "python-jose[cryptography]" "passlib[bcrypt]" python-multipart python-dotenv pydantic-settings "pydantic[email]" pandas scikit-learn
```

Create a `.env` file in `backend/`:
```
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
SECRET_KEY=<your-generated-secret-key>
```

Run the server:
```bash
uvicorn app.main:app --reload
```

API docs available at `http://127.0.0.1:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

### First-Time Data Setup

1. Register an administrator account via `POST /register` (set `"role": "administrator"`)
2. Log in and authorize in `/docs` or the frontend
3. Run `POST /analytics/run` (or click **Run Analysis** in the Anomalies page) to process the CERT dataset and populate behavioral baselines, anomalies, and risk scores
4. Explore Dashboard, Anomalies, Risk Scores, and Incidents with real data

## API Endpoints

| Method | Endpoint                          | Description                                | Auth Required |
|--------|-------------------------------------|-----------------------------------------------|----------------|
| POST   | `/register`                         | Register a new user                            | No             |
| POST   | `/login`                            | Log in and receive a JWT access token          | No             |
| GET    | `/me`                                 | Get the current authenticated user             | Yes            |
| GET    | `/users`                              | List all users                                 | Yes (Admin)    |
| POST   | `/employees`                          | Create an employee profile                     | Yes (Admin)    |
| GET    | `/employees`                          | List all employee profiles                     | Yes (Admin/Manager) |
| GET    | `/employees/{employee_id}`            | Get a single employee profile                  | Yes (Admin/Manager) |
| PUT    | `/employees/{employee_id}`            | Update an employee profile                     | Yes (Admin)    |
| POST   | `/analytics/run`                      | Run behavioral analysis & store anomalies      | Yes (Admin)    |
| GET    | `/analytics/anomalies`                | Retrieve stored anomalous users                | Yes (Admin/Manager/SOC/Analyst) |
| GET    | `/analytics/summary`                  | Get risk distribution & top-risk summary       | Yes (Admin/Manager/SOC/Analyst) |
| GET    | `/risk-scores`                        | Get per-user risk scores & risk levels         | Yes (Admin/Manager/SOC/Analyst) |
| POST   | `/risk-scores/compute`                | Recompute risk scores from latest data         | Yes (Admin)    |
| POST   | `/employees/{employee_id}/anomalies`  | Manually flag an anomaly for an employee       | Yes (Admin/Manager/SOC) |
| POST   | `/incidents`                          | Create a threat incident                       | Yes (Admin/Manager/SOC/Analyst) |
| GET    | `/incidents`                          | List all incidents                             | Yes (Admin/Manager/SOC/Analyst) |
| PUT    | `/incidents/{incident_id}`            | Update incident status/severity                | Yes (Admin/Manager/SOC) |

## Roles

- **Security Analyst**
- **SOC Engineer**
- **Security Manager**
- **Administrator**

## Known Limitations / Future Work

- Behavioral analysis currently runs against the static CERT dataset rather than live activity log ingestion (Module 3 — Activity Monitoring Engine, real-time agents/log pipelines planned)
- Risk scoring uses a rule-based formula (off-hours ratio + device usage); a trained supervised model (XGBoost/TensorFlow) is planned for more nuanced scoring
- Notification & Escalation System (email/Slack alerts on critical incidents) not yet implemented
- Docker containerization and cloud deployment (AWS/Azure) pending

## License

See [LICENSE](./LICENSE) for details.
