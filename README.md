Insider Threat Behavioral Intelligence System

## Project Overview

The **Insider Threat Behavioral Intelligence System** is a full-stack enterprise cybersecurity platform that combines **User and Entity Behavior Analytics (UEBA)**, **Machine Learning**, **Risk Scoring**, and **Security Operations workflows** to identify potential insider threats within an organization.

The application securely manages employees, continuously analyzes behavioral patterns, generates insider risk scores, creates automated investigation workflows, delivers critical email alerts, and provides interactive security dashboards for SOC analysts and administrators.

Developed as part of the **Infosys Springboard Internship Program**.

---

# Tech Stack

## Frontend

* React (Vite)
* React Router DOM
* Axios
* Tailwind CSS
* Recharts
* Lucide React
* JavaScript

---

## Backend

* Python
* Flask
* Flask-CORS
* Flask-JWT-Extended
* SQLAlchemy

---

## Database

* PostgreSQL

---

## Machine Learning

* Pandas
* NumPy
* Scikit-learn
* Isolation Forest
* Joblib

---

## Development Tools

* Git
* GitHub
* VS Code
* pgAdmin
* Postman

---

# Milestone 1 – User Management & System Foundation

## Authentication

* User Registration
* User Login
* JWT Authentication
* Role-Based Authentication
* Secure REST APIs
* React–Flask Integration

---

## Role-Based Dashboards

Implemented dashboards for:

* Administrator
* Security Manager
* Security Analyst
* SOC Engineer
* Employee

Each user is redirected according to their assigned role.

---

## Employee Management

Implemented:

* Employee List
* Search Employee
* Add Employee
* Edit Employee
* Delete Employee (UI)
* Department Assignment
* Dataset User Mapping

---

## Database Design

Implemented SQLAlchemy models for:

* Users
* Employee Profiles
* Departments
* Devices
* Alerts
* Access Privileges
* Activity Logs
* Risk Scores

---

# Milestone 2 – Behavioral Analytics & Machine Learning

## CERT Dataset Integration

Completed:

* CERT Insider Threat Dataset imported
* Employee mapping
* Behavioral feature extraction

Features extracted include:

* Average Email Size
* Attachment Count
* Email Content Length
* Working Hour
* Day of Week

---

## Behavioral Profiling Engine

Implemented:

* Feature Engineering Pipeline
* Employee Behaviour Baseline
* Current Behaviour Analysis

---

## AI-Based Insider Threat Detection

Implemented using **Isolation Forest**.

The model classifies employee behaviour as:

* Normal
* Anomaly

---

## Prediction Pipeline

Implemented:

* Model Loading
* Employee Prediction
* Behaviour Comparison
* Feature Analysis

---

# Milestone 3 – UEBA Intelligence Platform

## Insider Risk Scoring Engine

Implemented a behavioural risk scoring engine using:

* Email Size
* Attachment Usage
* Email Content Length
* Working Hours
* Isolation Forest Prediction

Risk Levels:

* Low
* Medium
* High
* Critical

---

## UEBA Intelligence Workflow

The system automatically performs:

* Behaviour Analysis
* Machine Learning Prediction
* Insider Risk Score Generation
* Behaviour Justification
* Recommendation Generation

---

## Threat Investigation Module

Automatic investigations are created for:

* High Risk
* Critical Risk

Each investigation stores:

* Employee
* Risk Score
* Priority
* Status
* Assigned Analyst
* Investigation Description

---

## Threat Notifications

Critical threats automatically generate security notifications.

Notification includes:

* Employee Name
* Risk Score
* Risk Level
* Threat Message
* Timestamp

---

## Automated Email Alert System

Implemented a real-time email alert system using:

* Gmail SMTP
* Python SMTP Library
* TLS Encryption
* Gmail App Password Authentication

Whenever a **Critical** insider threat is detected, the system automatically emails the security team with:

* Employee Details
* Risk Score
* Risk Level
* Behaviour Analysis
* Investigation Recommendation

---

## Security Dashboards

Implemented dashboards for:

* Administrator
* Security Analyst
* Threat Detection
* Investigations
* Notifications
* Reports
* Risk Analytics

---

## Risk Analytics Dashboard

Interactive analytics include:

* Department-wise Average Risk
* Risk Distribution
* Organization Summary
* Highest Risk Employee
* Total Reports
* Total Investigations

Charts are implemented using **Recharts**.

---

# REST APIs

Implemented APIs include:

Authentication

* Register User
* Login User
* Fetch Users

Employee Management

* Add Employee
* Get Employees
* Update Employee

Threat Detection

* Detect Anomaly
* Generate Report

Security Operations

* Investigations
* Notifications
* Risk Analytics Dashboard

Dashboard

* Administrator Statistics

---

# Project Structure

```text
React Frontend
        │
        ▼
Flask REST APIs
        │
        ▼
UEBA Engine
        │
        ▼
Isolation Forest Model
        │
        ▼
Risk Scoring Engine
        │
        ▼
SQLAlchemy ORM
        │
        ▼
PostgreSQL Database
```

---

# Current Progress

## Completed

### Core Platform

* React Frontend
* Flask Backend
* PostgreSQL Database
* SQLAlchemy Models
* JWT Authentication
* Role-Based Dashboards

### Employee Management

* Employee CRUD
* Department Mapping
* Dataset User Mapping

### Machine Learning

* CERT Dataset Integration
* Feature Engineering
* Behaviour Profiling
* Isolation Forest Training
* Prediction Pipeline

### UEBA

* Behaviour Analysis
* Insider Risk Scoring
* Investigation Workflow
* Threat Notifications
* Automated Email Alerts
* Risk Analytics Dashboard

### UI

* Galaxy-inspired Dashboard Theme
* Interactive Charts
* Improved Sidebar
* Improved Navigation

---

# In Progress

* Professional PDF Threat Analysis Report
* Enhanced Security Dashboards
* Advanced Data Visualizations
* Organization-wide Risk Scan

---

# Project Goal

The objective of this project is to build an enterprise-grade **Insider Threat Behavioral Intelligence System** capable of monitoring employee behaviour, detecting insider threats using **Machine Learning**, performing **User and Entity Behavior Analytics (UEBA)**, automatically generating investigations, notifying security analysts through **real-time email alerts**, and providing actionable security intelligence through interactive dashboards and analytics.

