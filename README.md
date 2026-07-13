# insider-threat-behavioral-intelligence-system
AI-powered Insider Threat Behavioral Intelligence System developed as part of the Infosys Internship Program.

**Status:** Milestone 1 complete 

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Frontend | React (Vite) |
| Primary Database | PostgreSQL 18 |
| Auth | JWT (python-jose), bcrypt password hashing |
| Frontend routing | react-router-dom |
| HTTP client | axios |

---

## Project Structure

```
Insider-Threat-Behavioral-Intelligence-System/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint, router registration
│   │   ├── database.py          # SQLAlchemy engine, session, Base
│   │   ├── models.py            # User, EmployeeProfile, ActivityLog tables
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── auth.py              # JWT creation/validation, password hashing, RBAC
│   │   └── routes/
│   │       ├── auth_routes.py       # /auth/register, /auth/login, /auth/me
│   │       ├── employee_routes.py   # /employees/ CRUD
│   │       └── activity_routes.py   # /activity-logs/ ingestion + retrieval
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/axios.js             # Axios instance + API calls
│       ├── context/AuthContext.jsx  # Global auth state
│       ├── components/Layout.jsx    # Sidebar + top bar app shell
│       ├── routes/ProtectedRoute.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           └── Employees.jsx
└── docker-compose.yml
```

---

## Milestone 1 — 

## Roles & Permissions

Four user roles are implemented, matching the Springboard spec:

| Role | Can view employees | Can create employees | Can delete employees |
|---|---|---|---|
| Security Analyst | ✅ | ❌ | ❌ |
| SOC Engineer | ✅ | ❌ | ❌ |
| Security Manager | ✅ | ✅ | ❌ |
| Administrator | ✅ | ✅ | ✅ |

All authenticated users can view and submit activity logs.

---

**Backend**
```powershell
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload
```
Runs at `http://127.0.0.1:8000`

**Frontend**
```powershell
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`

**Database**
- PostgreSQL 18 running locally, database name: `itbis_db`
- Connection string configured in `backend/app/database.py`

---

## Test Accounts

| Username | Password | Role |
|---|---|---|
| analyst1 | Test@123 | security_analyst |
| soc1 | Test@123 | soc_engineer |
| manager1 | Test@123 | security_manager |
| admin1 | Test@123 | administrator |

---

## Datasets

The CERT Insider Threat Dataset (Kaggle) has been identified as the data source for activity log ingestion. A sample of real `logon.csv` records has been prepared for loading through the ingestion pipeline via `ingest_cert_data.py` to validate the pipeline against realistic data shapes ahead of Milestone 2's model training work.
