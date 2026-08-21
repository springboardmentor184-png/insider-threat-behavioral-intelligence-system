# Insider Threat Behavioral Intelligence System

An AI-powered User and Entity Behavior Analytics (UEBA) platform that monitors employee behavior, establishes behavioral baselines, detects anomalies, calculates insider risk, generates security alerts, manages threat investigations, and provides centralized security analytics.

Built as part of the Infosys Springboard Internship Program.

---

## Overview

The Insider Threat Behavioral Intelligence System helps security teams identify suspicious employee behavior, detect potential insider threats, investigate security incidents, and manage alerts through a centralized security platform.

The system analyzes behavioral signals such as failed login attempts, USB activity, file downloads, email activity, and after-hours access. These signals are analyzed using behavioral baselines, Machine Learning, and a Hybrid Rule Engine to generate actionable security intelligence.

The platform provides:

- Employee behavior monitoring
- Behavioral baseline analysis
- AI-based anomaly detection
- Hybrid rule-based threat detection
- Insider risk scoring
- Threat severity classification
- Automated alert generation
- Automated investigation creation
- Threat evidence collection
- Event correlation
- Analyst investigation workflows
- Alert assignment and escalation
- In-app security notifications
- Gmail security email notifications
- Executive security analytics
- PDF security reports

---

## Project Status

All four core milestones have been completed.

- [x] **Milestone 1:** Project Initialization, Design Process and Core Setup
- [x] **Milestone 2:** Behavioral Analytics and Anomaly Detection
- [x] **Milestone 3:** Risk Scoring and Threat Investigation
- [x] **Milestone 4:** Analytics, Dashboard and Security Enhancements

---

## Problem Statement

Insider threats, whether intentional or accidental, can manifest through multiple behavioral signals such as failed logins, USB usage, file downloads, mass emails, and after-hours access.

These signals are distributed across different employee activities, making manual correlation slow, error-prone, and difficult to scale.

The system addresses this challenge by converting behavioral activity into actionable security intelligence through:

- Behavioral monitoring
- AI-based anomaly detection
- Hybrid rule-based detection
- Behavioral baseline analysis
- Risk scoring
- Threat classification
- Automated investigations
- Alert management
- Security notifications
- Analyst workflows
- Executive security analytics

---

## Project Objectives

- Monitor employee behavioral activities.
- Establish behavioral baselines for employees.
- Detect suspicious and abnormal behavioral patterns.
- Identify insider threat indicators using AI and rule-based detection.
- Calculate employee risk scores.
- Classify threats into Low, Medium, High, and Critical levels.
- Automatically generate alerts for High and Critical threats.
- Automatically create investigations for significant threats.
- Provide centralized security visibility.
- Support security analyst investigation workflows.
- Provide in-application and email security notifications.
- Generate security and investigation reports.
- Provide executive-level security analytics.

---

## Features

### 1. User Authentication and Role-Based Access

- User registration and login
- JWT-based authentication
- Protected API routes
- Password hashing
- Role-Based Access Control
- User management
- OTP-based password recovery
- SMTP email delivery for password recovery
- Secure password reset workflow

---

### 2. Employee Management

- Employee creation
- Employee retrieval
- Employee update
- Employee deletion
- Employee directory
- Employee search
- Employee filtering
- Employee department and role management
- Employee risk score monitoring

---

### 3. Behavioral Activity Monitoring

- Employee behavior logs
- Failed login monitoring
- USB activity monitoring
- After-hours login monitoring
- File download monitoring
- Email activity monitoring
- Login hour analysis
- Activity log filtering
- Multi-criteria activity search

---

### 4. Behavioral Baseline Analysis

The system establishes behavioral baselines to identify deviations from normal employee activity.

Tracked behavioral indicators include:

- Average failed login attempts
- Average files downloaded
- Average emails sent
- Average login hour
- USB usage rate
- After-hours activity rate

Behavioral baselines are used as part of the threat detection and risk analysis process.

---

### 5. AI Threat Detection

The threat detection engine combines Machine Learning and rule-based analysis.

Implemented:

- Isolation Forest
- Hybrid Rule Engine
- Behavioral Baseline Analysis
- Anomaly Detection
- Threat Prediction
- Triggered Rule Identification

Prediction results:

- Normal
- Anomaly

Risk levels:

- Low
- Medium
- High
- Critical

Detection methods:

- Isolation Forest
- Hybrid Rule Engine

---

### 6. Insider Risk Scoring Engine

The risk scoring engine converts behavioral indicators into a normalized risk score.

Implemented:

- Weighted risk scoring
- Risk score generation
- Risk level classification
- Threat severity classification
- Risk trend generation
- Risk summary generation
- Security recommendation generation
- Triggered rule identification

Risk classification:

- 0 - 39: Low
- 40 - 69: Medium
- 70 - 89: High
- 90 - 100: Critical

---

### 7. UEBA Intelligence

The UEBA module provides behavioral intelligence for individual employees.

Implemented:

- Employee selection
- Behavioral analytics
- User Behavior Analytics
- Entity Behavior Analytics
- Behavior score
- Behavior trend
- Department risk
- Peer group analysis
- Threat intelligence
- Risk summary
- Detection method
- Risk level
- Risk score

---

### 8. Threat Investigation

The Threat Investigation module provides an end-to-end investigation workflow for suspicious employees.

Implemented:

- Investigation dashboard
- Investigation queue
- Active investigations
- Investigation details
- Threat severity
- Investigation status
- Assigned analyst
- Investigation notes
- Recommendations
- Investigation timeline
- Threat evidence
- Device analysis
- User risk history
- Event correlation
- Investigation workflow

Investigation status:

- Open
- Assigned
- Investigating
- Resolved
- Closed

---

### 9. Threat Timeline

The investigation timeline provides a chronological view of employee security activity.

Tracked events include:

- Employee login
- Failed login attempts
- USB activity
- File downloads
- Email activity
- After-hours login
- AI threat detection
- Investigation creation

---

### 10. Threat Evidence Collection

The investigation module provides security evidence including:

- Failed logins
- Files downloaded
- Emails sent
- USB usage
- After-hours login
- Risk level
- Detection method
- Threat severity

---

### 11. Device Analysis

The device analysis module provides:

- Login hour
- USB device usage
- After-hours login
- Files downloaded
- Emails sent
- Device risk

---

### 12. User Risk History

Implemented:

- Current risk
- Previous risk
- Total incidents
- Average risk score
- Behavioral trend

---

### 13. Event Correlation

The event correlation module identifies relationships between multiple security events.

Implemented:

- Security event correlation
- Event count
- Correlation score
- Event severity
- Correlated event identification

Events can include:

- Failed login attempts
- USB activity
- File downloads
- Email activity
- After-hours login

---

### 14. Alert and Incident Management

Implemented:

- Threat alert creation
- Automatic alert generation
- Alert dashboard
- Alert severity classification
- Analyst assignment
- Alert escalation
- Alert resolution
- Resolution notes
- Escalation level tracking
- Alert status tracking
- Automatic incident creation

Supported alert severity levels:

- Informational
- Low
- Medium
- High
- Critical

---

### 15. Automatic Threat Alerts

High and Critical risk predictions automatically generate security alerts.

The workflow is:

AI Prediction → High/Critical Risk → Threat Alert → Investigation

The system also prevents duplicate active alerts for the same employee.

---

### 16. Analyst Assignment and Alert Escalation

Security analysts can be assigned to alerts and investigations.

Implemented:

- Analyst assignment
- Investigation status updates
- Alert escalation
- Escalation level tracking
- Resolution notes
- Alert resolution

Escalation levels:

- Level 1
- Level 2
- Level 3

---

### 17. Notification System

Implemented:

- Notification database
- Notification service
- Notification API
- Notification bell
- Unread notification count
- Notification dropdown
- Mark notification as read
- Mark all notifications as read
- Employee-specific notification navigation
- High-risk notifications
- Critical-risk notifications
- Duplicate notification prevention

---

### 18. Email Security Notifications

The system integrates Gmail SMTP for security email notifications.

High and Critical threats can generate security emails containing:

- Employee ID
- Employee name
- Department
- Role
- Risk level
- Risk score
- Prediction
- Detection method
- Risk summary
- Triggered rules
- Recommendation
- Alert ID
- Investigation ID

---

### 19. Duplicate Alert and Notification Prevention

The system prevents duplicate security events when an active alert already exists.

Duplicate prevention is implemented for:

- Threat alerts
- In-app notifications
- Gmail security emails

This prevents unnecessary repeated notifications for the same active threat.

---

### 20. Executive Security Dashboard

Implemented in Milestone 4.

The Executive Security Dashboard provides centralized visibility into the organization's current security posture.

Dashboard KPIs include:

- Total employees
- High-risk employees
- Critical-risk employees
- Average risk score
- Total alerts
- Critical alerts
- High alerts
- Medium alerts
- Low alerts
- Open alerts
- Resolved alerts
- Total investigations
- Active investigations
- Resolved investigations
- Critical investigations
- High investigations

---

### 21. Security Analytics

Implemented:

- Security Risk Overview
- Threat and Investigation Summary
- Employee Risk Distribution
- Department Risk Analysis
- Threat Investigation Analysis
- Alert Severity Analysis
- Investigation Status Analysis
- Average Risk Score
- High-risk employee monitoring
- Critical-risk employee monitoring
- Interactive security charts
- Data visualization

---

### 22. Dashboard Navigation

Dashboard elements provide navigation to relevant application modules.

Implemented:

- Employee KPI cards to Employee Management
- Alert KPI cards to Threat Alerts
- Investigation KPI cards to Threat Investigation
- Notification items to related security information
- Analytics sections to relevant security modules

---

### 23. Reports and PDF Generation

Implemented:

- Security reports
- Investigation reports
- Employee-specific reports
- PDF report generation
- Downloadable security reports

Reports can contain:

- Employee information
- Behavioral metrics
- Behavioral baseline
- AI prediction
- Risk score
- Threat severity
- Risk level
- Risk summary
- Recommendation
- Detection method

---

## Tech Stack

### Backend

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

### Frontend

- React.js
- Vite
- Bootstrap 5
- Bootstrap Icons
- Axios
- React Router
- React Toastify
- Recharts

### Machine Learning

- Isolation Forest
- Hybrid Rule Engine
- Risk Scoring Engine
- Behavioral Baseline Analysis
- Anomaly Detection

### Database

- PostgreSQL
- SQLAlchemy ORM

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- Swagger / OpenAPI

---

## Project Structure

```text
insider-threat-behavioral-intelligence-system/
|
|-- Backend/
|   |-- app/
|   |   |-- routes/
|   |   |   |-- ai.py
|   |   |   |-- alerts.py
|   |   |   |-- alert_management.py
|   |   |   |-- analytics.py
|   |   |   |-- auth.py
|   |   |   |-- employees.py
|   |   |   |-- investigation.py
|   |   |   |-- notification.py
|   |   |   |-- notifications.py
|   |   |   |-- ueba.py
|   |   |
|   |   |-- services/
|   |   |   |-- analytics_service.py
|   |   |   |-- alert_management_service.py
|   |   |   |-- email_service.py
|   |   |   |-- investigation_service.py
|   |   |   |-- notification_service.py
|   |   |   |-- password_email_service.py
|   |   |   |-- ueba_service.py
|   |   |
|   |   |-- ml/
|   |   |   |-- predict.py
|   |   |
|   |   |-- utils/
|   |   |   |-- investigation_report_generator.py
|   |   |
|   |   |-- models.py
|   |   |-- schemas.py
|   |   |-- database.py
|   |   |-- config.py
|   |   |-- security.py
|   |   |-- main.py
|   |
|   |-- requirements.txt
|
|-- Frontend/
|   |-- src/
|   |   |-- pages/
|   |   |   |-- Dashboard.jsx
|   |   |   |-- Analytics.jsx
|   |   |   |-- Activitylogs.jsx
|   |   |   |-- Employees.jsx
|   |   |   |-- Prediction.jsx
|   |   |   |-- ThreatAlerts.jsx
|   |   |   |-- ThreatInvestigation.jsx
|   |   |   |-- InvestigationDetails.jsx
|   |   |   |-- Reports.jsx
|   |   |   |-- UserManagement.jsx
|   |   |   |-- ForgotPassword.jsx
|   |   |   |-- Profile.jsx
|   |   |   |-- Register.jsx
|   |   |   |-- Login.jsx
|   |   |   |-- Settings.jsx
|   |   |
|   |   |-- components/
|   |   |   |-- Navbar.jsx
|   |   |   |-- Sidebar.jsx
|   |   |   |-- NotificationBell.jsx
|   |   |   |-- charts/
|   |   |       |-- RiskChart.jsx
|   |   |       |-- DepartmentRiskChart.jsx
|   |   |       |-- ThreatInvestigationChart.jsx
|   |   |
|   |   |-- services/
|   |   |   |-- analyticsService.js
|   |   |   |-- authService.js
|   |   |   |-- investigationService.js
|   |   |   |-- notificationService.js
|   |   |   |-- uebaService.js
|   |   |
|   |   |-- styles/
|   |       |-- dashboard.css
|   |
|   |-- package.json
|   |-- package-lock.json
|
|-- README.md
|-- .gitignore
```

---

## Machine Learning Workflow

The threat detection workflow follows these stages:

1. Employee Behavior
2. Behavioral Baseline
3. Business Rule Engine
4. Isolation Forest
5. Risk Scoring Engine
6. Threat Severity Classification
7. Threat Alert
8. Automatic Investigation
9. Investigation Workflow
10. Security Notification
11. Executive Security Dashboard

---

## End-to-End Project Workflow

1. Employee Activity
2. Behavior Monitoring
3. Behavioral Baseline Analysis
4. AI and Hybrid Rule Detection
5. Risk Score Calculation
6. Risk Classification
7. High or Critical Threat Detection
8. Threat Alert Creation
9. Automatic Investigation Creation
10. Event Correlation
11. Threat Evidence Collection
12. Analyst Investigation Workflow
13. Alert Assignment
14. Alert Escalation or Resolution
15. In-App Security Notification
16. Gmail Security Notification
17. Executive Security Dashboard
18. Security Analytics
19. Report Generation

Low and Medium risk activities continue under normal monitoring.

---

## Milestone-Wise Implementation

### Milestone 1 - Project Initialization and Core Setup

Status: Completed

Implemented:

- Project architecture
- Backend setup
- Frontend setup
- PostgreSQL database configuration
- Authentication foundation
- Employee management
- Activity monitoring foundation
- Initial dashboard
- REST API foundation

---

### Milestone 2 - Behavioral Analytics and Anomaly Detection

Status: Completed

Implemented:

- Behavioral profiling
- Behavioral baselines
- Activity monitoring
- Anomaly detection
- Isolation Forest
- Hybrid Rule Engine
- AI threat prediction
- Risk indicators
- AI risk reports
- Behavioral analytics
- UEBA foundation

---

### Milestone 3 - Risk Scoring and Threat Investigation

Status: Completed

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

---

### Milestone 4 - Analytics, Dashboard and Security Enhancements

Status: Completed

Implemented:

- Executive Security Dashboard
- Advanced Security Analytics
- Security KPI Cards
- Security Risk Overview
- Threat and Investigation Summary
- Department Risk Analytics
- Employee Risk Distribution
- Threat Investigation Analytics
- Alert Analytics
- Investigation Analytics
- Advanced Security Charts
- Analytics API
- Analytics Service
- Dashboard Navigation
- OTP-Based Password Recovery
- SMTP Email Integration for OTP
- User Management
- Enhanced Authentication
- Role-Based Access Control
- Final UI Improvements
- End-to-End Testing
- Final Project Validation
- Final Documentation
- Final Project Presentation
- Working Project Demonstration

---

## Final Testing

The following functionality was tested successfully:

- User Authentication
- JWT Authentication
- Role-Based Access Control
- OTP Password Recovery
- Employee Management
- Employee Search
- Activity Logs
- Activity Log Filtering
- Behavioral Baselines
- AI Prediction
- Isolation Forest Detection
- Hybrid Rule Engine
- Risk Scoring
- UEBA Intelligence
- Threat Alerts
- Duplicate Alert Prevention
- Threat Investigation
- Investigation Workflow
- Event Correlation
- User Risk History
- Threat Evidence
- Device Analysis
- Analyst Assignment
- Alert Escalation
- Alert Resolution
- In-App Notifications
- Notification Bell
- Notification Read and Unread State
- Gmail Security Email
- Duplicate Notification Prevention
- Duplicate Email Prevention
- Executive Security Dashboard
- Security Analytics
- Department Risk Analytics
- Threat Analytics
- Investigation Analytics
- Reports
- PDF Generation
- End-to-End Security Workflow

The working application was tested before the final project presentation and live demonstration.

---

## Security Considerations

Implemented security practices:

- JWT Authentication
- Protected API Routes
- Role-Based Access Control
- Password Hashing
- Environment Variables
- Gmail App Password Authentication
- Database Credentials Stored Outside Source Code
- `.env` Excluded from Git
- Duplicate Alert Prevention
- Duplicate Notification Prevention
- Duplicate Email Prevention

Sensitive credentials such as database passwords, Gmail app passwords, JWT secrets, and SMTP credentials must not be committed to the GitHub repository.

---

## Challenges Faced and Solutions

### Challenge 1 - Multiple Behavioral Signals

Challenge:

Employee behavior was distributed across multiple activity signals such as failed logins, USB usage, downloads, emails, and after-hours activity.

Solution:

Implemented centralized behavioral analysis, behavioral baselines, and risk scoring to combine multiple behavioral indicators.

---

### Challenge 2 - Accurate Threat Detection

Challenge:

Individual behavioral signals can be noisy and may not accurately represent a real insider threat.

Solution:

Combined Isolation Forest with a Hybrid Rule Engine to analyze multiple behavioral indicators and improve threat identification.

---

### Challenge 3 - Automated Alert and Investigation Workflow

Challenge:

Manually creating alerts and investigations can be time-consuming and error-prone.

Solution:

Implemented automatic threat alert generation, investigation creation, in-app notifications, and Gmail security alerts for High and Critical threats.

---

### Challenge 4 - Secure Authentication and Password Recovery

Challenge:

Security applications require controlled access and secure password recovery.

Solution:

Implemented JWT authentication, Role-Based Access Control, password hashing, OTP-based password recovery, and SMTP email delivery.

---

### Challenge 5 - Centralized Security Visibility

Challenge:

Security information was distributed across employee activity, alerts, investigations, and behavioral analytics.

Solution:

Implemented an Executive Security Dashboard with centralized security KPIs, risk analytics, threat analytics, and investigation analytics.

---

## API Overview

The application provides REST APIs for the following modules:

### Authentication

- Login
- Registration
- OTP Password Recovery
- Password Reset

### Employees

- Employee CRUD
- Employee Search
- Employee Filtering

### Activity and Behavior

- Activity Logs
- Behavioral Baselines
- Behavioral Analytics

### AI and Risk

- AI Prediction
- Risk Scoring
- Risk Analytics
- PDF Risk Reports

### UEBA

- UEBA Dashboard
- Behavioral Analytics
- Department Risk
- Peer Group Analysis

### Investigations

- Investigation Dashboard
- Investigation Details
- Activity Timeline
- Threat Evidence
- Device Analysis
- User Risk History
- Event Correlation
- Investigation Workflow

### Alerts

- Alert Dashboard
- Analyst Assignment
- Alert Escalation
- Alert Resolution

### Notifications

- Get Notifications
- Unread Notification Count
- Mark Notification as Read
- Mark All Notifications as Read

### Analytics

- Executive Security Dashboard
- Security Risk Overview
- Department Risk Analytics
- Threat Analytics
- Investigation Analytics

---

## Future Scope

Potential future enhancements include:

- Real-time event streaming for live monitoring
- Advanced Machine Learning models
- Adaptive behavioral baselines
- Advanced event correlation across multiple security sources
- SIEM integration
- SOAR integration
- Enterprise-scale deployment
- High availability architecture
- Advanced threat intelligence integration
- Real-time security event processing
- Automated incident response
- Cloud deployment
- Production monitoring and logging
- Performance optimization

---

## Current Project Status

The project has completed all four planned milestones.

- Milestone 1: Completed
- Milestone 2: Completed
- Milestone 3: Completed
- Milestone 4: Completed

The current system supports an end-to-end insider threat detection and investigation workflow covering:

- Employee behavioral monitoring
- Behavioral baseline analysis
- AI-based anomaly detection
- Hybrid rule-based detection
- Risk scoring
- Threat classification
- Threat alert generation
- Automatic investigation creation
- Event correlation
- Threat evidence collection
- Analyst investigation workflow
- Alert management
- In-app notifications
- Gmail security notifications
- Executive security analytics
- PDF reporting

---

## Developer

Darshan Lohakare

AI Intern

Pune, India

---

## License

This project is developed for educational and research purposes.
