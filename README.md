# insider-threat-behavioral-intelligence-system
AI-powered Insider Threat Behavioral Intelligence System developed as part of the Infosys Internship Program.
# 🛡️ Insider Threat Behavioral Intelligence System

An AI-assisted cybersecurity platform designed to monitor employee behavior, analyze organizational activity, identify abnormal patterns, and support early detection of potential insider threats.

The system combines behavioral analytics, machine learning, a FastAPI backend, a React-based security dashboard, and PostgreSQL database storage to provide a centralized platform for insider-threat monitoring and investigation.

---

## 📌 Project Overview

Insider threats are security risks caused by individuals who already have authorized access to an organization's systems, data, and resources. Unlike traditional external attacks, insider threats can be difficult to detect because the activity may initially appear legitimate.

The **Insider Threat Behavioral Intelligence System** is being developed to address this problem by analyzing user activity across multiple behavioral sources, including:

* Login activity
* File access behavior
* Employee activity patterns
* Device activity
* Email activity
* Security events
* Abnormal behavioral patterns

The goal is to move from simple activity monitoring toward **behavioral intelligence**, where the system analyzes patterns over time and helps security teams identify users whose activity may indicate elevated risk.

---

## 🎯 Project Objectives

The main objectives of this project are:

* Monitor employee and user activity across organizational systems.
* Collect and store behavioral security data in a centralized database.
* Identify abnormal or suspicious activity patterns.
* Calculate behavioral risk scores for users.
* Detect potential insider-threat behavior using machine learning.
* Generate alerts for suspicious activities.
* Provide security teams with a centralized monitoring dashboard.
* Support investigation and analysis of suspicious user behavior.
* Present security data through clear visual analytics and reports.

---

## 🏗️ System Architecture

The application follows a full-stack architecture:

```text
┌──────────────────────────────────────────────┐
│              React Frontend                  │
│                                              │
│  Dashboard | Employees | Activity Logs       │
│  Alerts | Risk Analysis | Investigations     │
│  Reports | Profile | Settings                │
└──────────────────────┬───────────────────────┘
                       │
                       │ REST API
                       │
┌──────────────────────▼───────────────────────┐
│              FastAPI Backend                 │
│                                              │
│  Authentication                              │
│  Employee APIs                               │
│  Login Activity APIs                         │
│  File Access APIs                            │
│  Risk Analysis APIs                          │
│  Alert APIs                                  │
│  Machine Learning APIs                       │
│  Dashboard APIs                              │
└──────────────────────┬───────────────────────┘
                       │
                       │ SQLAlchemy
                       │
┌──────────────────────▼───────────────────────┐
│              PostgreSQL Database              │
│                                              │
│  Users / Employees                           │
│  Login Activity                              │
│  File Access                                 │
│  Email Activity                               │
│  Device Activity                              │
│  Threat Events                                │
│  Alerts                                      │
└──────────────────────────────────────────────┘
```

---

# 🚀 Current Implementation

## 1. Full-Stack Project Structure

The project is organized into two primary applications:

```text
Insider-Threat-Behavioral-Intelligence-System/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database/
│   │   ├── models/
│   │   ├── routes/
│   │   └── schemas/
│   │
│   └── .venv/
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── layouts/
    │   ├── pages/
    │   └── services/
    │
    └── package.json
```

This separation allows the React frontend and FastAPI backend to be developed and maintained independently.

---

# 🔐 Authentication System

A complete user authentication foundation has been implemented.

### Registration

Users can register by providing:

* Full name
* Email address
* Password
* Role

Supported security-oriented roles include:

* SOC Engineer
* Security Manager
* Administrator

During registration:

1. The backend receives the registration request.
2. The email address is checked for existing accounts.
3. The password is securely hashed.
4. The user is stored in PostgreSQL.
5. The newly created user is returned to the application.

### Login

The login system:

1. Accepts the user's email and password.
2. Retrieves the user from PostgreSQL.
3. Verifies the password hash.
4. Generates a JWT access token.
5. Returns the authentication token to the frontend.
6. Stores the token in browser local storage.
7. Redirects the authenticated user to the dashboard.

The authentication flow is:

```text
Register
   ↓
Password Hashing
   ↓
PostgreSQL User Storage
   ↓
Login
   ↓
Password Verification
   ↓
JWT Token Generation
   ↓
Authenticated Dashboard
```

---

# 🗄️ Database Layer

The application uses **PostgreSQL** as the primary relational database.

SQLAlchemy is used as the ORM layer between the FastAPI application and PostgreSQL.

The database foundation includes tables for:

### Users / Employees

Stores user identity and organizational information.

Example information includes:

* User ID
* Full name
* Email
* Password hash
* Role
* Account information

### Login Activity

Stores authentication and login-related behavior.

Potential behavioral information includes:

* Employee
* Login timestamp
* IP address
* Location
* Login success or failure

### File Access

Stores user interactions with organizational files.

Potential behavioral information includes:

* Employee
* File accessed
* Access timestamp
* File type
* Access behavior

### Threat Events

Stores suspicious or detected behavioral events.

### Alerts

Stores security alerts generated from suspicious activity.

### Email Activity

Provides a foundation for analyzing email-related behavior.

### Device Activity

Provides a foundation for analyzing device and endpoint interactions.

---

# 📊 Dashboard

The React frontend includes a security-focused dashboard layout designed for security operations and behavioral intelligence monitoring.

The dashboard is intended to provide a centralized view of:

* Total monitored employees
* Active security alerts
* High-risk users
* Suspicious activities
* Behavioral risk trends
* Activity statistics
* Threat events

The frontend communicates with the FastAPI backend using REST APIs and Axios.

The dashboard architecture is designed to support real-time or near-real-time security analytics as the backend data processing layer is expanded.

---

# 🧭 Application Modules

The frontend application is structured around the following security modules:

## 👥 Employees

Provides an employee-focused view for monitoring users and their behavioral risk information.

Potential functionality includes:

* Employee listing
* Employee profiles
* Risk scores
* Activity summaries
* Behavioral history

---

## 📜 Activity Logs

Centralizes activity information collected from the system.

Activity types can include:

* Login events
* File access events
* Device activity
* Email activity
* Suspicious behavior

This provides security analysts with a chronological view of user behavior.

---

## 🚨 Alerts

Provides a centralized location for security alerts.

Alerts can be used to highlight:

* Suspicious login behavior
* Unusual file access
* Abnormal activity spikes
* Potential data exfiltration behavior
* High-risk user activity

---

## 📈 Risk Analysis

The Risk Analysis module is designed to evaluate user behavior and identify users who may require further investigation.

A behavioral risk score can be generated from multiple factors, including:

```text
Login Behavior
      +
File Access Behavior
      +
Device Activity
      +
Email Activity
      +
Anomaly Detection
      ↓
Behavioral Risk Score
```

Users can then be classified into risk categories such as:

* Low Risk
* Medium Risk
* High Risk
* Critical Risk

---

## 🔍 Investigations

The Investigations module is designed to help security teams analyze suspicious behavior.

A typical investigation workflow can include:

```text
Suspicious Activity
        ↓
Security Alert
        ↓
User Risk Analysis
        ↓
Activity Timeline
        ↓
Investigation
        ↓
Security Decision
```

This module is intended to provide context instead of treating each activity as an isolated event.

---

## 📄 Reports

The Reports module provides a foundation for generating security and behavioral intelligence reports.

Possible reports include:

* Employee risk reports
* Alert summaries
* Activity reports
* Threat analysis reports
* Behavioral trend reports

---

# 🤖 Machine Learning and Behavioral Analytics

Machine learning is being integrated into the project to help identify abnormal employee behavior.

The system is designed around the idea that insider threats can often be detected through **behavioral deviations from normal activity patterns**.

Instead of relying only on predefined rules, the system can analyze activity patterns and identify behavior that differs significantly from expected behavior.

### Example behavioral indicators

* Unusual login times
* Excessive file access
* Unusual access frequency
* Sudden changes in normal behavior
* Repeated failed logins
* Unusual device activity
* Abnormal activity across multiple systems

---

# 🧠 Isolation Forest

The project uses the concept of **Isolation Forest** for anomaly detection.

Isolation Forest is an unsupervised machine learning algorithm designed to identify unusual data points.

In this project, behavioral activity can be represented using features such as:

```text
Login Frequency
File Access Count
Failed Login Count
After-Hours Activity
Device Activity
Email Activity
```

The model analyzes these behavioral features and identifies observations that appear significantly different from normal user behavior.

A simplified flow is:

```text
Raw User Activity
        ↓
Feature Extraction
        ↓
Behavioral Feature Vector
        ↓
Isolation Forest
        ↓
Anomaly Score
        ↓
Risk Analysis
        ↓
Security Alert
```

The anomaly detection layer can be combined with rule-based indicators and other behavioral metrics to produce a more meaningful user risk score.

---

# 📚 CERT Insider Threat Dataset

The project uses the **CERT Insider Threat Dataset** as a source of simulated organizational activity for insider-threat research and behavioral analysis.

The dataset contains different types of user activity, including information related to:

* Logon activity
* File activity
* Email activity
* Device activity
* HTTP activity

The project includes work toward:

1. Downloading the dataset.
2. Extracting the dataset locally.
3. Inspecting the CSV files.
4. Understanding the available data fields.
5. Mapping dataset fields to application database models.
6. Importing relevant activity data into PostgreSQL.
7. Preparing the data for behavioral analytics.

The dataset preprocessing process is:

```text
CERT Dataset
     ↓
CSV Activity Files
     ↓
Data Inspection
     ↓
Data Cleaning
     ↓
Field Mapping
     ↓
Database Import
     ↓
Behavioral Analysis
```

---

# 🔌 Backend API

The backend is built using **FastAPI**.

The API layer is organized into modular route groups for maintainability.

Current API areas include:

* Authentication
* Employees
* Login Activity
* File Access
* Risk Analysis
* Alerts
* Machine Learning
* Dashboard Analytics

The application exposes REST API endpoints that allow the frontend to communicate with the backend.

The backend also includes:

* Database dependency injection
* SQLAlchemy database sessions
* Request validation
* Response schemas
* CORS configuration
* JWT-based authentication

---

# 🔒 Security Features

The project includes several security-focused implementation concepts:

### Password Hashing

User passwords are not stored as plain text. Passwords are hashed before being stored in the database.

### JWT Authentication

After successful login, the backend generates a JWT access token.

The token is used to authenticate subsequent API requests.

### Role-Based Foundation

The system includes role information to support different security personnel and administrative users.

Potential roles include:

* SOC Engineer
* Security Manager
* Administrator

### CORS Protection

The backend is configured to allow communication with the authorized frontend application during development.

---

# 🎨 Frontend Technology

The frontend is built using:

* React
* Vite
* React Router
* Axios
* Lucide React
* Recharts
* Framer Motion

The frontend provides:

* Login interface
* Registration interface
* Dashboard layout
* Sidebar navigation
* Security-focused page structure
* API integration
* Protected authentication flow

The application uses a modular page-based architecture so that each security feature can be developed independently.

---

# ⚙️ Technology Stack

## Frontend

| Technology    | Purpose                             |
| ------------- | ----------------------------------- |
| React         | User interface                      |
| Vite          | Frontend development and build tool |
| React Router  | Application routing                 |
| Axios         | API communication                   |
| Recharts      | Data visualization                  |
| Lucide React  | UI icons                            |
| Framer Motion | UI animations                       |

## Backend

| Technology  | Purpose                      |
| ----------- | ---------------------------- |
| Python      | Backend programming language |
| FastAPI     | REST API framework           |
| Uvicorn     | ASGI server                  |
| SQLAlchemy  | ORM and database interaction |
| PostgreSQL  | Relational database          |
| Passlib     | Password hashing             |
| Bcrypt      | Password hashing backend     |
| Python-JOSE | JWT token generation         |

## Machine Learning

| Technology       | Purpose                     |
| ---------------- | --------------------------- |
| Scikit-learn     | Machine learning algorithms |
| Isolation Forest | Anomaly detection           |
| Pandas           | Data processing             |
| NumPy            | Numerical analysis          |

---

# ▶️ Running the Project

## Backend

Navigate to the backend folder:

```bash
cd backend
```

Activate the virtual environment:

### Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

Open a separate terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

The frontend will generally run at:

```text
http://localhost:5173
```

---

# 🔄 Application Workflow

The current application workflow is:

```text
User
 ↓
React Frontend
 ↓
Registration / Login
 ↓
FastAPI Authentication API
 ↓
Password Verification
 ↓
JWT Token
 ↓
Authenticated Dashboard
 ↓
API Data Requests
 ↓
PostgreSQL Database
 ↓
Behavioral Analytics
 ↓
Risk Analysis
 ↓
Alerts and Investigations
```

---

# 🚧 Current Development Status

The project is currently under active development.

### ✅ Implemented

* Full-stack project structure
* React + Vite frontend
* FastAPI backend
* PostgreSQL database integration
* SQLAlchemy ORM setup
* User registration
* Password hashing
* User login
* JWT token generation
* Role-based user foundation
* CORS configuration
* Dashboard layout
* Sidebar navigation
* Multiple security-focused frontend modules
* REST API structure
* CERT dataset acquisition and inspection
* Initial database table structure
* Foundation for behavioral analytics
* Foundation for machine learning-based anomaly detection

### 🔄 In Progress

* Connecting dashboard analytics to real database data
* Importing and mapping CERT activity data into PostgreSQL
* Completing dashboard summary APIs
* Building behavioral risk scoring
* Integrating anomaly detection into the risk pipeline
* Generating automated security alerts
* Connecting activity logs to actual backend data
* Completing investigation workflows
* Developing reporting functionality

### 🔮 Planned Enhancements

* Advanced behavioral feature engineering
* Automated anomaly detection pipelines
* Improved risk scoring models
* User behavior baselines
* Peer-group behavioral comparison
* Time-series activity analysis
* Automated alert prioritization
* Investigation case management
* Report generation
* Production deployment
* Enhanced authorization and security controls

---

# 🎯 Future System Vision

The long-term goal is to develop a complete behavioral security intelligence platform that can:

```text
Collect Activity
      ↓
Understand Normal Behavior
      ↓
Detect Behavioral Deviations
      ↓
Calculate Risk
      ↓
Generate Alerts
      ↓
Support Investigation
      ↓
Help Security Teams Respond
```

The system is designed to move beyond traditional rule-based monitoring by combining:

* Behavioral analytics
* Machine learning
* Security event monitoring
* Risk scoring
* Data visualization
* Investigation workflows

This approach aims to help organizations identify potentially risky behavior earlier and provide security analysts with the context needed to investigate possible insider threats.

---

## ⚠️ Disclaimer

This project is developed for educational, research, and cybersecurity experimentation purposes.

The system is intended to analyze simulated or authorized organizational activity. It should not be used to monitor individuals or systems without appropriate authorization, consent, and compliance with applicable laws and organizational policies.

---

## 👨‍💻 Author

**Goutham Kumar**

GitHub: [Gouthamkumar543](https://github.com/Gouthamkumar543)

---

## ⭐ Project Status

🚧 **Active Development**

The core full-stack architecture and authentication foundation are implemented. Behavioral data ingestion, analytics APIs, machine learning-based anomaly detection, risk scoring, and advanced security intelligence features are actively being developed.
