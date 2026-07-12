# Insider Threat Behavioral Intelligence System
>
This repository contains the core setup, User Authentication module, and Employee Identity & Profile Management modules built during Week 1 of the internship.
---
## 1. Project Overview
An **Insider Threat Behavioral Intelligence System** is an AI-powered security monitoring platform built to protect organizations from internal security breaches. Unlike traditional perimeter security systems (firewalls, IDS) that shield against external hacks, this system focus-monitors internal accounts, servers, and employees to detect unauthorized activities or account misuse.
### Purpose of Detecting & Managing Insider Threats
* **Prevent Data Exfiltration**: Identify early indicators of data theft, such as excessive file downloads, unauthorized network data transfers, or database exports.
* **Stop Privilege Abuse**: Audit accounts trying to access confidential databases, servers, or file systems outside their scope of work.
* **Detect Compromised Credentials**: Notice anomalies in user login behavior (such as logins at unusual hours or from unrecognized devices).

---

## 2. Objectives

The primary objectives established for the initial phase of the project include:
* [x] **Establish the Environment**: Set up an scalable backend framework (FastAPI) and responsive frontend environment (React + Vite) with strict configuration management.
* [x] **Secure Access & Audits**: Implement secure JSON Web Token (JWT) local authentication alongside Google OAuth2 Single Sign-On (SSO) under a strict Role-Based Access Control (RBAC) policy.
* [x] **Asset & Identity Mapping**: Build a unified profile manager to map company employees directly to their corporate physical devices, access privileges, and software assets.

---

## 3. Folder Structure

The project has been organized into modular components. The repository layout is structured as follows:
```text
insider-threat-system/
├── README.md                    # Project documentation
├── backend/                     # FastAPI python backend
│   ├── .env                     # Local configuration parameters
│   ├── requirements.txt         # Core dependencies
│   └── app/                     # Main source code package
│       ├── __init__.py
│       ├── config.py            # Settings manager (Pydantic Settings)
│       ├── database.py          # SQLAlchemy connection sessions
│       ├── models.py            # Database tables schema (SQLAlchemy ORM)
│       ├── schemas.py           # Data schemas (Pydantic Models)
│       ├── auth.py              # Cryptography, JWT, Google SSO helper
│       └── main.py              # Application entrypoint & routes definition
└── frontend/                    # Vite React frontend
    ├── index.html               # Main entry HTML (with Google Identity scripts)
    ├── package.json             # Frontend package configurations
    ├── vite.config.js           # Vite server settings with backend proxy setup
    └── src/                     # React source files
        ├── main.jsx             # React bootstrap mount
        ├── App.jsx              # Main layout, state router & audit logging
        ├── index.css            # Dark mode cybersecurity styling system
        └── components/          # Reusable UI components
            ├── Login.jsx        # Login, registration, and Google SSO button
            ├── EmployeeManager.jsx # Onboarding forms & employee lists
            └── AssetAssociator.jsx # Device/Asset mapping & permission editors
```
---

## 4. Work Completed Till Now

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

## 5. Features Implemented

* **Secure User Registration**: Supports registering custom system users with selectable organizational roles:
  * `Administrator` (Has full administrative, write, and deletion privileges)
  * `Security Manager` (Can onboard employees and bind devices/assets)
  * `Security Analyst` (Read-only access to employee directory, full audit trail access)
  * `SOC Engineer` (Read-only access to employee directory)
* **Standard JWT Login**: Encrypted login flow validating hashed password digests in the database and returning bearer tokens with a default expiration window.
* **Role-Based Access Control (RBAC)**: Custom FastAPI dependencies that check user roles before allowing access to secure endpoints (e.g. blocking Analysts from onboarding employees).
* **Restricted Google Sign-In**: Implementation of restricted logins. Users can click "Continue with Google" on the login screen, but are only granted access if their email has already been registered (protecting against unauthorized JIT access).
* **Role-Based Google Registration**: If registering for the first time, users can select their intended security role and complete registration via Google Sign-In, automatically binding their Google profile.
* **Employee Onboarding**: UI forms to record employee ID, designation, mapped department, manager, and access privilege comma-separated lists.
* **Device & Asset Association**: Sub-panels allowing managers to map physical devices (Laptop, Terminal with IP/MAC) and software asset permissions (SQL DB, AWS Bucket, Git repositories with access levels) directly to employee files.
* **Audit Trail**: Logging mechanisms that log session logins, registration attempts, device additions, and asset assignments.

---

## 6. Issues Faced & Resolutions

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

4. **Passlib Bcrypt Compatibility in Python 3.14**
   * *Issue*: Passlib threw module-missing attribute errors when trying to load bcrypt under newer Python engines.
   * *Resolution*: Removed `passlib` entirely and transitioned to direct `bcrypt` library calls, using `bcrypt.hashpw` and `bcrypt.checkpw` for password verification.
   
5. **Google OAuth Configuration**
   * **Issue**: Configuring Google OAuth required proper Client ID, Client Secret, and redirect URI settings.
   * **Resolution**: Created OAuth credentials in Google Cloud Console and configured the application with the correct environment variables.

---

## 7. New Things Learned

* **FastAPI Backend Architecture**: Learned how to build high-performance APIs, structure request routing folders, and configure CORS policies.
* **SQLAlchemy ORM & Database Design**: Designed relational database schemas, configured foreign keys, and managed session pools.
* **JWT Security Principles**: Gained practical understanding of token expiration, signature validation, encryption algorithms, and secure headers.
* **OAuth2 Authentication Flow**: Integrated Google Identity Services SDK, handled secure Google credential callbacks, and verified JWT tokens via Google's tokeninfo APIs.
* **Pydantic Validation**: Created data validation models to enforce type-safety, email formats, and custom payload serialization.
* **Git Workflows**: Mastered branch naming conventions, branch switching, merging, rebasing, and collaborating using GitHub Pull Requests.

---

## 8. Conclusion

Week 1 has successfully established the security foundation of the **Insider Threat Behavioral Intelligence System**. By completing the authentication modules and profile management panels, the system has a secure framework ready for activity monitoring and anomaly ingestion. 
