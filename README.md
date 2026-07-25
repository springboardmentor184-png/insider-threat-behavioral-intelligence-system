# Insider Threat Behavioral Intelligence System
>
---
## 1. Project Overview
An **Insider Threat Behavioral Intelligence System** is an AI-powered security monitoring platform built to protect organizations from internal security breaches. Unlike traditional perimeter security systems (firewalls, IDS) that shield against external hacks, this system focus-monitors internal accounts, servers, and employees to detect unauthorized activities or account misuse.
### Purpose of Detecting & Managing Insider Threats
* **Prevent Data Exfiltration**: Identify early indicators of data theft, such as excessive file downloads, unauthorized network data transfers, or database exports.
* **Stop Privilege Abuse**: Audit accounts trying to access confidential databases, servers, or file systems outside their scope of work.
* **Detect Compromised Credentials**: Notice anomalies in user login behavior (such as logins at unusual hours or from unrecognized devices).
---
## 2. Objectives

* [x] **Establish the Environment (Milestone 1)**: Set up backend framework (FastAPI) and responsive frontend (React + Vite) with strict configuration management.
* [x] **Secure Access & Audits (Milestone 1)**: Implement secure JSON Web Token (JWT) local authentication alongside Google OAuth2 Single Sign-On (SSO) under a strict Role-Based Access Control (RBAC) policy.
* [x] **Asset & Identity Mapping (Milestone 1)**: Build a unified profile manager to map company employees to their corporate physical devices, access privileges, and software assets.
* [x] **Behavioral Baseline Profiling (Milestone 2)**: Design a profiling engine that calculates daily averages and standard deviations of employee activity metrics to model user baselines.
* [x] **Unsupervised Anomaly Model (Milestone 2)**: Build a Scikit-Learn `IsolationForest` machine learning model trained on User-Relative Deviation Z-scores, achieving **100% Threat Recall** on the Release 4.2 evaluation.
* [x] **High-Speed Ingestion Pipeline (Milestone 2)**: Implement a browser-based local folder dataset parser that loads CSVs via FastAPI Background Tasks, syncing the PostgreSQL directory and MongoDB logs in real-time.
* [x] **Live Security Alerts & Export (Milestone 2)**: Create a dashboard console featuring a radar scanner, baseline inspector cards, suspicious log filters, and a CSV report exporter.

---
## 3. Dataset Details & Reference Links

This system is configured to ingest and analyze the official **CMU CERT Insider Threat Dataset (Release 4.2)**. 

* **Publisher**: Carnegie Mellon University (CMU) Software Engineering Institute (SEI)
* **Dataset Scope**: A comprehensive simulated cyber-range containing digital activity logs of 1,000 employees over 500 days.
* **Ingested Log Schemas**:
  * **`logon.csv`**: Record of user logons/logoffs mapped to PC names.
  * **`device.csv`**: Mount/unmount events for USB mass storage.
  * **`file.csv`**: File copy, write, and deletion footprints on removable media.
  * **`email.csv`**: Email metadata (size, recipient, attachment count, and CC/BCC).
  * **`http.csv`**: Web-browsing urls and search keywords.

### Reference Link:
* 🗄️ **Kaggle Mirror**: [Kaggle Dataset Mount (Release 4.2)](https://www.kaggle.com/datasets/andrihjonior/cert-insider-threat-dataset-r4-2)

## 4. Folder Structure

The project has been organized into modular components:
```text
insider-threat-system/
├── README.md                    # Project documentation
├── backend/                     # FastAPI python backend
│   ├── .env                     # Local configuration parameters
│   ├── requirements.txt         # Core dependencies (fastapi, scikit-learn, pandas)
│   ├── ingest_cert_dataset.py   # CLI-based dataset ingestion script
│   └── app/                     # Main source code package
│       ├── config.py            # Settings manager (Pydantic Settings)
│       ├── database.py          # PostgreSQL SQLAlchemy connection session pooling
│       ├── mongodb.py           # MongoDB connection helper (PyMongo)
│       ├── models.py            # Database tables schema (SQLAlchemy ORM)
│       ├── auth.py              # Cryptography, JWT, Google SSO helper
│       ├── main.py              # Application entrypoint
│       │
│       ├── analytics/           # Machine Learning & Profiling Engine
│       │   ├── model.py         # ML pipeline (Z-scores & Isolation Forest)
│       │   ├── detector.py      # Threat rules matching & ML alerts coordinator
│       │   └── profiler.py      # Baseline averages calculations
│       │
│       └── routers/             # REST API Endpoint Routers
│           ├── auth.py          # Login & registration routes
│           ├── employees.py     # Employee profile management
│           ├── logs.py          # Logs queries, summaries, & background ingester
│           └── anomalies.py     # ML trigger scans & behavioral alerts console
│
└── frontend/                    # Vite React frontend
    ├── index.html               # Main entry HTML
    ├── package.json             # Frontend package configurations
    └── src/                     # React source files
        ├── App.jsx              # State routing & navigation
        ├── index.css            # Dark mode cybersecurity styling system
        └── components/          # Reusable UI components
            ├── Login.jsx        # Login, registration, and Google SSO button
            ├── EmployeeManager.jsx # Onboarding forms & employee lists
            ├── AssetAssociator.jsx # Device/Asset mapping & permission editors
            ├── ActivityMonitor.jsx # Local folder ingester, progress bar, & log streams
            └── AnomalyConsole.jsx  # Alerts feed, baseline cards, & CSV exporter
```

---

## 5. Work Completed Till Now

| Milestone | Task | Implementation Details |
| :--- | :--- | :--- |
| **Repo Setup** | Git & GitHub Integration | Initialized local git repository, resolved merge configurations, and connected to the GitHub remote repository. |
| **Env Setup** | Python Virtualenv & Backend | Created backend virtual environment (`venv`) to isolate dependencies, installed requirements (`fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `httpx`), and set up Vite React app. |
| **DB Setup** | Database Modeling & Config | Configured **PostgreSQL** as the primary relational database with fallback options to **SQLite** for dev environments. Built tables schema using SQLAlchemy ORM. |
| **Security** | User Authentication Module | Built password hashing and JWT token generation using `bcrypt` and `python-jose`. |
| **SSO** | Google OAuth2 Integration | Configured Google OAuth client flow, added backend verification of Google JWTs, and added role-based signup dropdown options. |
| **Core Identity** | Employee Profile Manager | Implemented APIs and views to onboard employees, map departments, bind corporate devices, and associate enterprise assets. |
| **QA** | Swagger & Client Testing | Verified all registration, login, and RBAC routes using FastAPI's Swagger UI. |

---

## 6. Features Implemented

* **Secure User Registration**: Supports registering custom system users with selectable organizational roles:
  * `Administrator` (Has full administrative, write, and deletion privileges)
  * `Security Manager` (Can onboard employees and bind devices/assets)
  * `Security Analyst` (Read-only access to employee directory, full audit trail access)
  * `SOC Engineer` (Read-only access to employee directory)
* **Standard JWT Login**: Encrypted login flow validating hashed password digests in the database and returning bearer tokens with a default expiration window.
* **Role-Based Access Control (RBAC)**: Custom FastAPI dependencies that check user roles before allowing access to secure endpoints (e.g. blocking Analysts from onboarding employees).
* **Role-Based Google Registration**: If registering for the first time, users can select their intended security role and complete registration via Google Sign-In, automatically binding their Google profile.
* **Employee Onboarding**: UI forms to record employee ID, designation, mapped department, manager, and access privilege comma-separated lists.
* **Device & Asset Association**: Sub-panels allowing managers to map physical devices (Laptop, Terminal with IP/MAC) and software asset permissions (SQL DB, AWS Bucket, Git repositories with access levels) directly to employee files.
* **Audit Trail**: Logging mechanisms that log session logins, registration attempts, device additions, and asset assignments.
* **Multi-Dimensional Anomaly Scanning**: Evaluates behavior across 7 deviation features: Logon counts, USB connects, File copies, Email sent, Web request counts, Suspicious website visits (jobs/cloud uploads), and Login hour deviation.
* **Local Dataset Web Ingestion**: Supports pasting an absolute directory path on your laptop. The backend handles folder parsing asynchronously for `logon.csv`, `device.csv`, `file.csv`, `email.csv`, and `http.csv` in a separate background thread.
* **Auto-Synchronization**: Automatically queries PostgreSQL during log ingestion, creating placeholder employee directory profiles for any newly detected user IDs (insert only, no duplicates, never deletes).
* **Report Exporter (CSV)**: A filter-aware report generator that lets analysts download a spreadsheet of the flagged alerts directly from the browser window.

---

## 7. Issues Faced & Resolutions

During Week 1 development, several technical challenges were encountered and successfully resolved:

1. **Python Virtual Environment Setup**
   * **Issue**: Faced difficulties creating and activating the virtual environment across different development sessions.
   * **Resolution**: Created a dedicated virtual environment, activated it correctly, and installed all project dependencies within the isolated environment.

2. **PostgreSQL Database Configuration**
   * **Issue**: Encountered issues while connecting the FastAPI application to the PostgreSQL database due to incorrect connection settings.
   * **Resolution**: Verified the PostgreSQL installation, updated the database connection string, and successfully established the database connection.

3. **SQLAlchemy Relationship & Cascade Deletions**
   * *Issue*: Deleting an employee profile failed due to foreign key violations on associated devices and assets.
   * *Resolution*: Configured `cascade="all, delete-orphan"` and `ondelete="CASCADE"` relationships on the SQLAlchemy model class definitions for `Device` and `Asset` properties.
   
4. **Google OAuth Configuration**
   * **Issue**: Configuring Google OAuth required proper Client ID, Client Secret, and redirect URI settings.
   * **Resolution**: Created OAuth credentials in Google Cloud Console and configured the application with the correct environment variables.

5. **Ingestion Failed: Permission Denied (Errno 13)**
   * *Issue*: Opening the CSV files during local ingestion caused a file-locking error on Windows.
   * *Resolution*: Microsoft Excel locks files exclusively when open. Instructed user to close Excel, and optimized Python's CSV reader parameters.

6. **ML Scan Query Limits**
   * *Issue*: The detector query previously capped the log scan window to 5,000 logs, missing alerts on large datasets.
   * *Resolution*: Increased the query limit in the `/detect` route to **200,000 logs**, allowing full-scale analytics.

---

## 8. New Things Learned

* **FastAPI Backend Architecture**: Learned how to build high-performance APIs, structure request routing folders, and configure CORS policies.
* **SQLAlchemy ORM & Database Design**: Designed relational database schemas, configured foreign keys, and managed session pools.
* **JWT Security Principles**: Gained practical understanding of token expiration, signature validation, encryption algorithms, and secure headers.
* **OAuth2 Authentication Flow**: Integrated Google Identity Services SDK, handled secure Google credential callbacks, and verified JWT tokens via Google's tokeninfo APIs.
* **Pydantic Validation**: Created data validation models to enforce type-safety, email formats, and custom payload serialization.
* **Git Workflows**: Mastered branch naming conventions, branch switching, merging, rebasing, and collaborating using GitHub Pull Requests.
* **Unsupervised Anomaly Detection**: Learned to construct, scale, and fit Scikit-Learn `IsolationForest` models without relying on prior threat labels.
* **User and Entity Behavior Analytics (UEBA)**: Understood how mathematical deviation metrics ($\mu$, $\sigma$, Z-Scores) are utilized in cybersecurity to identify insider risks.
 9. Verification & Local Launch

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Activate virtual environment:
   ```bash
   venv\Scripts\activate
   ```
3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Start the Vite server:
   ```bash
   npm run dev
   ```
3. Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---
## 9. Conclusion

Milestone 2 has successfully transitioned the **Insider Threat Behavioral Intelligence System** from a basic employee identity mapping CRUD application into an operational, intelligent User Behavior Analytics (UEBA) platform. 
