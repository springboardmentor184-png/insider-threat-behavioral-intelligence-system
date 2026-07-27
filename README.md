# AI Insider Threat Behavioral Intelligence System

## Overview

The **AI Insider Threat Behavioral Intelligence System** is a web-based cybersecurity application designed to identify potential insider threats by analyzing employee behavioral patterns. The system leverages **Machine Learning (Isolation Forest)** along with a **Hybrid Rule-Based Detection Engine** to monitor user activities, generate behavioral baselines, detect anomalies, and provide actionable security insights.

The application is built using **FastAPI**, **PostgreSQL**, **React**, and **Scikit-learn**, offering a secure and intelligent platform for insider threat detection and behavioral analytics.

---

# Features

## Authentication

- Secure JWT-based Authentication
- User Registration
- User Login
- Protected API Endpoints

---

## Employee Management

- Add Employee
- View Employee Details
- Update Employee Information
- Delete Employee

---

## Behaviour Log Management

Manage employee behavioral activities including:

- Failed Login Attempts
- Files Downloaded
- Emails Sent
- Login Hour
- USB Usage
- After-Hours Activity

Features include:

- Add Behaviour Logs
- View Behaviour Logs
- Update Behaviour Logs
- Delete Behaviour Logs

---

## Behaviour Baseline Generation

Generate employee behavioral baselines from historical activity records.

Baseline metrics include:

- Average Failed Logins
- Average Files Downloaded
- Average Emails Sent
- Average Login Hour
- USB Usage Rate
- After-Hours Activity Rate

---

## Behaviour Analytics

Analyze employee behavior against generated baselines to identify suspicious activities and behavioral deviations.

---

## AI Threat Detection

Hybrid AI-based anomaly detection using:

- Isolation Forest Machine Learning Model
- Business Rule Engine

### Business Rules

- Failed Logins ≥ 8
- Files Downloaded ≥ 400
- Emails Sent ≥ 80
- USB Usage Rate ≥ 80%
- After-Hours Activity ≥ 80%

If **two or more rules** are triggered, the employee is classified as:

- **Prediction:** Anomaly
- **Risk Level:** High

Otherwise, the prediction is generated using the Isolation Forest model.

---

## AI Prediction

Generate intelligent employee risk predictions including:

- Prediction Status (Normal / Anomaly)
- Risk Level (Low / Medium / High)
- Detection Method (Isolation Forest / Hybrid Rules)

---

## Threat Alerts

Automatically generate alerts for suspicious employee activities based on AI predictions.

---

## Dashboard

The dashboard provides an overview of the entire system including:

- Total Employees
- Behaviour Logs
- Threat Alerts
- AI Predictions
- Behaviour Analytics Summary
- Risk Distribution Charts

---

## PDF Report Generation

Generate professional AI Anomaly Detection Reports containing:

- Report Information
- Executive Summary
- Employee Information
- Behaviour Analysis
- AI Prediction
- Risk Factors
- Recommendations

---

# Technology Stack

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- Pydantic
- Uvicorn

## Frontend

- React
- Bootstrap
- Axios
- React Router

## Machine Learning

- Scikit-learn
- Isolation Forest
- NumPy
- Pandas

## Reporting

- ReportLab

---

# Project Structure

```text
insider-threat-behavioral-intelligence-system/
│
├── Backend/
│   ├── app/
│   │   ├── ml/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── database.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# Machine Learning Workflow

1. Employee behaviour logs are collected.
2. Behaviour baselines are generated.
3. Behaviour analytics are performed.
4. Hybrid AI model evaluates employee activity.
5. Business rules are applied.
6. Isolation Forest predicts anomalies.
7. Final prediction is generated.
8. Threat alerts are created.
9. AI report is generated and downloaded as a PDF.

---

# API Modules

- Authentication
- Employee Management
- Behaviour Logs
- Behaviour Baseline
- Behaviour Analytics
- AI Prediction
- Threat Alerts
- Dashboard
- PDF Report Generation

---

# Current Project Status

## Completed Modules (Milestone 1 & Milestone 2)

- Authentication
- Employee CRUD Operations
- Behaviour Logs CRUD
- Behaviour Baseline Generation
- Behaviour Analytics
- Isolation Forest Machine Learning Model
- Hybrid Rule Engine
- AI Prediction
- Threat Alerts
- Dashboard
- Professional PDF Report Generation

---

# Future Enhancements

- Real-Time User Activity Monitoring
- Advanced Behaviour Analytics
- Continuous AI Model Retraining
- Email Notifications for Threat Alerts
- Role-Based Access Control (RBAC)
- Interactive Security Dashboards
- Advanced Insider Threat Intelligence Features

---

# Installation

## Prerequisites

- Python 3.10+
- PostgreSQL
- Node.js
- npm

---

## Backend Setup

```bash
cd Backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

## Frontend Setup

```bash
cd Frontend

npm install

npm run dev
```

---

# Default URLs

## Backend

```
http://127.0.0.1:8000
```

## Swagger API Documentation

```
http://127.0.0.1:8000/docs
```

## Frontend

```
http://localhost:5173
```

---

# Screenshots

You can add screenshots of:

- Dashboard
- Employee Management
- AI Prediction
- Threat Alerts
- PDF Report Preview

---

# License

This project is developed for educational and research purposes.

---

# Author

**Darshan Lohakare**

Master of Computer Applications (MCA)

**GitHub:**
https://github.com/springboardmentor184-png

---
