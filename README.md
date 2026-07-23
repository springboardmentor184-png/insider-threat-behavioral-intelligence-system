# 🛡️ Insider Threat Behavioral Intelligence System

## Project Overview

The Insider Threat Behavioral Intelligence System is a web-based enterprise security application designed to help organizations monitor employee activities, manage user profiles, and detect potential insider threats.

The system provides secure role-based access for different organizational users and is being developed as part of the Infosys Springboard Internship Program.

---

# Tech Stack

## Frontend

- React (Vite)
- React Router DOM
- Axios
- Tailwind CSS
- JavaScript

## Backend

- Python
- Flask
- Flask-CORS
- Flask-JWT-Extended
- SQLAlchemy

## Database

- PostgreSQL

## Machine Learning

- Pandas
- NumPy
- Scikit-learn
- Joblib

## Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# Milestone 1 – User Management & System Foundation

## Authentication

- User Registration
- User Login
- JWT Authentication
- Role-Based Access Control
- Flask REST APIs
- Axios Integration between React and Flask

---

## Role-Based Dashboards

Separate dashboards have been developed for:

- Administrator
- Security Manager
- Security Analyst
- SOC Engineer
- Employee

Each user is redirected to the appropriate dashboard after successful login.

---

## Database Design

The PostgreSQL database contains the following tables:

- Users
- Employee Profiles
- Departments
- Devices
- Access Privileges
- Activity Logs
- Alerts
- Risk Scores

The database schema is implemented using SQLAlchemy ORM with foreign key relationships.

---

## Administrator Dashboard

The Administrator Dashboard displays live statistics retrieved from PostgreSQL, including:

- Total Employees
- Departments
- Registered Devices
- Open Alerts

Dashboard statistics are fetched through secured Flask REST APIs.

---

## Employee Management

The Employee Management module currently includes:

- Employee List
- Search Bar
- Add Employee
- Edit Employee
- Delete Employee (UI)

Implemented Backend APIs:

- Add Employee Profile
- Fetch Employee Profiles
- Update Employee Profile

Employee records are stored in PostgreSQL and displayed in the React frontend.

---

## REST APIs Developed

- User Registration
- User Login
- Fetch Users
- Add Employee
- Fetch Employees
- Update Employee
- Administrator Dashboard Statistics

---

# Milestone 2 – Behavioral Analytics & Anomaly Detection

## Behavioral Profiling Engine

Completed:

- Created the Machine Learning module structure.
- Integrated the CERT Insider Threat Dataset.
- Loaded and processed enterprise email activity data.
- Developed the feature engineering pipeline.
- Extracted behavioral features from employee activities including:
  - Email Size
  - Number of Attachments
  - Hour of Activity
  - Day of Week
  - Email Content Length

---

## AI-Based Anomaly Detection

Completed:

- Implemented an Isolation Forest anomaly detection model using Scikit-learn.
- Trained the model on engineered behavioral features.
- Saved the trained model using Joblib.
- Developed a prediction pipeline for detecting abnormal employee behavior.
- Successfully classified employee activities into:
  - Normal
  - Anomaly

---

## Activity Monitoring

Completed:

- Designed the Activity Logs database model.
- Configured activity storage for employee behavioral events.
- Prepared the backend architecture for continuous activity monitoring.

---

## Current Progress

The following components have been successfully implemented:

- CERT Dataset Integration
- Behavioral Feature Engineering
- Behavioral Profiling Pipeline
- AI Model Training
- Isolation Forest Model
- Prediction Pipeline
- Activity Log Model
- Machine Learning Project Structure

---

## Remaining Work

- Integrate the trained ML model with Flask APIs
- Perform real-time anomaly detection from activity logs
- Generate behavioral baselines for every employee
- Calculate employee risk scores
- Generate insider threat alerts
- Build anomaly reports
- Connect predictions with the Administrator Dashboard
- Add behavioral analytics visualizations
- Integrate LANL Cyber Security Dataset
- Integrate CMU Insider Threat Dataset

---

# Project Structure

```text
React Frontend
        │
        ▼
Flask REST API
        │
        ▼
Machine Learning Engine
        │
        ▼
SQLAlchemy ORM
        │
        ▼
PostgreSQL Database
```

---

# Current Project Status

## Completed

- Project Setup
- React Frontend
- Flask Backend
- PostgreSQL Configuration
- Database Schema Design
- SQLAlchemy Models
- User Authentication
- JWT Token Generation
- Role-Based Navigation
- Administrator Dashboard
- Security Manager Dashboard
- Security Analyst Dashboard
- SOC Engineer Dashboard
- Employee Dashboard
- Employee Management
- Employee CRUD (Add, View, Update)
- Activity Log Model
- CERT Dataset Integration
- Feature Engineering Pipeline
- Behavioral Profiling Engine
- Isolation Forest Model Training
- AI Prediction Pipeline
- GitHub Repository Setup

---

# Project Goal

The objective of this project is to build an enterprise-level Insider Threat Behavioral Intelligence System capable of securely managing employees, monitoring user activities, analyzing behavioral patterns, and detecting potential insider threats through role-based access control, data analytics, and machine learning techniques.
