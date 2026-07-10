# 🛡️ Insider Threat Behavioral Intelligence System

## Project Overview

The Insider Threat Behavioral Intelligence System is a web-based security application developed to help organizations monitor employee activities, manage user profiles, and detect potential insider threats.

The system provides role-based access for different users and is being developed as part of the Infosys Springboard internship project.

---

# Tech Stack

### Frontend

* React (Vite)
* React Router DOM
* Axios
* Tailwind CSS
* JavaScript

### Backend

* Python
* Flask
* Flask-CORS
* SQLAlchemy

### Database

* PostgreSQL

### Development Tools

* Git
* GitHub
* VS Code
* Postman

---

# Features Completed

## Authentication

* User Registration
* User Login
* Role-based login
* Backend authentication using Flask APIs
* Frontend connected to backend using Axios

---

## Role-Based Dashboards

Separate dashboards have been created for:

* Administrator
* Security Manager
* Security Analyst
* SOC Engineer
* Employee

Each role is redirected to its respective dashboard after login.

---

## Database Design

The PostgreSQL database has been designed with the following tables:

* Users
* Employee Profiles
* Departments
* Devices
* Access Privileges
* Activity Logs
* Alerts
* Risk Scores

Relationships between tables have been created using foreign keys.

---

## Admin Dashboard

The Administrator dashboard currently displays live statistics from the database, including:

* Total Employees
* Departments
* Registered Devices
* Open Alerts

The dashboard retrieves data through Flask REST APIs connected to PostgreSQL.

---

## Employee Management

A professional Employee Management interface has been created with:

* Employee table
* Search bar
* Add Employee button
* Edit button (UI)
* Delete button (UI)

Backend integration for CRUD operations is currently under development.

---

## REST APIs Developed

* User Registration
* User Login
* Fetch Users
* Fetch Employees
* Admin Dashboard Statistics

---

# Project Structure

```text
Frontend (React)
        │
        ▼
REST API (Flask)
        │
        ▼
SQLAlchemy ORM
        │
        ▼
PostgreSQL Database
```

---

# Current Project Status

### Completed

* Project setup
* Database configuration
* React frontend
* Flask backend
* PostgreSQL integration
* User authentication
* Role-based navigation
* Admin dashboard
* Employee Management UI
* Database schema

---

# Work in Progress

The following features are currently being developed:

* JWT Authentication
* Protected Routes
* Employee CRUD Operations
* Department Management
* Device Management
* Access Privilege Management
* Activity Log Management
* Alert Generation
* Risk Score Module
* Search and Filter Functionality
* Reports and Analytics
* Role-based Authorization
* Password Hashing
* CERT Insider Threat Dataset Integration
* LANL Cyber Security Dataset Integration
* CMU Insider Threat Dataset Integration

---

# Future Enhancements

* Behavioral anomaly detection
* Insider threat risk prediction
* Real-time alerts
* Interactive dashboards and charts
* Activity timeline visualization
* Machine Learning based threat detection
* Security reports
* Audit logs
* Email notifications
* Advanced analytics

---

# Project Goal

The goal of this project is to build an enterprise-level Insider Threat Behavioral Intelligence System that enables organizations to securely manage employees, monitor user activities, analyze behavioral patterns, and detect potential insider threats through role-based access control and data-driven security analytics.
