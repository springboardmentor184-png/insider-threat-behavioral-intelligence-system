# Insider Threat Behavioral Intelligence System

An AI-powered User and Entity Behavior Analytics (UEBA) platform that detects insider threats using Machine Learning, Hybrid Rule Engine, Risk Scoring, Threat Investigation, Alert Management, Security Analytics, and Notification workflows.

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
- Executive Security Dashboard
- Department Risk Analytics
- Threat & Investigation Analytics
- PDF Security Reports
- OTP-based Password Recovery
- Role-Based Access Control

---

# Problem Statement

Insider threats, whether intentional or accidental, can manifest through multiple behavioral signals such as failed logins, USB usage, file downloads, mass emails, and after-hours access.

These signals are distributed across different employee activities, making manual correlation slow, error-prone, and difficult to scale.

The system provides centralized visibility and converts behavioral activity into actionable security intelligence through:

- Behavioral monitoring
- AI-based anomaly detection
- Hybrid rule-based detection
- Risk scoring
- Threat alerts
- Automated investigations
- Security notifications
- Analyst workflows
- Executive security analytics

---

# Project Objectives

- Monitor employee behavioral activities.
- Detect suspicious and abnormal behavioral patterns.
- Identify insider threat indicators using AI and rule-based detection.
- Calculate employee risk scores.
- Classify threats into Low, Medium, High, and Critical levels.
- Automatically generate alerts and investigations.
- Provide centralized security visibility.
- Support security analyst investigation workflows.
- Provide in-application and email security notifications.
- Generate security and investigation reports.
- Provide executive-level security analytics.

---

# Technology Stack

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
- Recharts

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
│   ├── app/
│   │   ├── routes/
│   │   │   ├── ai.py
│   │   │   ├── alerts.py
│   │   │   ├── analytics.py
│   │   │   ├── auth.py
│   │   │   ├── employees.py
│   │   │   ├── investigation.py
│   │   │   ├── notification.py
│   │   │   ├── notifications.py
│   │   │   └── ueba.py
│   │   │
│   │   ├── services/
│   │   │   ├── analytics_service.py
│   │   │   ├── investigation_service.py
│   │   │   ├── alert_management_service.py
│   │   │   ├── notification_service.py
│   │   │   ├── email_service.py
│   │   │   ├── password_email_service.py
│   │   │   └── ueba_service.py
│   │   │
│   │   ├── ml/
│   │   │   └── predict.py
│   │   │
│   │   ├── utils/
│   │   │   ├── report_generator.py
│   │   │   └── investigation_report_generator.py
│   │   │
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── config.py
│   │   ├── security.py
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Activitylogs.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── Prediction.jsx
│   │   │   ├── ThreatAlerts.jsx
│   │   │   ├── ThreatInvestigation.jsx
│   │   │   ├── InvestigationDetails.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   └── charts/
│   │   │       ├── RiskChart.jsx
│   │   │       ├── DepartmentRiskChart.jsx
│   │   │       └── ThreatInvestigationChart.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── analyticsService.js
│   │   │   ├── authService.js
│   │   │   ├── investigationService.js
│   │   │   └── uebaService.js
│   │   │
│   │   └── styles/
│   │       └── dashboard.css
│   │
│   ├── package.json
│   └── package-lock.json
│
├── README.md
└── .gitignore


Implemented Features
Authentication

Implemented:

User Login
User Registration
JWT Authentication
Protected APIs
User Session Management
Role-Based Access Control
OTP-based Password Recovery
SMTP Email OTP Delivery
Secure Password Reset
Employee Management

Implemented:

Add Employee
Update Employee
Delete Employee
Employee Dashboard
Employee Search
Employee Risk Score
Employee Department
Employee Role
Employee Filtering
User Behavior Analytics

Implemented:

Behavior Log Monitoring
Employee Activity Analysis
Behavioral Baseline
Failed Login Monitoring
USB Activity Monitoring
After-Hours Login Monitoring
File Download Monitoring
Email Activity Monitoring
Login Hour Analysis
Multi-criteria Activity Filtering
AI Threat Detection

Implemented using:

Isolation Forest
Hybrid Rule Engine
Behavioral Baseline Analysis

Prediction Outputs:

Normal
Anomaly

Risk Levels:

Low
Medium
High
Critical

Detection Methods:

Isolation Forest
Hybrid Rule Engine

AI Prediction Response includes:

Prediction
Risk Score
Risk Level
Threat Severity
Risk Trend
Recommendation
Risk Summary
Detection Method
Triggered Rules
Insider Risk Scoring Engine

Implemented:

Weighted Risk Scoring
Risk Score Generation
Threat Severity Classification
Risk Level Classification
Risk Trend Generation
Risk Recommendation Engine
Risk Summary Generation
Triggered Rule Detection

Risk Classification:

0 - 39     Low
40 - 69    Medium
70 - 89    High
90 - 100   Critical
UEBA Intelligence Dashboard

Implemented:

Employee Selection
Behavioral Analytics
User Behavior Analytics
Entity Behavior Analytics
Behavior Score
Behavior Trend
Department Risk
Peer Group Analysis
Threat Intelligence
Risk Summary
Detection Method
Risk Level
Risk Score
AI Prediction Module

Implemented:

AI Behavior Prediction
Hybrid Threat Detection
Risk Score Calculation
Threat Severity
Risk Trend
Risk Summary
Triggered Rules
Automatic Alert Generation
Automatic Investigation Creation
PDF Risk Report Generation
Threat Investigation Module
Incident Creation
Automatic incident creation for High/Critical insider threats
Alert-linked investigation creation
Threat severity assignment
Investigation status tracking
Investigation Dashboard

Implemented:

Investigation Queue
Active Investigations
Threat Severity
Investigation Status
Assigned Analyst
Open Investigation
Resolved Investigation
Investigation Tracking
Investigation Details

Implemented:

Investigation Summary
Activity Timeline
Threat Evidence Collection
Device Analysis
User Risk History
Event Correlation
Investigation Workflow
Investigation Notes
Recommendations
Threat Timeline

Displays:

Employee Login
Failed Login Attempts
USB Activity
File Downloads
Email Activity
After Hours Login
AI Threat Detection
Investigation Creation
Threat Evidence Collection

Displays:

Failed Logins
Files Downloaded
Emails Sent
USB Usage
After Hours Login
Detection Method
Risk Level
Threat Severity
Device Analysis

Displays:

Login Hour
USB Device Usage
After Hours Login
Files Downloaded
Emails Sent
Device Risk
User Risk History

Implemented:

Current Risk
Previous Risk
Total Incidents
Average Risk Score
Behavioral Trend
Event Correlation

Implemented:

Security Event Correlation
Total Event Calculation
Correlation Score
Event Severity
Correlated Event Identification

Example correlated security events:

Multiple Failed Login Attempts
USB Device Connected
Mass File Download
Bulk Email Activity
After Hours Login
Investigation Workflow

Implemented:

Analyst Assignment
Investigation Status
Investigation Notes
Resolution Notes
Recommendations
Investigation Tracking

Investigation Status:

Open
Assigned
Investigating
Resolved
Closed

Workflow:

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
Risk Analytics

Implemented:

Risk Score
Behaviour Score
Threat Severity
Risk Summary
Department Risk
Behaviour Trend
Correlation Score
Investigation Risk
Employee Risk History
Risk Distribution
Threat Analytics
Alert & Incident Management

Implemented:

Threat Alert Creation
Automatic Alert Generation
Alert Dashboard
Alert Severity Classification
Analyst Assignment
Alert Escalation
Alert Resolution
Resolution Notes
Escalation Levels
Alert Status Tracking
Automatic Incident Creation
Alert Severity Levels

Supported severity levels:

Informational
Low
Medium
High
Critical
Alert Management Dashboard

Implemented:

Total Alerts
Critical Alerts
High Alerts
Open Alerts
Resolved Alerts
Employee Information
Employee Code
Department
Threat Severity
Alert Status
Escalation Level
Assigned Analyst
Alert Creation Time

Available Actions:

Assign
Escalate
Resolve
Analyst Assignment

Security analysts can be assigned to individual alerts.

Workflow:

Open Alert
     |
     v
Assign Analyst
     |
     v
Status -> Assigned
Alert Escalation

Implemented:

Alert Escalation
Escalation Level Tracking
Maximum Escalation Level 3

Workflow:

Level 1
   |
   v
Level 2
   |
   v
Level 3
Alert Resolution

Implemented:

Alert Resolution
Resolution Notes
Resolved Timestamp
Resolution Status

Workflow:

Open
  |
  v
Assigned
  |
  v
Resolved
Automatic Alert Generation

High and Critical risk predictions automatically generate security alerts.

Workflow:

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

The system prevents duplicate active alerts for the same employee.

Automatic Investigation Creation

When a High or Critical threat is detected, the system automatically creates an investigation.

Investigation contains:

Employee
Threat Severity
Investigation Status
Assigned Analyst
Investigation Notes
Recommendation
Alert Reference
Investigation ID
Notification System

Implemented:

Notification Database
Notification Model
Notification Schema
Notification Service
Notification API
Notification Bell
Notification Dropdown
Unread Notification Count
Mark Notification as Read
Mark All Notifications as Read
High-Risk Notifications
Critical-Risk Notifications
Employee-specific Notification Navigation
Duplicate Notification Prevention
Notification Bell

Implemented in the React frontend.

Features:

Notification Bell
Unread Count Badge
Notification Dropdown
Notification Details
Read / Unread State
Mark as Read
Mark All as Read
Navigation to related security information
Email Security Notifications

Implemented using Gmail SMTP.

The system automatically sends security emails for new High and Critical threats.

Email contains:

Employee ID
Employee Name
Department
Employee Role
Risk Level
Risk Score
Prediction
Detection Method
Risk Summary
Triggered Rules
Recommendation
Alert ID
Investigation ID
Email Notification Workflow
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
Duplicate Notification Prevention

Implemented duplicate prevention for:

Active Threat Alerts
In-App Notifications
Gmail Security Emails

Workflow:

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
React Toast Notifications

React Toastify has been integrated into the frontend.

Implemented toast notifications for:

Login Success
Update Success
Analyst Assignment
Alert Escalation
Alert Resolution
Investigation Updates
Notification Actions
API Errors
Workflow Updates
Executive Security Dashboard

Implemented in Milestone 4.

The Executive Security Dashboard provides centralized visibility into the current security posture of the organization.

Implemented KPI metrics:

Total Employees
High Risk Employees
Critical Risk Employees
Average Risk Score
Total Alerts
Critical Alerts
High Alerts
Medium Alerts
Low Alerts
Open Alerts
Resolved Alerts
Total Investigations
Active Investigations
Resolved Investigations
Critical Investigations
High Investigations
Executive Security Analytics

Implemented:

Security Risk Overview
Threat & Investigation Summary
Employee Risk Distribution
Department Risk Analysis
Threat Investigation Analysis
Alert Severity Analysis
Investigation Status Analysis
Average Risk Score
High Risk Monitoring
Critical Risk Monitoring
Advanced Security Charts
Interactive Data Visualization
Dashboard Navigation

Implemented navigation from dashboard elements to related modules:

Employee KPI cards -> Employee Management
Alert KPI cards -> Threat Alerts
Investigation KPI cards -> Threat Investigation
Notification items -> Related security information
Security analytics -> Relevant analytics modules
Reports Module

Implemented:

Security Reports
Investigation Reports
Employee-specific Reports
PDF Report Generation
Downloadable Reports
PDF Report

Generate downloadable PDF reports containing:

Employee Information
Behavioral Metrics
Behavioral Baseline
AI Prediction
Risk Score
Threat Severity
Risk Level
Risk Summary
Recommendation
Detection Method
REST APIs

Implemented APIs include:

Authentication
Login
Registration
OTP Password Recovery
Password Reset
Employees
Employee CRUD
Employee Search
Employee Filtering
Behavior Logs
Activity Logs
Behavioral Baseline
Baseline Analytics
AI
AI Prediction
PDF Report
UEBA
UEBA Dashboard
Behavioral Analytics
Risk Analytics
Threat Investigation
Investigation Dashboard
Investigation Details
Activity Timeline
Threat Evidence
Device Analysis
User Risk History
Event Correlation
Investigation Workflow
Alert Management
Alert Dashboard
Assign Analyst
Escalate Alert
Resolve Alert
Notifications
Get Notifications
Get Unread Notification Count
Mark Notification as Read
Mark All Notifications as Read
Analytics
Executive Security Dashboard Metrics
Risk Analytics
Department Risk Analytics
Threat Analytics
Investigation Analytics
Machine Learning Workflow
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
End-to-End Threat Detection Workflow
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
        |
        v
Executive Security Dashboard
        |
        v
Security Reports
Application Modules

Implemented modules:

Dashboard
Employee Management
UEBA Intelligence
Activity Logs
Threat Alerts
AI Prediction
Threat Investigation
Investigation Details
Alert Management
Notification Center
Reports
User Management
Profile
Settings
Forgot Password
Milestone Progress
Milestone 1 - Project Initialization and Core Setup

Status:

Completed

Implemented:

Project Architecture
Backend Setup
Frontend Setup
Database Configuration
Authentication
Employee Management
Activity Monitoring Foundation
Initial Dashboard
REST API Foundation
Milestone 2 - Behavioral Analytics and Anomaly Detection

Status:

Completed

Implemented:

Behavioral Profiling
Behavioral Baselines
Activity Monitoring
Anomaly Detection
Isolation Forest
Hybrid Rule Engine
AI Threat Prediction
Risk Indicators
AI Risk Reports
Behavioral Analytics
UEBA Foundation
Milestone 3 - Risk Scoring & Threat Investigation

Status:

Completed

Implemented:

Insider Risk Scoring Engine
UEBA Intelligence Workflows
AI Prediction Engine
Behavioral Risk Analysis
Threat Investigation Dashboard
Activity Timeline
Threat Evidence Collection
Device Analysis
User Risk History
Event Correlation
Investigation Workflow
Automatic Incident Creation
Alert Management
Analyst Assignment
Alert Escalation
Alert Resolution
Risk Analytics
Security Dashboards
High and Critical Threat Alerts
Gmail Security Notifications
In-App Notification System
Notification Bell
Unread Notification Count
Mark Notification as Read
Mark All Notifications as Read
Duplicate Alert Prevention
Duplicate Notification Prevention
Duplicate Email Prevention
React Toast Notifications
End-to-End Threat Detection Workflow
Milestone 3 End-to-End Workflow
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

Milestone 3 Status:

Completed

Milestone 3 Final Testing

The following functionality has been tested successfully:

AI Prediction
Low Risk Detection
High Risk Detection
Critical Risk Detection
Risk Score Generation
Hybrid Rule Detection
Automatic Alert Creation
Automatic Investigation Creation
Investigation Dashboard
Activity Timeline
Threat Evidence
Device Analysis
User Risk History
Event Correlation
Investigation Workflow
Alert Management Dashboard
Analyst Assignment
Alert Escalation
Alert Resolution
In-App Notifications
Notification Bell
Unread Notification Count
Mark as Read
React Toast Notifications
Gmail Security Email
Duplicate Alert Prevention
Duplicate Notification Prevention
Duplicate Email Prevention
End-to-End Security Workflow

Final Milestone 3 Testing Status:

Completed Successfully

Milestone 4 - Analytics, Testing & Final Enhancements

Status:

Completed

Implemented:

Executive Security Dashboard
Advanced Security Analytics
Security KPI Cards
Advanced Charts
Threat Visualization
Risk Visualization
Alert Analytics
Investigation Analytics
Department Risk Analytics
Security Metrics
Analytics API
Analytics Service
Dashboard Navigation
Employee Risk Distribution
Threat & Investigation Summary
Final UI Improvements
OTP Password Recovery
SMTP Email Integration for OTP
User Management
Enhanced Authentication
End-to-End Testing
Final Project Validation
Final Documentation
Final Project Presentation
Working Project Demonstration
Milestone 4 Executive Dashboard

The Executive Security Dashboard provides centralized visibility into the current security posture of the organization.

Implemented dashboard metrics:

Total Employees
High Risk Employees
Critical Risk Employees
Average Risk Score
Total Alerts
Critical Alerts
High Alerts
Medium Alerts
Low Alerts
Open Alerts
Resolved Alerts
Total Investigations
Active Investigations
Resolved Investigations
Critical Investigations
High Investigations

The dashboard displays these metrics dynamically through the Analytics API.

Milestone 4 Analytics

Implemented:

Security Risk Overview
Threat & Investigation Summary
Employee Risk Distribution
Department Risk Analysis
Threat Investigation Analysis
Alert Severity Analysis
Investigation Status Analysis
Average Risk Score
High Risk Employee Monitoring
Critical Risk Employee Monitoring
Advanced Security Charts
Interactive Data Visualization
Milestone 4 Dashboard Workflow
Security Data
      |
      v
Analytics API
      |
      v
Analytics Service
      |
      v
Executive Security Dashboard
      |
      +-----------------------+
      |                       |
      v                       v
Security Risk Overview   Threat & Investigation
      |                       |
      v                       v
Risk Analytics          Threat Analytics
      |
      v
Interactive Charts
      |
      v
Employee / Alert / Investigation Navigation
Final Project Workflow
Employee Behaviour
        |
        v
Behavioral Analytics
        |
        v
Behavioral Baseline
        |
        v
AI Threat Detection
        |
        v
Hybrid Rule Engine
        |
        v
Risk Scoring
        |
        v
Threat Classification
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
Analyst Workflow
        |
        +----------------------+
        |                      |
        v                      v
In-App Notification     Gmail Security Email
        |
        v
Alert Management
        |
        v
Executive Security Dashboard
        |
        v
Security Analytics
        |
        v
Reports / Resolution
Key Features and Results

The completed system provides:

Centralized employee behavior monitoring.
AI-powered anomaly detection.
Hybrid rule-based threat detection.
Behavioral baseline analysis.
Insider risk scoring.
Low, Medium, High, and Critical classification.
Automatic High/Critical threat alert generation.
Automatic investigation creation.
Duplicate alert prevention.
Event correlation.
Threat evidence collection.
User risk history.
Device risk analysis.
Investigation workflow.
Analyst assignment.
Alert escalation.
Alert resolution.
In-app security notifications.
Gmail security email notifications.
Executive security dashboard.
Department risk analytics.
Threat and investigation analytics.
Interactive security charts.
PDF security reports.
OTP-based password recovery.
JWT authentication.
Role-Based Access Control.
PostgreSQL database integration.
Testing

Final testing covered:

Authentication
JWT Authentication
Role-Based Access Control
OTP Password Recovery
Employee Management
Employee Search
Activity Logs
Activity Log Filtering
Behavioral Baselines
AI Prediction
Isolation Forest Detection
Hybrid Rule Engine
Risk Scoring
UEBA Intelligence
Threat Alerts
Duplicate Alert Prevention
Threat Investigation
Investigation Workflow
Event Correlation
User Risk History
Threat Evidence
Device Analysis
Alert Assignment
Alert Escalation
Alert Resolution
Notifications
Email Notifications
Executive Dashboard
Security Analytics
Department Risk Analytics
Threat Analytics
Investigation Analytics
Reports
PDF Generation
End-to-End Security Workflow

The working application was tested before the final project presentation and live demonstration.

Security Considerations

Implemented security practices:

JWT Authentication
Protected API Routes
Role-Based Access Control
Environment Variables
Gmail App Password Authentication
Database Credentials Stored Outside Source Code
.env Excluded from Git
Duplicate Alert Prevention
Duplicate Notification Prevention
Duplicate Email Prevention

Sensitive credentials such as:

Database Password
Gmail App Password
JWT Secret
SMTP Credentials

must not be committed to the GitHub repository.

Challenges Faced and Solutions
1. Multiple Behavioral Signals
Challenge

Employee behavior was distributed across multiple activity signals such as failed logins, USB usage, downloads, emails, and after-hours activity.

Solution

Implemented centralized behavioral analysis, behavioral baselines, and risk scoring.

2. Accurate Threat Detection
Challenge

Individual behavioral signals can be noisy and may not accurately represent a real insider threat.

Solution

Combined Isolation Forest with a Hybrid Rule Engine to analyze multiple behavioral indicators.

3. Automated Alert and Investigation Workflow
Challenge

Manually creating alerts and investigations can be time-consuming and error-prone.

Solution

Implemented automatic threat alert generation, investigation creation, notifications, and Gmail security alerts for High and Critical threats.

4. Secure Authentication and Password Recovery
Challenge

Security applications require controlled access and secure password recovery.

Solution

Implemented JWT authentication, RBAC, password hashing, OTP-based password recovery, and SMTP email delivery.

5. Centralized Security Visibility
Challenge

Security information was distributed across employee activity, alerts, investigations, and behavioral analytics.

Solution

Implemented an Executive Security Dashboard with centralized security KPIs, risk analytics, threat analytics, and investigation analytics.

Future Enhancements
Real-time event streaming for live monitoring.
Advanced ML models with adaptive behavioral baselines.
Advanced event correlation across multiple security sources.
SIEM integration.
SOAR integration.
Enterprise-scale deployment.
High availability architecture.
Advanced threat intelligence integration.
Real-time security event processing.
Cloud deployment.
Production monitoring and logging.
Automated security testing.
Performance optimization.
Current Project Status
Milestone 1    Completed
Milestone 2    Completed
Milestone 3    Completed
Milestone 4    Completed

Current system capabilities:

Employee Behaviour
        |
        v
Behavioral Analytics
        |
        v
AI Threat Detection
        |
        v
Hybrid Rule Engine
        |
        v
Risk Scoring
        |
        v
Threat Classification
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
        |
        v
Executive Security Dashboard
        |
        v
Security Analytics
        |
        v
Reports / Resolution

The system currently supports an end-to-end insider threat detection and investigation workflow from employee behavioral analysis through AI risk scoring, threat alert generation, automatic investigation creation, event correlation, analyst workflow, alert management, in-app notification, Gmail security alerting, executive security analytics, and reporting.

Future Scope
Real-time event streaming for live monitoring.
Advanced ML models with adaptive behavioral baselines.
SIEM and SOAR platform integration.
Enterprise-scale deployment with high availability.
Cloud-based deployment.
Advanced threat intelligence integration.
Real-time security monitoring.
Automated incident response.
Advanced behavioral correlation.
Developer

Darshan Lohakare

AI Intern

Pune, India

License

This project is developed for educational and research purposes.
