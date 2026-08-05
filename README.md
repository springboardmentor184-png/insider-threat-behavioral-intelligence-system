<div align="center">

# 🛡️ InsiderShield

### Enterprise AI-Powered Insider Threat Detection & Response Platform

Behavioral Intelligence • UEBA • AI Risk Scoring • Threat Investigation • SOAR Automation

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge)
![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy-red?style=for-the-badge)
![JWT](https://img.shields.io/badge/Auth-JWT-success?style=for-the-badge)
![Status](https://img.shields.io/badge/Project-Completed-success?style=for-the-badge)

</div>

---

# 📖 Overview

**InsiderShield** is an enterprise cybersecurity platform that detects, analyzes, investigates, and responds to insider threats using AI-powered behavioral intelligence.

The system continuously monitors employee activities, establishes behavioral baselines, detects suspicious behavior, calculates AI-driven insider risk scores, performs User & Entity Behavior Analytics (UEBA), correlates security telemetry, automates threat investigations, and executes SOAR response playbooks through a centralized Security Operations Center (SOC) dashboard.

The project follows a modular enterprise architecture inspired by modern security platforms such as:

- Microsoft Defender XDR
- Microsoft Sentinel
- IBM QRadar
- Splunk Enterprise Security
- CrowdStrike Falcon

---

# 🎯 Project Objectives

- Detect insider threats using behavioral analytics
- Monitor employee activities in real time
- Build behavioral baselines
- Identify abnormal user behavior
- Calculate AI-powered risk scores
- Perform UEBA and Entity Analytics
- Automate investigations
- Generate security intelligence reports
- Execute SOAR response playbooks
- Provide a centralized SOC dashboard

---

# 🏗 System Architecture

```text
                    InsiderShield Platform

                    ┌─────────────────────┐
                    │ Authentication      │
                    │ JWT + RBAC          │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼

 Employee Management     Activity Monitoring    Behavior Analytics

         │                     │                     │
         └──────────────┬──────┴──────────────┬─────┘
                        ▼
               Threat Detection Engine
                        │
                        ▼
             AI Risk Scoring Engine
                        │
                        ▼
                 UEBA Intelligence
                        │
                        ▼
            Threat Investigation Center
                        │
                        ▼
      Alerts • Incidents • SOAR Playbooks
                        │
                        ▼
        Enterprise Reports & Analytics
```

---

# 🚀 Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | FastAPI |
| ORM | SQLAlchemy |
| Database | SQLite |
| Authentication | JWT |
| Authorization | RBAC |
| Charts | Recharts |
| PDF Reports | ReportLab |
| API | REST API |

---

# 📂 Project Structure

```text
InsiderShield
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   ├── routes
│   └── assets
│
├── backend
│   ├── app
│   │   ├── api
│   │   ├── models
│   │   ├── repositories
│   │   ├── schemas
│   │   ├── services
│   │   └── database
│   │
│   ├── seed scripts
│   ├── verification tests
│   └── requirements.txt
│
└── README.md
```

---

# ✅ Milestone 1 – Project Foundation

### ✔ Planning & Architecture

- Enterprise system design
- Modular backend architecture
- Database schema design
- REST API planning
- Security architecture

### ✔ Backend Setup

- FastAPI configuration
- SQLAlchemy integration
- SQLite database
- JWT Authentication
- Role-Based Access Control

### ✔ Frontend Setup

- React + Vite
- Tailwind CSS
- Routing
- Authentication Flow
- Protected Routes
- Enterprise UI Layout

---

# ✅ Milestone 2 – Core Security Platform

## Dashboard

- Enterprise SOC Dashboard
- Security KPIs
- Risk Trends
- Activity Summary
- Department Statistics

## Employee Management

- Employee Directory
- Employee Profiles
- Department Management
- Security Overview

## Activity Monitoring

- Employee Telemetry
- Login Monitoring
- File Activities
- Device Monitoring
- Access Logs

## Behavioral Profiling

- Behavioral Baselines
- Login Patterns
- Work Pattern Analysis
- Device Usage
- Behavioral Deviations

## Threat Detection

- Insider Threat Detection
- Threat Severity
- Threat Scoring
- AI Recommendations

## Reports

- Employee Reports
- Risk Reports
- Activity Reports
- Security Reports

---

# ✅ Milestone 3 – Enterprise AI Security Intelligence

## AI Risk Scoring Engine

- Weighted AI Risk Calculation
- Explainable AI (XAI)
- Risk Breakdown
- Historical Risk Trends
- Department Risk Analytics

---

## UEBA Intelligence

- User Behavior Analytics
- Entity Behavior Analytics
- Peer Comparison
- Behavioral Drift
- Risk Prediction
- Entity Risk Assessment

---

## Threat Investigation Center

- Case Management
- Timeline Correlation
- Evidence Collection
- Analyst Notes
- XAI Investigation Summary
- Correlation Graphs

---

## Alert & Incident Management

- Security Alerts
- Incident Tracking
- Incident Dashboard
- Alert Correlation

---

## SOAR Response Playbooks

- Account Suspension
- Session Revocation
- USB Blocking
- Endpoint Isolation
- SOC Notification
- Automated Response Execution

---

## Enterprise PDF Reports

Generate professional multi-page reports including

- Employee Profile
- Executive Summary
- AI Risk Assessment
- Explainable AI
- UEBA Analytics
- Threat Detection
- Timeline
- Alerts
- Incidents
- Investigations
- SOAR Actions
- Security Recommendations

---

# 📊 Platform Highlights

✔ Enterprise SOC Dashboard

✔ AI Risk Scoring

✔ Explainable AI

✔ User Behavior Analytics

✔ Entity Behavior Analytics

✔ Insider Threat Detection

✔ Threat Investigation

✔ Alert Management

✔ Incident Response

✔ SOAR Automation

✔ Enterprise PDF Reports

✔ JWT Authentication

✔ Role-Based Access Control

✔ REST APIs

---

# 🔐 Security Features

- JWT Authentication
- Secure Password Hashing
- Role-Based Authorization
- Protected REST APIs
- Employee Risk Classification
- Threat Severity Analysis
- Explainable AI
- Automated Containment
- Audit Logging

---

# 📄 Enterprise Reporting

InsiderShield generates professional Security Intelligence Reports including

- Employee Security Profile
- Risk Intelligence
- Behavioral Analytics
- UEBA Summary
- Threat History
- Incident Summary
- Investigation Status
- SOAR Actions
- Executive Recommendations

---

# 🧪 Testing & Verification

The project includes

- Database Seed Scripts
- Backend Verification Scripts
- API Testing
- Production Build Validation
- Enterprise Report Verification

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/1at24cs054-rgb/InsiderShield.git
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

# 🎯 Key Achievements

- Enterprise-grade modular architecture
- AI-powered insider risk scoring
- Explainable AI recommendations
- User & Entity Behavior Analytics
- Threat Investigation workflows
- Alert & Incident Management
- SOAR response automation
- Professional PDF security reporting
- Enterprise SOC user experience

---

# 🔮 Future Enhancements

- Machine Learning anomaly detection
- Real-time streaming telemetry
- SIEM integration
- Active Directory integration
- Docker & Kubernetes deployment
- PostgreSQL support
- Email & Teams notifications
- Cloud deployment (AWS/Azure)
- Multi-tenant architecture

---

# 👨‍💻 Developed By

**Dhanush**

Enterprise AI-Based Insider Threat Detection & Response Platform

Built using React, FastAPI, SQLAlchemy, SQLite, JWT Authentication, ReportLab, and modern cybersecurity concepts.

---

<div align="center">

## 🛡️ InsiderShield

### Enterprise AI-Powered Insider Threat Detection & Response Platform

**Behavioral Intelligence • AI Risk Scoring • UEBA • SOAR • Threat Investigation**

⭐ If you found this project useful, consider giving it a star!

</div>