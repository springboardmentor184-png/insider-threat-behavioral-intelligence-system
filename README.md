# 🛡️ Insider Threat Behavioral Intelligence System (UEBA & Risk Engine)

[![Milestone 3](https://img.shields.io/badge/Milestone--3-Completed%20%26%20Verified-brightgreen.svg)]()
[![Framework](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-blue.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-purple.svg)]()
[![ML Model](https://img.shields.io/badge/ML-IsolationForest%20UEBA-orange.svg)]()

> A production-grade **User and Entity Behavior Analytics (UEBA)** platform for real-time insider threat detection, weighted risk scoring, automated SOC alerts, case management investigations, and critical risk email notification triggers.

---

## 🚀 Milestone 3 Feature Highlights & System Modules

### 1. 📊 Weighted Insider Risk Engine (35-25-20-10-10 Architecture)
* **Dynamic Recalculation Engine**: Evaluates monitored personnel telemetry across 5 core threat vectors:
  * 🧠 **Behavioral Anomalies (35%)**: IsolationForest anomaly density & baseline deviations.
  * 🔑 **Privilege Misuse (25%)**: Shadow file access, command execution keywords (`/etc/shadow`, `sudo su - root`).
  * 💾 **Data Access Violations (20%)**: Bulk file downloads, PII exports, payroll file access.
  * ⏰ **Access Pattern Deviations (10%)**: Off-hours logon ratios & night activity bursts.
  * 📜 **Historical Security Events (10%)**: Prior security policy breaches & USB mounting telemetry.
* **Risk Categorization**:
  * `0.0 - 25.0%`: Low Risk 🟢
  * `25.1 - 50.0%`: Medium Risk 🟡
  * `50.1 - 74.9%`: High Risk 🟧
  * `75.0 - 100.0%`: **Critical Risk 🔴** *(Triggers Automated Email Notification)*

---

### 2. 📧 Automated Critical Risk Email System (Score ≥ 75.0%)
* **Automated SMTP Email Alerts**: Automatically dispatches a rich HTML email brief to the Security Administrator (`ADMIN_EMAIL`) whenever an employee's Insider Risk Score reaches **≥ 75.0%**.
* **Incident Description & Threat Vectors**: Includes detailed incident breakdown, exfiltration probability, predicted threat vector, and direct 1-click SOC case link.
* **Duplicate Prevention & Logging**: Tracks `last_notified_risk_score` and `last_notified_at` to ensure alerts are dispatched on scan runs and critical escalations.

---

### 3. 🔐 6-Digit OTP Password Reset Flow
* **Multi-Factor OTP Verification**: Secure 2-step password reset workflow requiring a 6-digit numeric OTP code (`POST /api/auth/send-otp`).
* **Email Delivery**: Sends OTP verification codes directly to registered user email addresses via Gmail SMTP TLS connection.
* **Secure Token Handling**: Verifies 6-digit OTP code before granting 15-minute single-use password update tokens (`POST /api/auth/verify-otp`).

---

### 4. 🛡️ Threat Investigations Module (SOC Case Management)
* **Automated Case Generation**: Auto-creates open threat investigation case files for high-risk personnel.
* **Interactive Timelines & Evidence Logs**: Render chronologically ordered telemetry events, suspicious IP addresses, and command executions.
* **Analyst Workflows**: Support case status updates (`Open`, `In Progress`, `Resolved`, `Closed`), severity toggles, and analyst assignment.

---

### 5. 🔔 Automated Security Alert Management Queue
* **Alert Severity Classification**: Categorizes alerts into `Informational`, `Low`, `Medium`, `High`, and `Critical`.
* **Interactive Filters & Assignments**: Filter alerts by severity/status and assign SOC analysts in 1 click.

---

### 6. 📈 Interactive Pure SVG Chart Library
* **Zero External Chart Dependencies**: Built custom SVG `PieChartComponent`, `DonutChartComponent`, and `BarChartComponent` in [`Charts.jsx`](frontend/src/components/Charts.jsx).
* **Interactive Tooltips & Legends**: Dynamic hover effects for Department UEBA risk averages and anomaly severity distributions.

---

### 7. 📁 CMU CERT Insider Threat Real Dataset Integration
* **1,250 Real Telemetry Entries**: Extracted across 5 activity log vectors (`logon.csv`, `device.csv`, `file.csv`, `email.csv`, `http.csv`).
* **708 Monitored Personnel Profiles**: Synchronized CMU CERT user handles into system database with full pagination and risk breakdown cards.

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

## ⚙️ Environment Setup & Installation Guide

### Prerequisites
* **Python**: `3.10` or higher
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/insider-threat-system.git
cd insider-threat-system
```

---

### Step 2: Backend Setup & Configuration

1. Navigate to `backend` directory:
   ```bash
   cd backend
   ```

2. Create virtual environment & activate:
   ```bash
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` configuration file:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your settings:
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

5. Run Backend Server:
   ```bash
   uvicorn app.main:app --port 8000 --reload
   ```
   FastAPI Swagger API Documentation will be available at: **`http://localhost:8000/docs`**

---

### Step 3: Frontend Setup

1. Open a new terminal and navigate to `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Run Frontend Development Server:
   ```bash
   npm run dev -- --port 3000
   ```
   Application UI will be available at: **`http://localhost:3000`**

---

## 🔐 Security & Git Hygiene (`.gitignore`)

The project `.gitignore` is configured to prevent committing secret keys, API credentials, or local environment files:

* ✅ `.env` and `backend/.env` are strictly excluded from git tracking.
* ✅ Virtual environments (`venv/`, `node_modules/`) are excluded.
* ✅ SQLite databases (`insider_threat.db`) and large dataset archives (`archive.zip`) are excluded.

---

## 📤 How to Push Milestone 3 to Your GitHub Branch

Follow these clean steps to push your completed Milestone 3 work to your GitHub branch:

```bash
# 1. Check repository status
git status

# 2. Stage all updated source files
git add .

# 3. Commit Milestone 3 release
git commit -m "feat(milestone-3): Complete Weighted Risk Engine, Threat Investigations, Alert Queue, OTP Reset & Critical Risk Email Alerts"

# 4. Push to your GitHub branch
git push origin your-branch-name
```

---

## 📄 License
This project is licensed under the MIT License - see the `LICENSE` file for details.