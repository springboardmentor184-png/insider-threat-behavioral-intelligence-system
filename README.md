# Insider Threat Behavioral Intelligence System

An AI-powered platform that continuously monitors employee activity, builds behavioral baselines, detects anomalies, and generates risk-based security alerts to help organizations proactively identify insider threats.

Built as part of the Infosys Springboard Internship Program.

## Overview

The platform helps organizations identify suspicious behavior, prevent data breaches, detect account misuse, and monitor privilege abuse through behavioral analytics and AI-driven risk assessment. It's designed for enterprises, financial institutions, healthcare organizations, government agencies, and Security Operations Centers (SOCs).

## Features Implemented So Far

### User Authentication & Role-Based Access
- Secure user registration and login with hashed passwords (bcrypt)
- JWT-based stateless authentication
- Role-based access control across four roles: Security Analyst, SOC Engineer, Security Manager, Administrator
- Protected API routes with JWT validation and role checks
- Authenticated profile retrieval (`/me`)

### Employee Identity & Profile Management
- Employee profile creation, retrieval, update, and listing
- Employee records linked to user accounts via foreign key
- Fields: employee code, department, designation, manager, device info, access privileges
- Frontend onboarding form and live employee directory

### Behavioral Profiling & Anomaly Detection
- Behavioral baseline generation per user from the CERT Insider Threat Dataset (logon activity)
- Features tracked: total login events, unique PCs accessed, average login hour, logon/logoff counts
- Isolation Forest machine learning model flags statistically anomalous users based on behavioral deviation
- Anomaly results computed on-demand and persisted to PostgreSQL for fast retrieval
- Summary analytics endpoint powering risk-distribution and top-risk-user visualizations
- Frontend dashboard with stat cards, pie chart (risk distribution), bar chart (top risky users), and a sortable anomaly table
- CSV report export for flagged anomalies

### Threat Incident Tracking (Backend)
- Incidents can be created against flagged users, with title, description, and severity
- Incident status tracking (open/in progress/resolved) and updates
- Role-restricted access for incident creation and management

## Tech Stack

**Backend**
- Python
- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL (hosted on Neon)
- python-jose (JWT)
- Passlib + bcrypt (password hashing)
- Pandas, Scikit-learn (Isolation Forest)

**Frontend**
- React (Vite)
- Axios
- React Router
- Recharts (data visualization)

**Planned / Full System Scope**
- MongoDB (activity logs)
- Elasticsearch (search & analytics)
- Redis (caching/sessions)
- Docker (containerization)
- AWS / Azure (deployment)
- XGBoost, TensorFlow/PyTorch (advanced risk scoring & UEBA)

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── database.py      # DB connection & session handling
│   │   ├── models.py        # SQLAlchemy models (User, Employee, AnomalyResult, Incident)
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── auth.py          # Password hashing, JWT logic, RBAC
│   │   ├── analytics.py     # Behavioral baseline generation & anomaly detection
│   │   └── routes.py        # API endpoints
│   ├── data/                # CERT insider threat dataset (gitignored — not committed)
│   │   └── r1/               # logon.csv, device.csv, http.csv, LDAP/
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
│   │       └── Anomalies.jsx
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

## API Endpoints

| Method | Endpoint                     | Description                                | Auth Required |
|--------|-------------------------------|----------------------------------------------|----------------|
| POST   | `/register`                   | Register a new user                          | No             |
| POST   | `/login`                      | Log in and receive a JWT access token        | No             |
| GET    | `/me`                          | Get the current authenticated user           | Yes            |
| GET    | `/users`                       | List all users                               | Yes (Admin)    |
| POST   | `/employees`                   | Create an employee profile                   | Yes (Admin)    |
| GET    | `/employees`                   | List all employee profiles                   | Yes (Admin/Manager) |
| GET    | `/employees/{employee_id}`     | Get a single employee profile                | Yes (Admin/Manager) |
| PUT    | `/employees/{employee_id}`     | Update an employee profile                   | Yes (Admin)    |
| POST   | `/analytics/run`               | Run behavioral analysis & store anomalies    | Yes (Admin)    |
| GET    | `/analytics/anomalies`         | Retrieve stored anomalous users              | Yes (Admin/Manager/SOC/Analyst) |
| GET    | `/analytics/summary`           | Get risk distribution & top-risk summary     | Yes (Admin/Manager/SOC/Analyst) |
| POST   | `/incidents`                   | Create a threat incident                     | Yes (Admin/Manager/SOC/Analyst) |
| GET    | `/incidents`                   | List all incidents                           | Yes (Admin/Manager/SOC/Analyst) |
| PUT    | `/incidents/{incident_id}`     | Update incident status/severity              | Yes (Admin/Manager/SOC) |

## Roles

- **Security Analyst**
- **SOC Engineer**
- **Security Manager**
- **Administrator**

## Roadmap

- [x] User Authentication & Role-Based Access
- [x] Employee Identity & Profile Management
- [x] Behavioral Profiling Engine
- [x] Anomaly Detection Engine
- [x] Dashboard & Analytics
- [ ] Reports & Export System (CSV export done; PDF export pending)
- [ ] Threat Investigation Module (incident tracking backend done; UI pending)
- [ ] Activity Monitoring Engine
- [ ] Insider Risk Scoring Engine
- [ ] UEBA Intelligence Engine
- [ ] Alert & Incident Management System
- [ ] Notification & Escalation System
- [ ] Final Integration, Testing & Deployment
### 🚨 Anomaly Detection (Fully Functional)

The system now detects anomalies using a **TOP 5 comparison approach**:

1. **Builds a baseline** of the top 5 most common:
   - Event types (LOGIN, FILE_ACCESS, etc.)
   - Source systems (ActiveDirectory, FileServer, etc.)
   - IP addresses

2. **Flags anomalies** when an activity has:
   - An event type NOT in the top 5
   - A source system NOT in the top 5
   - An IP address NOT in the top 5

3. **Displays anomalies** in:
   - Dashboard table with reasons
   - Risk score calculation
   - Anomaly reports

**Example anomalies detected:**
| Event Type | Source System | IP Address | Reasons |
|------------|---------------|------------|---------|
| USB_DEVICE | USBMonitor | 192.168.1.14 | Unusual event, unusual source, unusual IP |
| UNKNOWN_EVENT | UnknownSystem | 999.999.999.999 | Unusual source |
| FILE_ACCESS | ExternalCloud | 203.0.113.45 | Unusual source |
### 🖥️ Dashboard (Live)

The dashboard now displays:

- **Risk Score** – Dynamic score (0-100) based on anomaly percentage
- **Total Activities** – All logged activities for the employee
- **Total Anomalies** – Number of activities flagged as unusual
- **Anomaly Rate** – Percentage of activities that are anomalies
- **Recent Anomalies Table** – Shows:
  - Event Type
  - Source System
  - IP Address
  - Reasons (why it was flagged)
  - Severity (INFO, WARNING, CRITICAL)
- **Risk Factors** – Lists specific risk indicators
- **Recommendations** – Actionable steps for investigation

## License

See [LICENSE](./LICENSE) for details.
