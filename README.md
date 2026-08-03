# 🛡️ Insider Threat Behavioral Intelligence System

An AI-assisted cybersecurity platform designed to monitor employee behavior, analyze organizational activity, detect abnormal patterns, calculate insider risk, and support security investigations.

The system combines:

* React-based security dashboard
* FastAPI backend
* PostgreSQL database
* Machine learning anomaly detection
* Behavioral risk scoring
* Security alert generation
* Investigation workflows

The objective is to provide a centralized platform for identifying suspicious insider activities through behavioral intelligence.

---

# 📌 Project Overview

Insider threats are security risks caused by authorized users who misuse access privileges intentionally or unintentionally.

Traditional security monitoring focuses mainly on individual events. This project focuses on **behavioral intelligence**, where multiple activity sources are analyzed together to identify deviations from normal user behavior.

The system analyzes:

* Login activity
* File access behavior
* Employee activity patterns
* Device activity
* Email activity
* Security events
* Behavioral anomalies

The platform helps security teams identify high-risk users, investigate suspicious activities, and make informed security decisions.

---

# 🏗️ System Architecture

```
React Frontend
        |
        | REST API
        |
FastAPI Backend
        |
        | SQLAlchemy ORM
        |
PostgreSQL Database
        |
        |
Behavioral Analytics
        |
Machine Learning Detection
        |
Risk Scoring
        |
Alerts & Investigation
```

---

# 🚀 Current Implementation Status

## ✅ Completed Features

### Full Stack Application

Implemented:

* React + Vite frontend
* FastAPI backend
* PostgreSQL database integration
* SQLAlchemy ORM
* REST API architecture
* CORS configuration

---

# 🔐 Authentication System

Completed authentication workflow:

### Registration

Implemented:

* User registration
* Role selection
* Password hashing
* PostgreSQL user storage

### Login

Implemented:

* Email/password authentication
* Password verification
* JWT token generation
* Protected dashboard access
* Frontend token management

Authentication flow:

```
Register
    ↓
Password Hashing
    ↓
Database Storage
    ↓
Login
    ↓
JWT Token
    ↓
Dashboard Access
```

---

# 🗄️ Database Implementation

PostgreSQL database is configured with security-related tables:

Implemented tables:

* Users
* Employees
* Login Activity
* File Access
* Threat Events
* Alerts
* Email Activity
* Device Activity

The database stores organizational activity data required for behavioral analysis.

---

# 📊 Security Dashboard

The React dashboard is implemented with security monitoring modules:

Available modules:

* Dashboard
* Employees
* Activity Logs
* Alerts
* Risk Analysis
* Investigations
* Reports
* Profile
* Settings

Dashboard displays:

* Total employees
* Activity statistics
* Risk categories
* Security alerts
* Anomaly information

---

# 🤖 Machine Learning Implementation

## Isolation Forest Anomaly Detection

The project uses Isolation Forest for identifying abnormal behavioral patterns.

Isolation Forest is an unsupervised machine learning algorithm that detects unusual observations by isolating abnormal data points.

Behavioral features include:

```
Login Frequency
File Access Count
Failed Login Attempts
After-Hours Activity
Device Activity
Email Activity
```

Processing flow:

```
User Activity Data
        ↓
Feature Extraction
        ↓
Behavioral Feature Vector
        ↓
Isolation Forest Model
        ↓
Anomaly Detection
        ↓
Risk Analysis
        ↓
Security Alert
```

---

# 🚨 Risk Analysis and Alert System

Completed:

* Risk analysis module
* Behavioral risk evaluation
* Risk classification
* Alert generation

Risk categories:

* Low Risk
* Medium Risk
* High Risk
* Critical Risk

Risk calculation considers:

```
Login Behavior
        +
File Activity
        +
Anomaly Score
        +
Suspicious Events
        ↓
User Risk Score
```

---

# 🔍 Threat Investigation Module

Investigation workflow implemented:

```
Suspicious Activity
        ↓
Generated Alert
        ↓
Risk Evaluation
        ↓
Activity Review
        ↓
Investigation Decision
```

The investigation module provides security analysts with contextual information about suspicious user behavior.

---

# 📚 CERT Insider Threat Dataset

The project uses the CERT Insider Threat Dataset for behavioral analysis.

Dataset activities include:

* Logon activity
* File activity
* Email activity
* Device activity
* HTTP activity

Completed dataset workflow:

```
CERT Dataset
      ↓
CSV Processing
      ↓
Data Inspection
      ↓
Field Mapping
      ↓
Database Import
      ↓
Behavior Analysis
      ↓
Anomaly Detection
```

---

# 🔌 Backend APIs

Implemented API modules:

* Authentication APIs
* Employee APIs
* Login Activity APIs
* File Access APIs
* Risk APIs
* Alert APIs
* Machine Learning APIs
* Dashboard APIs

Backend features:

* Database sessions
* Request validation
* JWT authentication
* API routing
* Data processing

---

# 🎨 Frontend Technology

Technologies used:

| Technology    | Purpose                 |
| ------------- | ----------------------- |
| React         | User Interface          |
| Vite          | Development Environment |
| React Router  | Navigation              |
| Axios         | API Communication       |
| Recharts      | Data Visualization      |
| Lucide React  | Icons                   |
| Framer Motion | UI Animation            |

---

# ⚙️ Backend Technology

| Technology | Purpose             |
| ---------- | ------------------- |
| Python     | Backend Development |
| FastAPI    | REST API Framework  |
| Uvicorn    | Server              |
| SQLAlchemy | ORM                 |
| PostgreSQL | Database            |
| Passlib    | Password Hashing    |
| JWT        | Authentication      |

---

# 🧠 Machine Learning Technology

| Technology       | Purpose              |
| ---------------- | -------------------- |
| Scikit-learn     | ML Algorithms        |
| Isolation Forest | Anomaly Detection    |
| Pandas           | Data Processing      |
| NumPy            | Numerical Processing |

---

# 📈 Development Milestones

## Milestone 1 — Foundation ✅ Completed

Completed:

* Project architecture
* Frontend setup
* Backend setup
* Database configuration
* Authentication system

---

## Milestone 2 — Data Collection & Anomaly Detection ✅ Completed

Completed:

* CERT dataset integration
* Database data mapping
* Activity data processing
* Isolation Forest implementation
* Anomaly detection testing
* Risk analysis foundation

---

## Milestone 3 — Risk Scoring & Threat Investigation 🔄 In Progress

Completed:

✅ Insider risk scoring engine foundation
✅ Threat investigation module
✅ Risk analytics processing
✅ Security alert generation

Remaining improvements:

* Advanced dashboard analytics
* Automated investigation reports
* Improved behavioral baselines
* More detailed risk visualization

---

# ▶️ Running the Project

## Backend

```
cd backend
```

Activate environment:

```
.venv\Scripts\Activate.ps1
```

Install dependencies:

```
pip install -r requirements.txt
```

Run:

```
uvicorn app.main:app --reload
```

Backend:

```
http://127.0.0.1:8000
```

API Documentation:

```
http://127.0.0.1:8000/docs
```

---

## Frontend

```
cd frontend
```

Install:

```
npm install
```

Run:

```
npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# 🔮 Future Enhancements

Planned improvements:

* Advanced user behavior profiling
* Real-time anomaly detection
* Peer group analysis
* Automated incident response
* Investigation case management
* Advanced reporting
* Production deployment
* Improved authorization controls

---

# 🎯 Final System Workflow

```
Collect User Activity
          ↓
Analyze Behavior Patterns
          ↓
Detect Anomalies
          ↓
Calculate Risk Score
          ↓
Generate Security Alerts
          ↓
Investigate Threats
          ↓
Support Security Decisions
```

---

# ⚠️ Disclaimer

This project is developed for educational and cybersecurity research purposes.

The system should only be used on authorized systems and approved datasets while following organizational security policies and applicable laws.

---

# 👨‍💻 Author

**Goutham Kumar**

GitHub:
https://github.com/Gouthamkumar543

---

# ⭐ Project Status

🚧 Active Development

Current progress:

✅ Full-stack architecture completed
✅ Authentication completed
✅ Database integration completed
✅ Dashboard completed
✅ CERT dataset integrated
✅ Isolation Forest anomaly detection completed
✅ Risk analysis completed
✅ Threat investigation completed

The project is currently being enhanced with advanced risk analytics, dashboards, and intelligent security investigation features.
