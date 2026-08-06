# Insider Threat Behavioral Intelligence System (ITBIS)

ITBIS is an enterprise-grade, AI-powered security platform designed to identify insider threat behaviors and organizational risk posture by analyzing employee activity logs. It continuously monitors logons, file accesses, USB device connections, email communications, and web traffic.

The platform is designed around the **CERT Insider Threat Dataset v6.2** and **LANL Cyber Security Dataset**, enabling security operations centers (SOCs) to visualize threat feeds, detect anomalies, compute 5-factor weighted risk scores, perform UEBA peer analysis, manage incident cases, and dispatch real-time security email alerts.

---

## Technical Architecture & Core Stack

- **Backend Framework**: FastAPI (Python 3.10+) with async endpoints & Pydantic V2 schemas
- **Database Layer**: MySQL 8.0 with SQLAlchemy 2.0 Async ORM (`aiomysql`), pool-recycle connection management
- **Frontend Layer**: Vanilla HTML5, CSS3, JavaScript (ES6+), Tailwind CSS CDN, Chart.js for data visualizations
- **Authentication**: JWT HttpOnly Access & Refresh Token cookies, Real Google OAuth 2.0, Google Authenticator TOTP 2FA
- **Security Notification Service**: Async SMTP transport (`smtp.gmail.com:587`) supporting rich HTML alert emails
- **Export & Reporting**: OpenPyXL server-side Excel (`.xlsx`) generation, client-side PDF export, JSON serialization
- **Automated Test Suite**: Pytest + HTTPX AsyncClient with isolated in-memory SQLite database

---

## Getting Started

### 1. Prerequisites
- **Python**: Version 3.10 or higher
- **MySQL Database**: Version 8.0+ running on `localhost:3306` with database named `itbis`

### 2. Installation & Setup

1. **Clone the repository** and navigate into the workspace:
   ```bash
   cd insider-threat-behavioral-intelligence-system
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # PowerShell (Windows):
   .\venv\Scripts\Activate.ps1
   # Linux / macOS:
   source venv/bin/activate
   ```

3. **Install required dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables (`.env`)**:
   Create a `.env` file in the root directory:
   ```ini
   # MySQL Database Connection
   DATABASE_URL=mysql+aiomysql://root:password@127.0.0.1:3306/itbis

   # JWT Authentication
   SECRET_KEY=itbis-dev-secret-key-change-in-production-2026
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30

   # Google OAuth 2.0 Credentials
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/oauth2/google/callback

   # SMTP Real-Time Email Notifications Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=itbis.alerts@gmail.com
   SMTP_PASSWORD=sgnj amoo shti hxnv
   EMAILS_FROM_EMAIL=itbis.alerts@gmail.com
   EMAIL_NOTIFICATIONS_ENABLED=True
   ```

---

## Database Initialization & Dataset Ingestion

1. **Create Database in MySQL**:
   ```sql
   CREATE DATABASE itbis;
   ```

2. **Import CERT Insider Threat Dataset v6.2 (14,221 Records)**:
   ```bash
   python -m backend.utils.import_dataset
   ```

3. **Seed Default User Roles & Accounts**:
   ```bash
   python -m backend.utils.seed_data
   ```

### Default Credentials Table

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@itbis.com` | `admin123` | Full Platform Access, User Management, System Config |
| **Security Analyst** | `analyst@itbis.com` | `analyst123` | Anomaly Detection, Activity Logs, Incident Management |
| **SOC Engineer** | `soc@itbis.com` | `soc123` | Real-time Dashboard, Log Stream, UEBA Analytics |
| **Security Manager** | `manager@itbis.com` | `manager123` | Executive Reports, Risk Metrics, Incident Escalation |

---

## Completed Milestones & System Progress

### Milestone 1: Authentication, Access Control & User Portal (Completed)
- **Module 1: User Authentication & JWT Session Management**:
  - Secure Bcrypt password hashing (`passlib[bcrypt]`).
  - HttpOnly cookie storage (`access_token`, `refresh_token`) preventing XSS token theft.
  - Automatic sliding window token refresh mechanism.
- **Module 2: Real Google OAuth 2.0 Sign-In Integration**:
  - Google Sign-In redirect & OAuth code authorization flow.
  - Automatic user provisioning and profile synchronization.
- **Module 3: Google Authenticator TOTP Multi-Factor Authentication (MFA)**:
  - QR Code generation (`pyotp` + `qrcode`) for mobile authenticator scanning.
  - Two-factor challenge on login with 6-digit TOTP validation.
- **Module 4: Admin Access Control & Self-Registration Approvals**:
  - Self-registration queue requiring Administrator approval before account activation.
  - Admin control panel (`/admin/users`) for activating/deactivating accounts and updating roles.

---

### Milestone 2: Behavioral Analytics & Anomaly Detection (Completed)
- **Behavioral Profiler Engine**:
  - Computes 30-day statistical baselines per employee (`EmployeeBaseline` model).
  - Tracks average daily logons, after-hours logon ratios, weekend logons, daily USB connections, daily file touches, daily emails sent, and cloud upload ratios.
- **Anomaly Detection Models (5 Categories)**:
  - *Unusual Login Time*: Off-hours/weekend logons for users with low historical after-hours ratios.
  - *Unauthorized Access Attempts*: Logons to workstations outside common profile whitelists.
  - *Suspicious Device Usage*: USB storage connections occurring after-hours or by non-USB users.
  - *Abnormal Data Download*: Daily file action volume exceeding 3x standard deviation ($Z\text{-score} > 3.0$).
  - *Exfiltration Indicators*: Classified leak site visits (WikiLeaks), large external email attachments ($>50\text{ MB}$), and cloud upload spikes.

---

### Milestone 3: Risk Scoring, UEBA & Threat Investigation (Completed)

Milestone 3 delivers the complete insider risk scoring, UEBA intelligence, incident case management, real-time alert notifications, and executive reporting modules.

#### 1. Module 6: Insider Risk Scoring Engine
- Implements a 5-factor weighted risk scoring algorithm ($0 - 100$ scale):
  $$\text{Insider Risk Score} = (35\% \times \text{Behavioral Anomalies}) + (25\% \times \text{Privilege Misuse}) + (20\% \times \text{Data Access}) + (10\% \times \text{Access Patterns}) + (10\% \times \text{History})$$
- Employee Risk Categorization:
  - **Low Risk**: $0 - 29$
  - **Medium Risk**: $30 - 59$
  - **High Risk**: $60 - 84$
  - **Critical Risk**: $85 - 100$

#### 2. Module 7 & 9: Threat Investigation & Incident Management
- **Incident Case Queue**: Auto-generated case tracking (`INC-2026-001`, `INC-2026-002`, etc.) with status flow (*Open*, *In Progress*, *Escalated*, *Resolved*, *Closed*).
- **Unified Activity Timeline**: Merges logon, USB device, file touch, email, web browse, and anomaly alert events chronologically into a single inspection stream for target employees.
- **Evidence Tagging**: Analysts can attach evidence notes and tag specific events or anomalies to cases.
- **Direct Case Auto-Creation & URL Redirection**: When clicking investigation links in email alerts (`http://localhost:8000/investigation?employee_id=MPM0220`), the portal automatically creates/selects the employee's case and streams their activity timeline without empty screens.

#### 3. Module 8: UEBA Intelligence Engine
- **Department Peer Group Baselines**: Calculates peer group baseline averages across departments (*Software Engineering*, *Sales*, *IT*, *Finance*, etc.) to identify peer outliers.
- **30-Day Threat Risk Prediction**: Forecasts employee risk trajectory (*Increasing*, *Stable*, *Decreasing*) based on 30-day velocity metrics.

#### 4. Module 10: Multi-Role Security Dashboards
- Executive dashboard with role-based perspective switcher (*Security Analyst*, *SOC Engineer*, *Security Manager*, *Administrator*).
- Interactive Chart.js visualizations for activity breakdown, top risk suspects, and baseline comparative bar plots.

#### 5. Module 11: Real-Time Monitoring & Email Notification System
- **Real-Time Notification Drawer**: Topbar bell icon with live unread counter polling every 10 seconds.
- **SMTP Email Alert Transport Engine** ([email_service.py](file:///d:/insider-threat-behavioral-intelligence-system/backend/services/email_service.py)):
  - Dispatches high-priority HTML emails via Google Gmail SMTP (`itbis.alerts@gmail.com:587`) for `Critical`, `High`, and `Medium` anomalies.
  - **Full Individual Employee Anomaly Reports**: Generates multi-section HTML reports for specific employees containing risk badges, anomaly tables, host PCs, technical explanations, and direct CTA investigation links.

#### 6. Module 12: Reports & Export System
- **Excel (.xlsx) Export**: Server-side formatted spreadsheets powered by OpenPyXL across 5 categories (*Insider Threat*, *Behavioral Analytics*, *Investigation*, *Compliance Audit*, *Risk Assessment*).
- **PDF & JSON Export**: One-click client-side PDF generation and structured JSON downloads across all dashboard views.

---

## Automated Testing Suite (25 Tests)

Run the full testing suite using `pytest`:

```bash
$env:PYTHONPATH="."; .\venv\Scripts\python.exe -m pytest tests/ -v
```

**Passing Test Coverage (25 Passed)**:
- Bcrypt password hashing & authentication tokens
- User self-registration & admin approval workflows
- Google OAuth 2.0 & TOTP 2FA setup/verification
- Behavioral profiler baseline computation algorithms
- Z-score thresholding & anomaly detection rules
- Weighted 5-factor risk scoring engine & categorization
- UEBA peer group comparison & 30-day threat predictions
- Threat investigation case lifecycle & activity timeline correlation
- In-app notification center & SMTP email alert dispatcher
- Multi-format Excel (`.xlsx`), PDF, and JSON report exporters

---

## Running the Application

1. **Start the FastAPI Server**:
   ```bash
   $env:PYTHONPATH="."
   .\venv\Scripts\uvicorn.exe backend.main:app --reload --port 8000
   ```

2. **Access the Platform**:
   - **Login Portal**: [http://localhost:8000/login](http://localhost:8000/login)
   - **Main Dashboard**: [http://localhost:8000/dashboard](http://localhost:8000/dashboard)
   - **Threat Investigation Portal**: [http://localhost:8000/investigation](http://localhost:8000/investigation)
   - **UEBA Analytics Hub**: [http://localhost:8000/ueba](http://localhost:8000/ueba)
   - **Executive Reports & Export**: [http://localhost:8000/reports](http://localhost:8000/reports)
   - **Admin User Management**: [http://localhost:8000/admin/users](http://localhost:8000/admin/users)
