# Aegis Project Reference

This is the technical reference for **Aegis — Insider Threat Behavioral Intelligence System**. It is a local, role-based security analytics application built around the supplied CERT r4.2 logon and removable-device data. It is a demonstration and investigation aid: an anomaly is a review signal, not evidence of wrongdoing or intent.

## 1. Tech stack

### Backend

| Technology | Use in this project | Version/source |
| --- | --- | --- |
| Python | Backend services, ingestion, analytics, and ML scripts | Python 3.10+ is the documented prerequisite |
| FastAPI | HTTP API and route registration | `requirements.txt` does not pin a version |
| Uvicorn | ASGI development server | unpinned |
| SQLAlchemy | ORM, database engine, sessions, and table creation | unpinned |
| PostgreSQL | Active application database (`insider_threat_db`) | Driver: `psycopg2-binary`, unpinned |
| python-dotenv | Loads `backend/.env` | unpinned |
| python-jose | HS256 JWT creation and validation | unpinned |
| Passlib + bcrypt | Password hashing and verification | `bcrypt>=4.1,<5`; Passlib unpinned |
| Pydantic / email-validator | Request/response schemas and email validation | Pydantic is provided by FastAPI; `email-validator` is unpinned |
| ReportLab | Server-side PDF report generation | unpinned |

### Data and machine learning

| Technology | Use in this project | Version/source |
| --- | --- | --- |
| pandas | Chunked CSV ingestion and feature engineering | unpinned |
| scikit-learn | `RobustScaler` and `IsolationForest` | unpinned |
| joblib | Saves the fitted model and feature names | unpinned |
| imbalanced-learn | Available dependency for legacy balancing support; the active Isolation Forest training path is unsupervised and does not balance labels | unpinned |
| CERT r4.2 subset | Input data: `logon.csv` and `device.csv` | Supplied local dataset |

### Frontend

| Technology | Use in this project | Version in `frontend/package.json` |
| --- | --- | --- |
| JavaScript / React | Browser UI and stateful pages | React `19.2.4`, React DOM `19.2.4` |
| Next.js Pages Router | Frontend routes, build, and dev/production server | `16.2.10` |
| Tailwind CSS | Styling and responsive layout | Tailwind `^4`; `@tailwindcss/postcss` `^4` |
| Recharts | Trend and severity chart components | `^3.10.1` |
| Lucide React | Navigation and UI icons | `^1.27.0` |
| ESLint | Frontend linting | `^9`, with `eslint-config-next` `16.2.10` |

## 2. Architecture overview

1. The Next.js frontend runs on port **3000** and calls the FastAPI backend on port **8000**. Its shared `apiFetch` helper attaches the JWT stored in browser local storage as a Bearer token.
2. FastAPI validates the JWT, loads the corresponding console user from PostgreSQL, and enforces the route's allowed roles before returning data. CORS permits the common local frontend origins.
3. The ingestion script reads CERT `logon.csv` and `device.csv` in 50,000-row chunks, normalizes the activity names, and bulk inserts events into PostgreSQL `activity_logs`.
4. The baseline engine reads `activity_logs` and stores one normal-behavior baseline per employee in `behavioral_baselines`. The anomaly detector uses those baselines to create `anomalies` and linked high/critical `alerts`.
5. The active ML training script reads the already-ingested PostgreSQL activity events, engineers one 27-feature profile per employee, fits an Isolation Forest, and writes `ml/trained_model.joblib` plus `ml/training_report.json`.
6. API routes assemble operational data into dashboards, activity aggregates, alerts, reports, employee profiles, and investigation payloads. The investigation payload combines timeline events, persisted risk scores, correlation indicators, and synthetic/demo employee context.

## 3. How each module works

### Authentication and RBAC

The app supports Security Analyst, SOC Engineer, Security Manager, and Administrator console roles. Registration hashes passwords with bcrypt; login verifies the hash and returns a signed HS256 JWT that expires after 60 minutes by default. Protected routes use FastAPI dependencies to decode the JWT, load the user, and reject unauthorized roles with HTTP 403. The frontend hides administrator navigation where appropriate, but the backend role check is the actual authorization boundary.

### Activity ingestion and monitoring

`ingest_logs.py` imports CERT logon/logoff and removable-device connect/disconnect records into `activity_logs`. It processes each CSV in 50,000-row pandas chunks and uses SQLAlchemy bulk mappings to keep the load practical for the supplied data. Each stored event keeps the employee identifier, normalized event type, timestamp, workstation, and source filename. The Activity page asks the backend for a recent date window anchored to the latest dataset event, so historical CERT timestamps still produce a populated chart.

### Behavioral profiling

The baseline engine aggregates all activity per employee into a single `behavioral_baselines` row. It records typical logon hour, variation in logon hour, daily logon volume, device-connect volume, and total event counts. These baselines give the operational detector an employee-specific definition of normal rather than applying one global fixed schedule. The approach is deliberately simple and explainable for an analyst demo.

### Operational anomaly detection

The anomaly detector evaluates logon events against each employee's average logon hour using a z-score. A minimum standard deviation of 0.5 avoids a near-zero baseline creating excessive flags, while absolute z-scores of 2, 3, and 4 map to medium, high, and critical severity. It persists each detected deviation with the observed value, baseline, score, timestamp, description, and review status. High and critical anomalies also create linked alert records so the dashboard and alerts page have actionable records to display.

### Isolation Forest profile ranking

The ML trainer builds 27 aggregate features per employee from PostgreSQL activity data, including volumes, after-hours/weekend ratios, workstation variety, active-day counts, and estimated session-duration statistics. It applies `RobustScaler` then fits an unsupervised `IsolationForest` with 500 estimators and 10% contamination; insider labels are used only to evaluate ranking, not to train the detector. The top 10% score threshold produces the triage queue and writes a reproducible JSON report. With the supplied subset, only 3 of 13 configured reference IDs are present, so precision, recall, and F1 are calculated only over those evaluable IDs.

### Risk scoring and categories

The operational risk score is a separate explainable 0–100 score, not the Isolation Forest score. It combines behavioral anomaly severity (35%), privilege-related anomaly text (25%), data-access anomaly text (20%), login-pattern anomalies (10%), and historical event count (10%). A computed score is persisted in `risk_scores`, and a high/critical score can create a `high_risk_score` alert if there is not already an active one. Current scores are assigned Low, Medium, High, or Critical categories by relative population ranking: lower half Low, next quarter Medium, next 15% High, and top decile Critical.

### Threat investigations

Opening an investigation retrieves up to 250 newest employee events, current/persisted risk history, and a rule-based correlation summary. The correlation reports after-hours logons, device activity, and whether a device-related anomaly exists; it does not claim causal evidence or use a new ML model. If the employee has no risk score yet, the endpoint creates the first persisted score so the view has honest current context. Analysts, SOC engineers, and administrators can set the case state to Open, In Progress, or Resolved.

### Alerts and threat escalation

The Alerts page displays persisted alert records, including alerts created from high/critical behavioral anomalies and high/critical risk scores. Authorized operational roles can acknowledge, investigate, resolve, or dismiss alerts through the API. On the analyst dashboard, an open anomaly can also be escalated to a `threat_detections` record for tracking. Alerts and threats are workflow records for review, not verdicts about an employee.

### Employee profiles

CERT activity files do not contain HR data. At application startup, the profile seed routine creates deterministic synthetic/demo profiles for any missing activity employee ID using a hash of that ID. Profiles include department, designation, manager, managed workstation information, and access privileges; none of those fields should be represented as real CERT personnel or entitlement data. Administrators can search and filter the Employees directory by department, while every investigation shows department, designation, and manager as contextual information.

### Reports and PDF export

The Reports page displays counts for open anomalies, active alerts, active threats, the current risk-category breakdown, and top flagged users. Its PDF action calls the protected report-export endpoint. ReportLab generates a Letter-size PDF with a summary table, category table, and top-user table directly from persisted PostgreSQL state. The project exports PDF only; Excel and combined PDF/Excel output are not implemented.

## 4. How to run locally on Windows

These steps assume a fresh clone, Python 3.10+ and Node.js 18+ are installed, PostgreSQL is installed locally, and the supplied CERT files are available. The dataset is intentionally not expected in Git; place the supplied files at `backend/data/cert_data/r4.2/logon.csv` and `backend/data/cert_data/r4.2/device.csv`.

### A. Create the PostgreSQL database

Open PowerShell and use a PostgreSQL account with permission to create a database:

```powershell
psql -U postgres -c "CREATE DATABASE insider_threat_db;"
```

If the database already exists, do not run that command again. From the repository root, create `backend/.env` locally. Replace the placeholder with your real password; URL-encode reserved URL characters in the password (for example, `@` becomes `%40`). Do not commit this file.

```powershell
@'
DATABASE_URL=postgresql://postgres:<URL_ENCODED_POSTGRES_PASSWORD>@localhost:5432/insider_threat_db
SECRET_KEY=<A_LONG_RANDOM_DEVELOPMENT_SECRET>
'@ | Set-Content backend\.env
```

### B. Install backend dependencies and create tables

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

The first backend start creates the SQLAlchemy tables and seeds synthetic/demo employee profiles if activity data already exists. Leave this terminal running for the moment; verify `http://127.0.0.1:8000/` returns the backend message, then stop it with `Ctrl+C` before running the data pipeline below.

### C. Ingest and process the CERT dataset

From `backend/`, with the virtual environment still active:

```powershell
python ingest_logs.py
python baseline_engine.py
python anomaly_detection.py
python -m ml.train_model
```

Run those commands in that order. The first imports activity into PostgreSQL; the second calculates per-employee normal behavior; the third creates operational anomalies and alerts; the fourth trains and writes the Isolation Forest artifact/report from PostgreSQL data. For a smaller import, set `CERT_INGEST_LIMIT_PER_SOURCE` to a positive number before `python ingest_logs.py`; leave it unset or `0` for the full supplied files.

### D. Start the application

Start the backend again in one PowerShell window:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --host 127.0.0.1 --port 8000
```

Start the frontend in a second PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in a browser. The frontend is on port **3000** and the API is on port **8000**. FastAPI's interactive documentation is at **http://localhost:8000/docs**.

For a first local account, use the Register page. Select the role needed for the demo; choose Administrator to demonstrate user management and the Employees directory.

## 5. Demo walkthrough

1. **Register and sign in as an Administrator.** Explain that the app uses JWT login, then point out the role label and administrator-only Employees navigation.
2. **Administrator dashboard (`/dashboard`).** Show user management, role changes, employee/baseline coverage, and imported logon/device totals. This establishes the RBAC and data foundation.
3. **Employees (`/employees`).** Search by employee ID or manager and filter by department. State clearly that department, designation, manager, device, and access information is deterministic synthetic/demo context because CERT has no HR data.
4. **Activity (`/activity`).** Show the 14-day aggregate trend and the daily events, logons, device connections, and after-hours counts. Explain that the range is anchored to the newest historical CERT timestamp.
5. **Alerts (`/alerts`).** Review alert severity, source description, employee ID, acknowledgement action, and the Investigate link. Explain that high/critical behavioral anomalies and high/critical operational risk scores can create alerts.
6. **Threat investigation.** Choose Investigate for an alert or a top flagged Reports user. Show synthetic profile context, the risk score/category, correlation summary, event timeline, and case-status selector. Emphasize that correlation is analyst context, not proof of intent.
7. **Reports (`/reports`).** Show operational counts, risk-category chart, and top flagged users. Use **Export Report as PDF** to demonstrate the server-generated management report.
8. **Optional role views.** Register/sign in as Security Analyst, SOC Engineer, or Security Manager to show the analyst triage workflow, 15-second SOC refresh feed, or manager trend/risk view. Then explain that the backend, not just the hidden menu, denies administrator-only routes to non-administrators.

## 6. Known limitations

- **Dataset scope:** The supplied CERT subset has only logon and removable-device data. File, email, web, and network telemetry are not ingested, and the very large `http.csv` is intentionally skipped.
- **Reference labels:** Only 3 of 13 configured reference insider IDs occur in the supplied logon/device subset. Reported offline metrics measure only those three evaluable IDs and do not establish production accuracy.
- **Synthetic HR context:** Employee profile fields are invented demo context, not CERT HR, device-inventory, manager, or entitlement records.
- **Detection boundaries:** The z-score detector measures unusual logon hour. The Isolation Forest ranks aggregate profiles. Neither determines intent, causation, or guilt; human review remains necessary.
- **Operational scope:** Alerts, threats, and investigation states are manual analyst workflows. Notification/escalation automation is deferred.
- **Authentication scope:** The application uses local JWT login and bcrypt password hashes. OAuth2, SSO, and third-party identity-provider integration are deferred.
- **Reporting scope:** PDF export is implemented. Excel export and combined PDF-plus-Excel export are deferred.
- **Deployment scope:** Docker/container packaging, cloud deployment, managed backups, production secret management, and managed operations are deferred. PostgreSQL is the active local database, but a production deployment still needs secure transport, least-privilege credentials, audit/retention controls, and operational hardening.

## 7. Key files reference

| Feature | Primary files |
| --- | --- |
| Application startup, CORS, table creation, profile seeding | `backend/main.py`, `backend/database.py` |
| Database models and tables | `backend/models.py` |
| Password hashing, JWT validation, role dependency | `backend/auth.py`, `backend/schemas.py` |
| Registration and login endpoints | `backend/routers/auth_routes.py` |
| Analytics, risk scores, alerts, reports, investigations, admin employee/user APIs | `backend/routers/analytics_routes.py`, `backend/risk_scoring.py` |
| Legacy/current-user profile endpoints | `backend/routers/profile_routes.py`, `backend/routers/user_routes.py` |
| CERT CSV ingestion | `backend/ingest_logs.py` |
| Per-employee baseline calculation | `backend/baseline_engine.py` |
| Z-score anomaly detection and alert creation | `backend/anomaly_detection.py` |
| Synthetic/demo employee profile generation | `backend/employee_profile_seed.py` |
| Isolation Forest feature engineering, training, and evaluation | `backend/ml/train_model.py`, `backend/ml/training_report.json` |
| Frontend API/JWT helper | `frontend/utils/api.js` |
| Shared navigation, role-aware Employees link, theme | `frontend/components/Layout.js` |
| Login/register and role-to-dashboard routing | `frontend/pages/login.js`, `frontend/pages/register.js`, `frontend/pages/dashboard/index.js` |
| Role dashboards | `frontend/pages/dashboard/analyst.js`, `frontend/pages/dashboard/soc.js`, `frontend/pages/dashboard/manager.js`, `frontend/pages/dashboard/admin.js` |
| Activity, alerts, reports, employees, investigation pages | `frontend/pages/activity.js`, `frontend/pages/alerts.js`, `frontend/pages/reports.js`, `frontend/pages/employees.js`, `frontend/pages/investigations/[employeeId].js` |
| Frontend dependencies/build configuration | `frontend/package.json`, `frontend/next.config.mjs`, `frontend/postcss.config.mjs` |
