# AI Insider Threat Behavioral Intelligence System

## Overview

The AI Insider Threat Behavioral Intelligence System is a web-based cybersecurity application designed to identify potential insider threats by analyzing employee behavioral patterns. The system leverages Machine Learning (Isolation Forest) along with a Hybrid Rule-Based Detection Engine to monitor user activities, generate behavioral baselines, detect anomalies, calculate insider risk scores, and provide actionable security insights.

The application is built using FastAPI, PostgreSQL, React, and Scikit-learn, providing an intelligent platform for insider threat detection, behavioral analytics, and AI-powered risk assessment.

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

If two or more rules are triggered, the employee is classified as an anomaly.

Otherwise, prediction is generated using the Isolation Forest Machine Learning model.

---

## AI Prediction

Generate intelligent employee threat assessments including:

- Prediction Status (Normal / Anomaly)
- Detection Method
- Triggered Business Rules

---

## Risk Scoring Engine

The application includes a weighted insider risk scoring engine based on behavioral intelligence.

### Weighted Risk Model

- Behavioural Anomalies – 35%
- Privilege Misuse Indicators – 25%
- Data Access Violations – 20%
- Access Pattern Deviations – 10%
- Historical Security Events – 10%

### Risk Categories

- Low
- Medium
- High
- Critical

The engine automatically generates:

- Risk Score (0–100)
- Risk Level
- Threat Severity

---

## Risk Analysis

The Risk Analysis module provides investigation-ready insights including:

- Threat Severity Assessment
- Risk Trend
- Risk Summary
- Security Recommendations
- Behaviour Summary
- Triggered Rules

---

## Threat Alerts

Automatically generate alerts for suspicious employee activities based on AI predictions.

---

## Dashboard

The dashboard provides:

- Total Employees
- Behaviour Logs
- Behaviour Baselines
- AI Predictions
- Risk Scores
- Behaviour Analytics Summary
- Risk Distribution Charts

---

## PDF Report Generation

Generate professional AI Insider Threat Reports containing:

- Report Information
- Executive Summary
- Employee Information
- Behaviour Analysis
- AI Prediction
- Risk Score
- Risk Level
- Threat Severity
- Risk Analysis Summary
- Risk Factors
- Security Recommendations

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
- Pandas
- NumPy

## Reporting

- ReportLab

---

# Project Structure

```
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

```
Employee Behaviour Logs
            │
            ▼
Behaviour Baseline Generation
            │
            ▼
Behaviour Analytics
            │
            ▼
Business Rule Engine
            │
            ▼
Isolation Forest Prediction
            │
            ▼
Hybrid AI Detection
            │
            ▼
Risk Scoring Engine
            │
            ▼
Risk Analysis
            │
            ▼
Threat Alerts
            │
            ▼
Professional PDF Report
```

---

# API Modules

- Authentication
- Employee Management
- Behaviour Logs
- Behaviour Baseline
- Behaviour Analytics
- AI Prediction
- Rule Engine
- Risk Scoring
- Risk Analysis
- Threat Alerts
- Dashboard
- PDF Report Generation

---

# Current Project Status

## Completed Modules

### Milestone 1

- Authentication
- Employee CRUD Operations
- Behaviour Logs CRUD
- Dashboard
- Threat Alerts

### Milestone 2

- Behaviour Baseline Generation
- Behaviour Analytics
- Isolation Forest Machine Learning
- Hybrid AI Prediction
- Professional PDF Report Generation

### Milestone 3 (Completed So Far)

- Rule Engine
- Weighted Risk Scoring Engine
- Risk Level Classification
- Threat Severity Assessment
- Risk Analysis Module
- Risk Recommendations
- Enhanced Prediction Dashboard

---

# Upcoming Modules

- Threat Investigation Module
- Incident Creation
- Threat Timeline
- Evidence Collection
- Insider Threat Alerts
- Investigation Notifications
- Escalation Alerts
- Risk Analytics Dashboard
- Executive Dashboard
- Docker Deployment
- Cloud Deployment
- Final Documentation & Presentation

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

You can add screenshots for:

- Dashboard
- Employee Management
- Behaviour Logs
- AI Prediction
- Risk Analysis
- PDF Report Preview

---

# License

This project is developed for educational and research purposes.

---

# Author

**Darshan Lohakare**

Master of Computer Applications (MCA)

GitHub: https://github.com/springboardmentor184-png
