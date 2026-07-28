# Insider Threat Behavioral Intelligence System

An AI-powered Insider Threat Behavioral Intelligence System developed as part of the Infosys Springboard Virtual Internship.

---

# Project Overview

The Insider Threat Behavioral Intelligence System is designed to identify potential insider threats by analyzing employee behavior using Artificial Intelligence and Machine Learning.

The system provides secure authentication, employee management, department management, device management, and will later integrate behavioral analytics and machine learning models to detect suspicious insider activities and assess organizational risk.

---

# Project Objectives

- Secure user authentication and authorization
- Employee profile management
- Department and device management
- Behavioral activity monitoring
- Insider threat detection using Machine Learning
- Risk assessment and prediction
- Interactive security dashboard

---

# Technology Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Passlib (bcrypt)
- JWT Authentication
- Google OAuth 2.0
- Uvicorn

## Frontend

- React.js (Vite)
- React Router
- Axios
- Recharts (data visualization)

## AI / Machine Learning

- Pandas
- NumPy
- Scikit-learn (Isolation Forest)

---

# Project Structure

```text
backend/
│
├── app/
│   ├── api/
│   │   ├── auth.py            # Authentication, employee, department, device routes
│   │   ├── activity.py        # Activity log ingestion and retrieval
│   │   └── analytics.py       # Behavioral analytics and risk scoring routes
│   ├── models/
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── department.py
│   │   ├── device.py
│   │   ├── activity_event.py
│   │   └── risk_score.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── department.py
│   │   ├── device.py
│   │   ├── activity_event.py
│   │   └── risk_score.py
│   ├── services/
│   │   ├── jwt_handler.py
│   │   ├── oauth.py
│   │   ├── rbac.py
│   │   ├── security.py
│   │   └── behavioral_analytics.py   # Feature engineering + Isolation Forest model
│   ├── database.py
│   └── main.py
│
└── requirements.txt

frontend/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── GoogleSuccess.jsx
│   │   ├── Dashboard.jsx          # Live risk overview
│   │   ├── Profile.jsx
│   │   ├── EmployeePage.jsx
│   │   ├── DepartmentPage.jsx
│   │   ├── DevicePage.jsx
│   │   └── ReportsPage.jsx        # Anomaly report: charts + printable PDF
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
└── vite.config.js

```

---

# Implemented Features

## Authentication

- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Protected Routes
- User Profile API
- Role-Based Access Control (RBAC)
- Google OAuth 2.0 Login

## Employee Management

- Create Employee Profile
- Retrieve Employee Profile
- Update Employee Profile
- Delete Employee Profile

## Department Management

- Create Department
- Retrieve Department
- Update Department
- Delete Department

## Device Management

- Create Device
- Retrieve Device
- Update Device
- Delete Device

## Activity Monitoring

- Ingest activity logs in bulk from CSV files (login, file access, device connect/disconnect, email events)
- Record individual live activity events
- Retrieve activity events, filterable by user or event type

## Behavioral Analytics & Risk Scoring

- Feature engineering from raw activity events (per-user behavioral baseline)
- Anomaly detection using Isolation Forest (unsupervised)
- Risk scoring with Low / Medium / High / Critical categorization
- On-demand model recomputation via API

## Frontend

- Login, Register, and Google OAuth login pages
- Sidebar navigation across all pages
- Live risk dashboard (category breakdown, top flagged users)
- Anomaly report page with pie chart, bar chart, full flagged-user table, and printable PDF export
- Employee management UI (view all, create/update/delete own profile)
- Department management UI (view all, create)
- Device management UI (create/update/delete own device)
- JWT auto-attached to all requests via Axios interceptor

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login using email and password |
| GET | `/profile` | Retrieve authenticated user profile |
| GET | `/auth/google/login` | Login using Google OAuth |

## Employee

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/employee/profile` | Create employee profile |
| GET | `/employee/profile` | Retrieve employee profile |
| PUT | `/employee/profile` | Update employee profile |
| DELETE | `/employee/profile` | Delete employee profile |
| GET | `/employee/all` | Retrieve all employee profiles |

## Department

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/department` | Create department |
| GET | `/department` | Retrieve all departments |
| PUT | `/department/{department_id}` | Update department *(planned — not yet implemented)* |
| DELETE | `/department/{department_id}` | Delete department *(planned — not yet implemented)* |

## Device

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/device` | Create device |
| GET | `/device` | Retrieve devices |
| PUT | `/device` | Update the current employee's device |
| DELETE | `/device` | Delete the current employee's device |

## Activity Monitoring

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/activity/event` | Record a single activity event |
| POST | `/activity/ingest` | Bulk-ingest activity events from a CSV file |
| GET | `/activity/events` | Retrieve recent activity events (filterable) |

## Behavioral Analytics

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/analytics/compute` | Run anomaly detection model and store fresh risk scores |
| GET | `/analytics/risk-scores` | Retrieve computed risk scores (filterable by category) |
| GET | `/analytics/risk-summary` | Get risk category counts for dashboard |


---

# Setup Instructions

## Clone the repository

```bash
git clone https://github.com/springboardmentor184-png/insider-threat-behavioral-intelligence-system.git
```

## Navigate to the backend directory

```bash
cd backend
```

## Create a virtual environment

```bash
python -m venv venv
```

## Activate the virtual environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

## Install dependencies

```bash
pip install -r requirements.txt
```

## Run the application

```bash
uvicorn app.main:app --reload
```


## Frontend Setup

Navigate to the frontend directory

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```


## API Documentation

Swagger UI

```
http://127.0.0.1:8000/docs
```

---

# Current Progress

## Completed

- User Authentication, JWT, RBAC, Google OAuth
- Employee Management Module (full listing + own-profile CRUD)
- Department Management Module (create + view all)
- Device Management Module (own-device CRUD)
- Activity Log Ingestion Pipeline (CERT and CMU datasets)
- React Frontend — Milestone 1 scope (auth, employee/department/device management, sidebar navigation)
- Behavioral Profiling Engine (feature engineering from activity data)
- Anomaly Detection (Isolation Forest model)
- Insider Risk Scoring Engine (Low/Medium/High/Critical)
- Risk Dashboard with live analytics
- Anomaly Report page (charts + printable PDF export)

## In Progress

- UEBA workflows (peer comparison, behavioral trend analysis)
- Threat investigation module

## Planned

- Role-specific dashboards (Analyst / SOC / Manager / Admin views)
- Notification & escalation system
- Docker deployment

---

# Contributors

**Aman Kumar**

B.Tech Information Technology  
Madhav Institute of Technology and Science (MITS), Gwalior

Infosys Springboard Virtual Internship

---

# License

This project is developed for educational purposes as part of the Infosys Springboard Virtual Internship.