# Insider Threat Behavioral Intelligence System

An AI-powered User and Entity Behavior Analytics (UEBA) platform that detects insider threats using Machine Learning, Hybrid Rule Engine, Risk Scoring, Threat Investigation, Alert Management, and Notification workflows.

---

# Project Overview

The Insider Threat Behavioral Intelligence System helps security teams detect, analyze, investigate, and manage suspicious employee activities within an organization.

The system combines:

- User & Entity Behavior Analytics (UEBA)
- Machine Learning (Isolation Forest)
- Hybrid Rule-Based Detection
- Insider Risk Scoring
- Behavioral Baselines
- Threat Investigation Dashboard
- Security Analytics
- Event Correlation
- Threat Evidence Collection
- Alert & Incident Management
- Analyst Assignment
- Alert Escalation
- Alert Resolution
- In-App Security Notifications
- Gmail Security Email Notifications
- Automated Incident Generation

---

# Tech Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Scikit-learn
- Joblib
- JWT Authentication
- SMTP / Gmail
- ReportLab

## Frontend

- React.js
- Bootstrap 5
- Bootstrap Icons
- Axios
- React Router
- React Toastify

## Machine Learning

- Isolation Forest
- Hybrid Rule Engine
- Risk Scoring Engine
- Behavioral Baseline Analysis
- Anomaly Detection

## Database

- PostgreSQL
- SQLAlchemy ORM

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- Swagger / OpenAPI

---

# Project Structure

```text
insider-threat-behavioral-intelligence-system/
│
├── Backend/
│
│   ├── app/
│   │
│   ├── routes/
│   │   ├── ai.py
│   │   ├── alerts.py
│   │   ├── investigation.py
│   │   ├── alert_management.py
│   │   ├── notification.py
│   │   ├── notifications.py
│   │   └── ueba.py
│   │
│   ├── services/
│   │   ├── investigation_service.py
│   │   ├── alert_management_service.py
│   │   ├── notification_service.py
│   │   ├── email_service.py
│   │   └── ueba_service.py
│   │
│   ├── ml/
│   │   └── predict.py
│   │
│   ├── utils/
│   │   └── report_generator.py
│   │
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── config.py
│   └── main.py
│
├── Frontend/
│
│   ├── src/
│   │
│   ├── pages/
│   │   ├── Analytics.jsx
│   │   ├── Prediction.jsx
│   │   ├── ThreatAlerts.jsx
│   │   ├── ThreatInvestigation.jsx
│   │   └── InvestigationDetails.jsx
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── NotificationBell.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── alertManagementService.js
│   │   ├── investigationService.js
│   │   ├── notificationService.js
│   │   └── uebaService.js
│   │
│   └── styles/
│
├── README.md
└── .gitignore
```

---

# Implemented Features

## Authentication

Implemented:

- User Login
- User Registration
- JWT Authentication
- Protected APIs
- User Session Management

---

# Employee Management

Implemented:

- Add Employee
- Update Employee
- Delete Employee
- Employee Dashboard
- Employee Search
- Employee Risk Score
- Employee Department
- Employee Role

---

# User Behavior Analytics

Implemented:

- Behavior Log Monitoring
- Employee Activity Analysis
- Behavioral Baseline
- Failed Login Monitoring
- USB Activity Monitoring
- After-Hours Login Monitoring
- File Download Monitoring
- Email Activity Monitoring
- Login Hour Analysis

---

# AI Threat Detection

Implemented using:

- Isolation Forest
- Hybrid Rule Engine
- Behavioral Baseline Analysis

Prediction Outputs:

- Normal
- Anomaly

Risk Levels:

- Low
- Medium
- High
- Critical

Detection Methods:

- Isolation Forest
- Hybrid Rule Engine

AI Prediction Response includes:

- Prediction
- Risk Score
- Risk Level
- Threat Severity
- Risk Trend
- Recommendation
- Risk Summary
- Detection Method
- Triggered Rules

---

# Insider Risk Scoring Engine

Implemented:

- Weighted Risk Scoring
- Risk Score Generation
- Threat Severity Classification
- Risk Level Classification
- Risk Trend Generation
- Risk Recommendation Engine
- Risk Summary Generation
- Triggered Rule Detection

Risk Classification:

```text
0 - 39     Low
40 - 69    Medium
70 - 89    High
90 - 100   Critical
```

---

# UEBA Intelligence Dashboard

Implemented:

- Employee Selection
- Behavioral Analytics
- User Behavior Analytics
- Entity Behavior Analytics
- Behavior Score
- Behavior Trend
- Department Risk
- Peer Group Analysis
- Threat Intelligence
- Risk Summary
- Detection Method
- Risk Level
- Risk Score

---

# AI Prediction Module

Implemented:

- AI Behavior Prediction
- Hybrid Threat Detection
- Risk Score Calculation
- Threat Severity
- Risk Trend
- Risk Summary
- Triggered Rules
- Automatic Alert Generation
- Automatic Investigation Creation
- PDF Risk Report Generation

---

# Threat Investigation Module

Implemented:

## Incident Creation

- Automatic incident creation for High/Critical insider threats
- Alert-linked investigation creation
- Threat severity assignment
- Investigation status tracking

## Investigation Dashboard

Implemented:

- Investigation Queue
- Active Investigations
- Threat Severity
- Investigation Status
- Assigned Analyst
- Open Investigation
- Resolved Investigation
- Investigation Tracking

## Investigation Details

Implemented:

- Investigation Summary
- Activity Timeline
- Threat Evidence Collection
- Device Analysis
- User Risk History
- Event Correlation
- Investigation Workflow

---

# Threat Timeline

Displays:

- Employee Login
- Failed Login Attempts
- USB Activity
- File Downloads
- Email Activity
- After Hours Login
- AI Threat Detection
- Investigation Creation

---

# Threat Evidence Collection

Displays:

- Failed Logins
- Files Downloaded
- Emails Sent
- USB Usage
- After Hours Login
- Detection Method
- Risk Level
- Threat Severity

---

# Device Analysis

Displays:

- Login Hour
- USB Device Usage
- After Hours Login
- Files Downloaded
- Emails Sent
- Device Risk
---

# User Risk History

Implemented:

- Current Risk
- Previous Risk
- Total Incidents
- Average Risk Score
- Behavioral Trend

Example:

```text
Employee            : Anjali Das
Current Risk        : Critical
Previous Risk       : None
Total Incidents     : 1
Average Score       : 100
Behaviour Trend     : Increasing
```

---

# Event Correlation

Implemented:

- Security Event Correlation
- Total Event Calculation
- Correlation Score
- Event Severity
- Correlated Event Identification

Example correlated security events:

- Multiple Failed Login Attempts
- USB Device Connected
- Mass File Download
- Bulk Email Activity
- After Hours Login

Example:

```text
Employee          : Anjali Das
Total Events      : 5
Risk Level        : Critical
Correlation Score : 100%
```

---

# Investigation Workflow

Implemented:

- Analyst Assignment
- Investigation Status
- Investigation Notes
- Resolution Notes
- Recommendations
- Investigation Tracking

Investigation Status:

- Open
- Assigned
- Investigating
- Resolved
- Closed

Workflow:

```text
Open
  |
  v
Assigned
  |
  v
Investigating
  |
  v
Resolved
  |
  v
Closed
```

---

# Risk Analytics

Implemented:

- Risk Score
- Behaviour Score
- Threat Severity
- Risk Summary
- Department Risk
- Behaviour Trend
- Correlation Score
- Investigation Risk
- Employee Risk History

---

# Alert & Incident Management

Implemented:

- Threat Alert Creation
- Automatic Alert Generation
- Alert Dashboard
- Alert Severity Classification
- Analyst Assignment
- Alert Escalation
- Alert Resolution
- Resolution Notes
- Escalation Levels
- Alert Status Tracking
- Automatic Incident Creation

---

# Alert Severity Levels

Supported severity levels:

- Informational
- Low
- Medium
- High
- Critical

---

# Alert Management Dashboard

Implemented:

- Total Alerts
- Critical Alerts
- High Alerts
- Open Alerts
- Resolved Alerts
- Employee Information
- Employee Code
- Department
- Threat Severity
- Alert Status
- Escalation Level
- Assigned Analyst
- Alert Creation Time

Available Actions:

- Assign
- Escalate
- Resolve

---

# Analyst Assignment

Security analysts can be assigned to individual alerts.

Workflow:

```text
Open Alert
     |
     v
Assign Analyst
     |
     v
Status -> Assigned
```

The assigned analyst is stored with the alert and displayed on the Alert Management Dashboard.

---

# Alert Escalation

Implemented:

- Alert Escalation
- Escalation Level Tracking
- Maximum Escalation Level 3

Workflow:

```text
Level 1
   |
   v
Level 2
   |
   v
Level 3
```

---

# Alert Resolution

Implemented:

- Alert Resolution
- Resolution Notes
- Resolved Timestamp
- Resolution Status

Workflow:

```text
Open
  |
  v
Assigned
  |
  v
Resolved
```

---

# Automatic Alert Generation

High and Critical risk predictions automatically generate security alerts.

Workflow:

```text
AI Prediction
      |
      v
High / Critical Risk
      |
      v
Threat Alert Created
      |
      v
Investigation Created
```

The system prevents duplicate active alerts for the same employee.

If an active alert already exists:

```text
Alert already exists
        |
        v
Notification skipped
        |
        v
Email skipped
```

This prevents duplicate security notifications.

---

# Automatic Investigation Creation

When a High or Critical threat is detected, the system automatically creates an investigation.

Investigation contains:

- Employee
- Threat Severity
- Investigation Status
- Assigned Analyst
- Investigation Notes
- Recommendation
- Alert Reference
- Investigation ID

---

# Notification System

Implemented:

- Notification Database
- Notification Model
- Notification Schema
- Notification Service
- Notification API
- Notification Bell
- Notification Dropdown
- Unread Notification Count
- Mark Notification as Read
- Mark All Notifications as Read
- High-Risk Notifications
- Critical-Risk Notifications
- Duplicate Notification Prevention

---

# Notification Bell

Implemented in the React frontend.

Features:

- Notification Bell
- Unread Count Badge
- Notification Dropdown
- Notification Details
- Read / Unread State
- Mark as Read
- Mark All as Read

Example:

```text
High Risk Threat Detected

Arjun Reddy (EMP029) has been classified
as High Risk with a risk score of 70.
```

---

# Email Security Notifications

Implemented using Gmail SMTP.

The system automatically sends security emails for new High and Critical threats.

Email contains:

- Employee ID
- Employee Name
- Department
- Employee Role
- Risk Level
- Risk Score
- Prediction
- Detection Method
- Risk Summary
- Triggered Rules
- Recommendation
- Alert ID
- Investigation ID

Example:

```text
Employee ID       : EMP029
Name              : Arjun Reddy
Department        : Sales
Role              : Business Development

Risk Level        : High
Risk Score        : 70
Prediction        : Anomaly
Detection         : Hybrid Rule Engine

Triggered Rules:

- Abnormal Email Activity
- After Hours Activity
- Frequent USB Usage

Recommendation    : Start Investigation

Alert ID          : 4
Investigation ID  : 4
```

---

# Email Notification Workflow

```text
High / Critical Threat
        |
        v
AI Risk Detection
        |
        v
Threat Alert
        |
        +-----------------------+
        |                       |
        v                       v
Investigation             Notification
        |                       |
        v                       v
Alert Management        In-App Notification
                                |
                                v
                         Gmail Security Email
```

---

# Duplicate Notification Prevention

Implemented duplicate prevention for:

- Active Threat Alerts
- In-App Notifications
- Gmail Security Emails

Example:

```text
Existing Active Alert
        |
        v
No Duplicate Alert
        |
        v
No Duplicate Notification
        |
        v
No Duplicate Email
```

---

# React Toast Notifications

React Toastify has been integrated into the frontend.

Implemented toast notifications for:

- Login Success
- Update Success
- Analyst Assignment
- Alert Escalation
- Alert Resolution
- Investigation Updates
- Notification Actions
- API Errors
- Workflow Updates

---

# PDF Report

Generate downloadable PDF reports containing:

- Employee Information
- Behavioral Metrics
- Behavioral Baseline
- AI Prediction
- Risk Score
- Threat Severity
- Risk Level
- Risk Summary
- Recommendation
- Detection Method

---

# REST APIs

Implemented APIs include:

## Authentication

- Login
- Registration

## Employees

- Employee CRUD
- Employee Search

## Behavior Logs

- Activity Logs
- Behavioral Baseline
- Baseline Analytics

## AI

- AI Prediction
- PDF Report

## UEBA

- UEBA Dashboard
- Behavioral Analytics
- Risk Analytics

## Threat Investigation

- Investigation Dashboard
- Investigation Details
- Activity Timeline
- Threat Evidence
- Device Analysis
- User Risk History
- Event Correlation
- Investigation Workflow

## Alert Management

- Alert Dashboard
- Assign Analyst
- Escalate Alert
- Resolve Alert

## Notifications

- Get Notifications
- Get Unread Notification Count
- Mark Notification as Read
- Mark All Notifications as Read

---

# Machine Learning Workflow

```text
Employee Behaviour
        |
        v
Behavioral Baseline
        |
        v
Business Rule Engine
        |
        v
Isolation Forest
        |
        v
Risk Scoring Engine
        |
        v
Threat Severity
        |
        v
Threat Alert
        |
        v
Automatic Investigation
        |
        v
Investigation Workflow
        |
        +----------------------+
        |                      |
        v                      v
Notification              Gmail Alert
        |
        v
Security Dashboard
```

---

# End-to-End Threat Detection Workflow

```text
Employee Activity
        |
        v
Behavior Monitoring
        |
        v
Behavioral Baseline
        |
        v
AI / Hybrid Rule Detection
        |
        v
Risk Score Calculation
        |
        v
Risk Classification
        |
        +----------------------+
        |                      |
        v                      v
High / Critical          Low / Medium
        |                      |
        v                      v
Threat Alert             Continue Monitoring
        |
        v
Automatic Investigation
        |
        v
Event Correlation
        |
        v
Threat Evidence
        |
        v
Investigation Workflow
        |
        +----------------------+
        |                      |
        v                      v
In-App Notification     Gmail Notification
        |
        v
Alert Management
        |
        v
Assign / Escalate / Resolve
```

---

# Application Modules

Implemented modules:

- Dashboard
- Employee Management
- UEBA Intelligence
- Activity Logs
- Threat Alerts
- AI Prediction
- Threat Investigation
- Investigation Details
- Alert Management
- Notification Center
- Settings

- ---

# Milestone Progress

# Milestone 1 - Project Initialization and Core Setup

Status:

**Completed**

Implemented:

- Project Architecture
- Backend Setup
- Frontend Setup
- Database Configuration
- Authentication
- Employee Management
- Activity Monitoring Foundation
- Initial Dashboard
- REST API Foundation

---

# Milestone 2 - Behavioral Analytics and Anomaly Detection

Status:

**Completed**

Implemented:

- Behavioral Profiling
- Behavioral Baselines
- Activity Monitoring
- Anomaly Detection
- Isolation Forest
- Hybrid Rule Engine
- AI Threat Prediction
- Risk Indicators
- AI Risk Reports
- Behavioral Analytics
- UEBA Foundation

---

# Milestone 3 - Risk Scoring & Threat Investigation

Status:

**Completed**

Implemented:

- Insider Risk Scoring Engine
- UEBA Intelligence Workflows
- AI Prediction Engine
- Behavioral Risk Analysis
- Threat Investigation Dashboard
- Activity Timeline
- Threat Evidence Collection
- Device Analysis
- User Risk History
- Event Correlation
- Investigation Workflow
- Automatic Incident Creation
- Alert Management
- Analyst Assignment
- Alert Escalation
- Alert Resolution
- Risk Analytics
- Security Dashboards
- High and Critical Threat Alerts
- Gmail Security Notifications
- In-App Notification System
- Notification Bell
- Unread Notification Count
- Mark Notification as Read
- Mark All Notifications as Read
- Duplicate Alert Prevention
- Duplicate Notification Prevention
- Duplicate Email Prevention
- React Toast Notifications
- End-to-End Threat Detection Workflow

---

# Milestone 3 End-to-End Workflow

```text
Employee Behaviour
        |
        v
Behavioral Baseline
        |
        v
AI Threat Prediction
        |
        v
Risk Score
        |
        v
Threat Classification
        |
        +-----------------------+
        |                       |
        v                       v
Threat Alert              Investigation
        |                       |
        v                       v
Notification              Investigation Workflow
        |                       |
        v                       v
Gmail Alert              Assign / Escalate / Resolve
```

Milestone 3 Status:

**Completed**

---

# Milestone 3 Final Testing

The following functionality has been tested successfully:

- AI Prediction
- Low Risk Detection
- High Risk Detection
- Critical Risk Detection
- Risk Score Generation
- Hybrid Rule Detection
- Automatic Alert Creation
- Automatic Investigation Creation
- Investigation Dashboard
- Activity Timeline
- Threat Evidence
- Device Analysis
- User Risk History
- Event Correlation
- Investigation Workflow
- Alert Management Dashboard
- Analyst Assignment
- Alert Escalation
- Alert Resolution
- In-App Notifications
- Notification Bell
- Unread Notification Count
- Mark as Read
- React Toast Notifications
- Gmail Security Email
- Duplicate Alert Prevention
- Duplicate Notification Prevention
- Duplicate Email Prevention
- End-to-End Security Workflow

Final Milestone 3 Testing Status:

**Completed Successfully**

---

# Milestone 4 - Analytics, Testing & Deployment

Status:

**Upcoming**

Planned features:

- Executive Security Dashboard
- Advanced Security Analytics
- Advanced Charts
- Threat Visualization
- Risk Trend Visualization
- Alert Analytics
- Investigation Analytics
- Department Risk Analytics
- Security Metrics
- API Validation
- End-to-End Testing
- Security Testing
- Performance Testing
- Docker Containerization
- Production Deployment
- Cloud Deployment
- Monitoring and Logging
- Final Documentation
- User Guide
- Final Project Presentation

---

# Planned Analytics

Milestone 4 will focus on:

- Total Threats
- Total Alerts
- Critical Alerts
- High-Risk Employees
- Active Investigations
- Resolved Investigations
- Risk Distribution
- Behavioral Anomalies
- Risk Trends
- Alert Trends
- Investigation Trends
- Department Risk
- Security Metrics
- System Performance

---

# Testing

Testing completed during Milestone 3 includes:

- AI Prediction Testing
- Risk Score Validation
- Low Risk Testing
- High Risk Testing
- Critical Risk Testing
- Alert Creation Testing
- Investigation Creation Testing
- Alert Dashboard Testing
- Analyst Assignment Testing
- Alert Escalation Testing
- Alert Resolution Testing
- Event Correlation Testing
- User Risk History Testing
- Device Analysis Testing
- Threat Evidence Testing
- Investigation Workflow Testing
- Notification API Testing
- Notification Bell Testing
- Unread Notification Testing
- Mark-as-Read Testing
- Gmail Email Testing
- Duplicate Alert Testing
- Duplicate Notification Testing
- Duplicate Email Testing
- React Toast Testing
- End-to-End Threat Workflow Testing

---

# Security Considerations

Implemented security practices:

- JWT Authentication
- Protected API Routes
- Environment Variables
- Gmail App Password Authentication
- Database Credentials Stored Outside Source Code
- `.env` Excluded from Git
- Duplicate Alert Prevention
- Duplicate Notification Prevention
- Duplicate Email Prevention

Sensitive credentials such as:

- Database Password
- Gmail App Password
- JWT Secret
- SMTP Credentials

must not be committed to the GitHub repository.

---

# Current Project Status

```text
Milestone 1    Completed
Milestone 2    Completed
Milestone 3    Completed
Milestone 4    Upcoming
```

Current system capabilities:

```text
Employee Behaviour
        |
        v
Behavioral Analytics
        |
        v
AI Threat Detection
        |
        v
Risk Scoring
        |
        v
Threat Investigation
        |
        v
Event Correlation
        |
        v
Alert Management
        |
        v
Investigation Workflow
        |
        v
In-App Notification
        |
        v
Gmail Security Alert
```

The system currently supports an end-to-end insider threat detection and investigation workflow from employee behavioral analysis through AI risk scoring, threat alert generation, automatic investigation creation, event correlation, analyst workflow, alert management, in-app notification, and Gmail security alerting.

---

# Future Enhancements

- Executive Security Dashboard
- Advanced Security Analytics
- Advanced Data Visualization
- Risk Trend Charts
- Threat Analytics
- Alert Analytics
- Investigation Analytics
- Advanced Reporting
- Automated Testing
- Security Testing
- Performance Optimization
- Docker Containerization
- Cloud Deployment
- Monitoring and Logging
- Production Deployment
- Final Project Documentation
- User Guide
- Final Presentation

---

# Developer

**Darshan Lohakare**

AI Intern

Pune, India

---

# License

This project is developed for educational and research purposes.
