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

## Hybrid Threat-Detection Models Architecture

The platform uses a hybrid threat-detection architecture combining **Statistical Anomaly Detection Models** and **Signature-based Pattern-Matching Heuristic Models**.

Rather than using a single static threshold for all employees, the models establish individual profiles. This significantly reduces false positives while catching subtle deviations.

---

### 1. Statistical Outlier Detection Model (Daily File Actions)
- **What it is used for**: Detecting abnormal volumes of data touch (e.g., file access spikes, bulk downloads, mass reading).
- **How it works**: Uses standard deviation thresholding ($Z$-score):
  $$\text{Actual Daily File Touches} > \mu + 3\sigma$$
  where:
  - $\mu$ = the employee's average daily file touches.
  - $\sigma$ = the employee's standard deviation of daily file touches.
- **Why it was chosen**: A one-size-fits-all threshold fails in enterprises. A software engineer might touch 300 source code files daily, whereas an HR administrator touches 5. If the HR administrator suddenly accesses 100 files, this model flags the abnormality immediately, while leaving the software engineer unflagged.

---

### 2. Relative Frequency Probability Model (Unusual Login Hours)
- **What it is used for**: Identifying logins occurring at suspicious, out-of-schedule hours (e.g., midnight or weekends).
- **How it works**: Compares the logon time and date against the employee's historical habits. It calculates the employee's historical ratio of after-hours logons (6 PM – 6 AM) and weekend logons. It triggers an alert if a login occurs after-hours or on weekends **AND** the employee's historical after-hours ratio is $< 15\%$.
- **Why it was chosen**: Standard security systems flag any logon at 2 AM. However, night-shift SOC engineers or international managers log on then regularly. This model accommodates normal off-hours shifts but flags 9-to-5 employees who log on during unusual night windows.

---

### 3. Access Vector Control Whitelisting Model (Unauthorized Device Logins)
- **What it is used for**: Detecting lateral movement or credential theft where an attacker logs into a machine they shouldn't access.
- **How it works**: Matches the current host machine ID against the employee's set of commonly accessed PCs:
  $$\text{Logon PC} \notin \text{Common PCs set}$$
  The "Common PCs set" whitelists the top machines an employee has historically logged into (e.g., `{"PC-0122", "PC-0125"}`).
- **Why it was chosen**: Employees usually log into their assigned workstation. Logging into a server or another department's PC is a high-indicator sign of privilege misuse or lateral threat movement.

---

### 4. Signature-based Threat Models (Data Exfiltration & Flight Risks)
- **What it is used for**: Catching explicit threat patterns defined by security guidelines (e.g., WikiLeaks visits, cloud storage uploads, external email attachments).
- **How it works**: Matches actions against signature rule sets:
  - **Leak Sites**: Compares URL domains against classified leak site databases (e.g., `wikileaks.org`).
  - **Cloud Exfiltration**: Flags daily visits to cloud storage sites (e.g., `dropbox.com`, `drive.google.com`) that exceed $3\times$ the employee's baseline cloud visit frequency.
  - **Email Exfiltration**: Flags email attachments sent to external email addresses ($\neq \text{"@dtaa.com"}$) exceeding $50\text{ KB}$.
  - **Flight Risk (Job Searches)**: Detects visits to recruitment domains (e.g., `indeed.com`) for employees with no historical job search baselines.
- **Why it was chosen**: These are deterministic threat actions. Regardless of baselines, an employee uploading documents to Dropbox or visiting WikiLeaks represents an immediate data exfiltration risk that needs an explicit analyst notification.

---

### 5. 5-Factor Weighted Risk Scoring & UEBA Predictive Models

In addition to vector detection, the system aggregates threat signals into an overall workforce posture:

- **5-Factor Composite Risk Score Formula**:
  $$\text{Insider Risk Score} = (35\% \times \text{Behavioral Anomalies}) + (25\% \times \text{Privilege Misuse}) + (20\% \times \text{Data Access}) + (10\% \times \text{Access Patterns}) + (10\% \times \text{History})$$

- **UEBA Risk Velocity & 30-Day Predictive Trajectory**:
  $$\text{Risk Velocity} = \frac{\Delta \text{Risk Score}}{\Delta t} = \frac{\text{Risk Score}_{t} - \text{Risk Score}_{t-30\text{d}}}{30\text{ days}}$$
  Forecasts 30-day future risk direction (*Increasing*, *Stable*, *Decreasing*) based on 30-day velocity acceleration.



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

   # Google OAuth 2.0 Credentials (Replace with your actual credentials)
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/oauth2/google/callback

   # SMTP Real-Time Email Notifications Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=itbis.alerts@gmail.com
   SMTP_PASSWORD=your-app-password
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

### Default Access Credentials

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

### Milestone 3: Risk Scoring & Threat Investigation (Completed)

Milestone 3 delivers the complete insider risk scoring, UEBA intelligence, incident case management, real-time alert notifications, and executive reporting modules.

#### Milestone 3 Core Tasks Completed:
- ✅ **Implement Insider Risk Scoring Engine**: Developed 5-factor weighted risk scoring model and automated employee risk categorization (*Low*, *Medium*, *High*, *Critical*).
- ✅ **Build UEBA Intelligence Workflows**: Implemented departmental peer group baseline comparison algorithms and 30-day threat risk trajectory forecasting.
- ✅ **Develop Threat Investigation Modules**: Created incident case tracking (`INC-2026-XXX`), unified activity timeline stream, and evidence tagging/note attachment workflows.
- ✅ **Generate Risk Analytics**: Built multi-dimensional risk trend monitoring, threat prioritization, and executive analytics reports.
- ✅ **Create Security Dashboards**: Built multi-role dashboards with perspective switching for *Security Analyst*, *SOC Engineer*, *Security Manager*, and *Administrator*.

#### Milestone 3 Core Outcomes Achieved:
- 🎯 **Insider Risk Scoring Engine Operational**: 5-factor weighted scoring model fully functional across all workforce logs.
- 🎯 **Investigation Workflows Functional**: Incident creation, timeline correlation, evidence tagging, and direct email link auto-selection fully operational.
- 🎯 **Risk Analytics Dashboards Completed**: Multi-role security dashboards, Chart.js visualizations, real-time notification drawer, and multi-format (Excel, PDF, JSON) reporting completed.

---

#### Implemented Modules (Modules 5 - 12):

1. **Module 5: Anomaly Detection Engine**:
   - Classifies anomalies across 5 categories with severity levels (*Informational*, *Low*, *Medium*, *High*, *Critical*).

2. **Module 6: Insider Risk Scoring Engine**:
   - Implements a 5-factor weighted risk scoring algorithm ($0 - 100$ scale):
     $$\text{Insider Risk Score} = (35\% \times \text{Behavioral Anomalies}) + (25\% \times \text{Privilege Misuse}) + (20\% \times \text{Data Access}) + (10\% \times \text{Access Patterns}) + (10\% \times \text{History})$$
   - Categorizes employees into *Low Risk* ($<30$), *Medium Risk* ($30-59$), *High Risk* ($60-84$), and *Critical Risk* ($85-100$).

3. **Module 7 & 9: Threat Investigation & Incident Management**:
   - **Incident Case Queue**: Auto-generated case tracking (`INC-2026-001`, `INC-2026-002`, etc.) with status flow (*Open*, *In Progress*, *Escalated*, *Resolved*, *Closed*).
   - **Unified Activity Timeline**: Merges logon, USB device, file touch, email, web browse, and anomaly alert events chronologically into a single inspection stream for target employees.
   - **Evidence Tagging**: Analysts can attach evidence notes and tag specific events or anomalies to cases.
   - **Direct Case Auto-Creation & URL Redirection**: When clicking investigation links in email alerts (`http://localhost:8000/investigation?employee_id=MPM0220`), the portal automatically creates/selects the employee's case and streams their activity timeline without empty screens.

4. **Module 8: UEBA Intelligence Engine**:
   - **Department Peer Group Baselines**: Calculates peer group baseline averages across departments (*Software Engineering*, *Sales*, *IT*, *Finance*, etc.) to identify peer outliers.
   - **30-Day Threat Risk Prediction**: Forecasts employee risk trajectory (*Increasing*, *Stable*, *Decreasing*) based on 30-day velocity metrics.

5. **Module 10: Multi-Role Security Dashboards**:
   - Executive dashboard with role-based perspective switcher (*Security Analyst*, *SOC Engineer*, *Security Manager*, *Administrator*).
   - Interactive Chart.js visualizations for activity breakdown, top risk suspects, and baseline comparative bar plots.

6. **Module 11: Real-Time Monitoring & Email Notification System**:
   - **Real-Time Notification Drawer**: Topbar bell icon with live unread counter polling every 10 seconds.
   - **SMTP Email Alert Transport Engine** ([email_service.py](file:///d:/insider-threat-behavioral-intelligence-system/backend/services/email_service.py)):
     - Dispatches high-priority HTML emails via Google Gmail SMTP (`itbis.alerts@gmail.com:587`) for `Critical`, `High`, and `Medium` anomalies.
     - **Full Individual Employee Anomaly Reports**: Generates multi-section HTML reports for specific employees containing risk badges, anomaly tables, host PCs, technical explanations, and direct CTA investigation links.

7. **Module 12: Reports & Export System**:
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
