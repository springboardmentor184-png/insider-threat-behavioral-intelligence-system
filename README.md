# 🛡️ Insider Threat Behavioral Intelligence System (UEBA)

[![System Status](https://img.shields.io/badge/Milestones%201%2C%202%2C%203-Completed%20%26%20Verified-brightgreen.svg)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-blue.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-purple.svg)]()
[![ML Model](https://img.shields.io/badge/ML-IsolationForest%20UEBA-orange.svg)]()

---

## 🌟 Executive Project Overview

The **Insider Threat Behavioral Intelligence System** is an enterprise-grade **User and Entity Behavior Analytics (UEBA)** platform designed to proactively detect, quantify, and mitigate malicious or compromised insider activities within an organization before data exfiltration or system compromise occurs.

By ingesting multi-vector activity logs (logons, USB devices, confidential file access, email attachments, and HTTP web traffic), the platform establishes dynamic statistical baselines for every employee using an unsupervised **IsolationForest Machine Learning model**. Deviations from historical baselines and department peer averages feed into a **35-25-20-10-10 Weighted Risk Engine**, computing real-time risk scores (0–100%).

When a monitored individual's risk score reaches **≥ 75.0% (Critical Risk)**, the system automatically triggers an immediate **Administrator Email Security Alert** featuring detailed incident descriptions, threat vectors, and recommended SOC actions, while auto-initializing a **Threat Investigation Case File** for Security Operations Center (SOC) analysts.

---

## 📁 Complete Project Directory & File Structure

```text
insider-threat-system/
│
├── backend/                            # FastAPI Python Backend Application
│   ├── app/
│   │   ├── analytics/                  # UEBA & Threat Intelligence Analytics Engines
│   │   │   ├── alert_engine.py         # Automated Security Alert Queue Generator
│   │   │   ├── detector.py             # IsolationForest Machine Learning Anomaly Detector
│   │   │   ├── risk_engine.py          # 35-25-20-10-10 Weighted Risk Scoring Engine
│   │   │   └── ueba_engine.py          # Department Peer Benchmarking & Baseline Profiler
│   │   │
│   │   ├── core/                       # Security & Communication Infrastructure
│   │   │   ├── config.py               # Pydantic Application Settings & Environment Schema
│   │   │   ├── dependencies.py         # JWT Token & OAuth2 Security Dependencies
│   │   │   ├── email_service.py        # Gmail SMTP TLS Email Dispatcher & HTML Templates
│   │   │   └── security.py             # Password Hashing (bcrypt) & JWT Generation
│   │   │
│   │   ├── models/                     # SQLAlchemy Database Schema Models
│   │   │   └── models.py               # User, Employee, ActivityLog, Anomaly, RiskScore, Alert, Case
│   │   │
│   │   ├── routers/                    # RESTful API Endpoints
│   │   │   ├── activities.py           # Activity Logs Ingestion & CMU CERT Stream API
│   │   │   ├── alerts.py               # Security Alert Queue Management API
│   │   │   ├── analytics.py            # Behavioral Anomaly Cockpit API
│   │   │   ├── auth.py                 # Login, Register, 6-Digit OTP & Password Reset API
│   │   │   ├── employees.py            # Monitored Personnel Profiles & Department API
│   │   │   ├── investigations.py       # Threat Investigation Case Files API
│   │   │   └── risk.py                 # Dynamic Recalculation & Leaderboard API
│   │   │
│   │   ├── schemas/                    # Pydantic Data Validation Schemas
│   │   │   └── schemas.py              # Request & Response Payload DTO Schemas
│   │   │
│   │   ├── database.py                 # SQLAlchemy Session & Engine Initializer
│   │   └── main.py                     # FastAPI Application Initialization & Middleware
│   │
│   ├── ingest_cert_1250_entries.py     # CERT Dataset Ingestion Pipeline (1,250 Entries)
│   ├── sync_all_cert_employees.py      # CERT Personnel Synchronization Script (708 Users)
│   ├── ingest_john_doe_high_risk.py    # High-Risk Threat Case Ingestion Script (Score 87%)
│   ├── .env.example                    # Environment Configuration Template
│   ├── requirements.txt                # Python Backend Package Dependencies
│   └── insider_threat.db               # SQLite Local Relational Database
│
├── frontend/                           # React 18 & Vite Frontend Web Application
│   ├── src/
│   │   ├── components/                 # Reusable UI Components
│   │   │   ├── Charts.jsx              # Pure SVG Interactive Pie, Donut & Bar Charts
│   │   │   └── Navbar.jsx              # Modern Dark Navigation Header
│   │   │
│   │   ├── pages/                      # Application Route Views & Dashboards
│   │   │   ├── ActivityLogs.jsx        # Telemetry Stream & CERT Dataset Control Center
│   │   │   ├── AnalyticsCockpit.jsx    # Behavioral Anomaly Cockpit & UEBA Charts
│   │   │   ├── Dashboard.jsx           # Main Executive Overview Dashboard
│   │   │   ├── ForgotPassword.jsx      # 6-Digit OTP Password Reset Request View
│   │   │   ├── InvestigationDetails.jsx# SOC Case Investigation View & Timeline
│   │   │   ├── InvestigationList.jsx   # Threat Investigation Case Directory
│   │   │   ├── Login.jsx               # Operator Dual Authentication View
│   │   │   ├── Register.jsx            # Operator Registration View
│   │   │   ├── ResetPassword.jsx       # Password Update Form View
│   │   │   └── RiskAnalytics.jsx       # Risk Leaderboard, Alerts Queue & Peer Comparison
│   │   │
│   │   ├── services/                   # API Axios Services
│   │   │   └── api.js                  # Axios HTTP Client with Bearer Token Interceptor
│   │   │
│   │   ├── App.jsx                     # React Router Navigation & Protected Routes
│   │   ├── index.css                   # Glassmorphic CSS Tokens & Theme Variables
│   │   └── main.jsx                    # React Application Entry Point
│   │
│   ├── index.html                      # HTML5 Root Document
│   ├── package.json                    # Node.js Frontend Dependencies & Scripts
│   └── vite.config.js                  # Vite Build Configuration & API Proxy Rules
│
├── README.md                           # Comprehensive System Documentation
└── .gitignore                          # Git Version Control Exclusions Rules File
```

---

## 📌 Milestone Capabilities Breakdown

### 🔷 Milestone 1: Core Identity, Telemetry Data & RBAC Foundation
* 👥 **Monitored Personnel Directory**: Synchronized dataset of 708 monitored personnel profiles across organizational departments (Engineering, IT, HR, Finance, Executive).
* 📋 **Multi-Vector Telemetry Log Ingestion**: 1,250 real activity entries across 5 log vectors:
  * `Logon Events`: Interactive logons, unlock events, failed authentication attempts.
  * `Device Telemetry`: Removable USB media mounts, external drive connections.
  * `File Activity`: Confidential file access, PII downloads, payroll exports.
  * `Email Logs`: External attachments, mass distribution lists.
  * `HTTP Web Traffic`: External cloud uploads, S3 buckets, unapproved web apps.
* 🔐 **Authentication & Access Control (RBAC)**:
  * Role-Based Access Control (`Admin`, `Analyst`, `Auditor`, `Employee`).
  * Dual Sign-In capability (Sign in via **Corporate Email** or **Username**).
  * Password security powered by `bcrypt` hashing and 60-minute JWT bearer tokens.

---

### 🔷 Milestone 2: UEBA Machine Learning Engine & Behavioral Baselines
* 🧠 **Unsupervised Machine Learning Model (`IsolationForest`)**:
  * Trains on multi-dimensional telemetry vectors to compute continuous anomaly scores (`0.0` to `1.0`).
  * Identifies statistical outliers, off-hours spikes, and anomalous data access patterns.
* 📊 **Behavioral Baselines**:
  * Tracks historical metric averages for every employee:
    * Average Daily Logins
    * Average Daily Downloads / Uploads (MB)
    * USB Removable Storage Mount Frequency
    * Night & Off-Hours Activity Ratio (`0.0` to `1.0`)
* 🏢 **Department Peer Benchmarking**:
  * Evaluates individual activity metrics against department peer averages to detect unauthorized privilege abuse.

---

### 🔷 Milestone 3: Insider Risk Scoring Engine, Threat Case Management & Automated Alerts
* 📊 **35-25-20-10-10 Weighted Risk Scoring Engine**:
  * Dynamically computes total risk score (`0.0` to `100.0%`) using weighted criteria:
    * 🧠 **Behavioral Anomalies (35%)**: IsolationForest anomaly density & baseline deviations.
    * 🔑 **Privilege Misuse (25%)**: Shadow file access, command execution keywords (`/etc/shadow`, `sudo su - root`).
    * 💾 **Data Access Violations (20%)**: Bulk file downloads, PII exports, payroll file access.
    * ⏰ **Access Pattern Deviations (10%)**: Off-hours logon ratios & night activity bursts.
    * 📜 **Historical Security Events (10%)**: Prior security policy breaches & USB mounting telemetry.
  * Risk Levels: `Low Risk` (0-25%), `Medium Risk` (25-50%), `High Risk` (50-75%), `Critical Risk` (75-100%).
* 🛡️ **Threat Investigations Case Management Module**:
  * Auto-creates open SOC threat investigation cases for high-risk personnel.
  * Interactive case timelines, evidence payloads, command history, and analyst status workflows (`Open`, `In Progress`, `Resolved`, `Closed`).
* 🔔 **Automated Security Alert Management Queue**:
  * Alert severity classification (`Informational`, `Low`, `Medium`, `High`, `Critical`).
  * Interactive filters and 1-click SOC analyst assignment modal.
* 📧 **Automated Critical Risk Email Notifications (Score ≥ 75.0%)**:
  * Automatically dispatches rich HTML email alerts to the Administrator (`ADMIN_EMAIL`) whenever an employee's Risk Score reaches **≥ 75.0%**. Includes detailed incident descriptions and recommended SOC actions.
* 🔐 **6-Digit OTP Password Reset Flow**:
  * Secure 2-step password reset workflow requiring a 6-digit numeric OTP code (`POST /api/auth/send-otp` and `POST /api/auth/verify-otp`).
* 📈 **Interactive Pure SVG Chart Component Library**:
  * Custom interactive SVG Pie Charts, Donut Graphs, and Bar Charts with hover tooltips and dynamic legends.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend Framework** | Python 3.11, FastAPI, Uvicorn |
| **Database & ORM** | SQLite / PostgreSQL, SQLAlchemy ORM |
| **Machine Learning** | scikit-learn (`IsolationForest`), NumPy, Pandas |
| **Email Service** | Python `smtplib`, `email.mime`, `python-dotenv` |
| **Security & Auth** | Passlib (bcrypt), PyJWT (JWT tokens), Pydantic v2 |
| **Frontend Framework** | React 18, Vite 5, React Router v6, Axios |
| **UI & Styling** | Vanilla CSS Glassmorphic Design Token System, Lucide React Icons |

---

## ⚙️ Environment Setup & Running Locally

### Prerequisites
* **Python**: `3.10` or higher
* **Node.js**: `v18.0.0` or higher

---

### Backend Setup

1. Open terminal and navigate to `backend`:
   ```bash
   cd backend
   ```

2. Create virtual environment & activate:
   ```bash
   python -m venv venv
   # PowerShell:
   .\venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure `.env` file (copied from `.env.example`):
   ```env
   SECRET_KEY=insider_threat_behavioral_intelligence_system_secret_key_2026
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   DATABASE_URL=sqlite:///./insider_threat.db

   # SMTP Email Credentials (for OTP & Critical Risk Alerts)
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-google-app-password
   ADMIN_EMAIL=your-email@gmail.com
   ```

5. Start Backend Server:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```
   FastAPI Documentation: **`http://localhost:8000/docs`**

---

### Frontend Setup

1. Open terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Development Server:
   ```bash
   npm run dev -- --port 3000
   ```
   Application UI: **`http://localhost:3000`**

---

## 📄 License
This project is licensed under the MIT License.