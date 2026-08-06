# 🛡️ Insider Threat Behavioral Intelligence System (UEBA)

[![System Status](https://img.shields.io/badge/Milestones%201%2C%202%2C%203-Completed%20%26%20Verified-brightgreen.svg)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-blue.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-purple.svg)]()
[![ML Model](https://img.shields.io/badge/ML-IsolationForest%20UEBA-orange.svg)]()

> A production-grade **User and Entity Behavior Analytics (UEBA)** security platform for real-time insider threat detection, behavioral profiling, machine learning anomaly detection, weighted risk scoring, SOC case management, and automated security alert triggers.

---

## 📌 Complete Milestone Overview & Architecture

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