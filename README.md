# Insider-Threat-Behavioral-Intelligence-System

### 1️⃣ Root `README.md` (project root లో — `backend`/`frontend` folders unna చోట) — COMPLETE

```markdown
# Aegis — AI Insider Threat Behavioral Intelligence System

A full-stack web application that monitors employee digital activity, detects anomalous behavior patterns using statistical modeling, scores risk levels, and escalates serious cases to management — while respecting employee privacy.

Built as part of the Infosys Springboard internship program.

---

## Overview

Aegis analyzes employee activity logs (login times, device usage) to build a **behavioral baseline** for each employee, then flags statistically unusual activity as **anomalies**. Security teams review these anomalies through role-specific dashboards and escalate genuine concerns into tracked **threat investigations**.

---

## Tech Stack

**Backend**
- Python 3.13, FastAPI, SQLAlchemy
- PostgreSQL 17
- JWT auth (`python-jose`), `passlib` + `bcrypt` for password hashing
- `pandas` for data ingestion, Python `statistics` module for behavioral modeling

**Frontend**
- Next.js (Pages Router)
- Tailwind CSS v4
- `recharts` (charts), `lucide-react` (icons)

**Dataset**
- CERT Insider Threat Dataset r4.2 (logon + device activity logs)

---

## Features

### Milestone 1 — Foundation
- User authentication (JWT-based register/login)
- Employee profile management
- CERT dataset ingestion into `activity_logs` table

### Milestone 2 — Behavioral Analytics & Anomaly Detection
- **Behavioral Baseline Engine** — computes per-employee normal behavior patterns (average logon hour, activity frequency, device usage)
- **Anomaly Detection Engine** — flags statistically unusual activity using z-score analysis, with severity levels (low/medium/high/critical)
- **Threat Detection** — escalates reviewed anomalies into tracked threat investigations
- **Role-Based Access Control** — four roles with distinct permissions:
  | Role | Focus |
  |---|---|
  | Security Analyst | Investigate and triage anomalies, escalate threats |
  | SOC Engineer | Real-time monitoring feed of recent activity |
  | Security Manager | Executive overview — trends, severity mix, top-risk employees |
  | Administrator | Platform health, user management, data coverage stats |
- **Role-curated dashboards** — each role sees a dashboard built for their job, not a generic filtered table

---

## Project Structure

```
Insider-Threat-Behavioral-Intelligence-System/
├── backend/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── models.py                 # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   ├── auth.py                    # JWT auth + role-based access control
│   ├── database.py                 # DB session/engine setup
│   ├── ingest_logs.py               # CERT dataset ingestion script
│   ├── baseline_engine.py            # Behavioral baseline computation
│   ├── anomaly_detection.py           # Z-score based anomaly detection
│   └── routers/
│       ├── auth_routes.py
│       ├── user_routes.py
│       ├── profile_routes.py
│       └── analytics_routes.py       # Baselines, anomalies, threats API
└── frontend/
    ├── pages/
    │   ├── login.js, register.js
    │   └── dashboard/
    │       ├── index.js               # Role-based redirect
    │       ├── analyst.js, soc.js, manager.js, admin.js
    ├── components/                    # Layout, tables, charts, cards
    ├── utils/api.js                   # Authenticated fetch helper
    └── styles/globals.css             # Design system (tokens, colors, fonts)
```

---

## Setup Instructions

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt

# Set up .env with SECRET_KEY, ALGORITHM, DATABASE_URL etc.

uvicorn main:app --reload
```
Backend runs at `http://localhost:8000` — API docs at `http://localhost:8000/docs`

### Data Ingestion & Analytics (run once, after backend is up)

```bash
python ingest_logs.py          # Loads CERT dataset into activity_logs
python baseline_engine.py      # Computes behavioral baselines
python anomaly_detection.py    # Runs z-score anomaly detection
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`

---

## Anomaly Detection Methodology

Each employee's logon events are compared against their personal baseline using a **z-score**:

```
z = (actual_logon_hour − baseline_avg_hour) / baseline_std_dev
```

| |z-score| | Severity |
|---|---|
| ≥ 2.0 | Medium |
| ≥ 3.0 | High |
| ≥ 4.0 | Critical |

A minimum standard deviation floor prevents false positives for employees with very consistent (near-zero variance) routines.

---

## Roles & Access

| Role | Can view anomalies | Can review/escalate | Can manage users |
|---|---|---|---|
| Security Analyst | ✅ | ✅ | ❌ |
| SOC Engineer | ✅ | ✅ | ❌ |
| Security Manager | ✅ (read-only) | ❌ | ❌ |
| Administrator | ✅ | ✅ | ✅ |

---

## Contributors

Group project — Infosys Springboard Internship
Branch: `Aarrnave` — Aarrnave Sirigineedi
```

