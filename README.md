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

**Status:** Milestone 2 in progress (Week 3 & 4 — CERT Dataset Ingestion & Behavioral Analysis)

## Milestone 2 Progress

✅ Dataset acquisition — CERT r4.2 (Kaggle: andrihjonior/cert-insider-threat-dataset-r4-2)
✅ Files: logon.csv, device.csv, file.csv, email.csv, http.csv (5% sampled), psychometric.csv, LDAP snapshots (3 months)
✅ Ingestion pipeline (`ingest_cert_data.py`) — loads all files into PostgreSQL (`itbis_db`)
✅ EDA — structural checks (nulls, dtypes, row counts) and pattern analysis (login times, after-hours activity, top users by device/file/email activity)
✅ Feature engineering (`feature_engineering.py`) — per-user behavioral features: total logons, after-hours logons, after-hours ratio, device activity, file access count, emails sent, http activity, combined activity score. Saved to `user_features` table.

🔄 Next: Isolation Forest anomaly/risk scoring model on `user_features`
⬜ Expose risk scores via FastAPI endpoint
⬜ Display risk scores on frontend dashboard

## Scripts (data-processing/)
- `download_r42.py` — downloads CERT r4.2 via kagglehub
- `copy_r42.py` — copies/samples relevant files into `data/raw_r42`
- `check_files.py` — verifies row counts and columns
- `ingest_cert_data.py` — loads CSVs into PostgreSQL
- `eda.py` / `eda_patterns.py` — exploratory data analysis
- `feature_engineering.py` — builds per-user risk features
