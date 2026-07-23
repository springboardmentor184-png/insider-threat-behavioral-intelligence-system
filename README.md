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

## Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# Features Completed

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
- Add Employee Button
- Edit Button (UI)
- Delete Button (UI)

Implemented Backend APIs:

- Add Employee Profile
- Fetch Employee Profiles

Employee records are stored in PostgreSQL and displayed in the React frontend.

---

## REST APIs Developed

- User Registration
- User Login
- Fetch Users
- Add Employee
- Fetch Employees
- Administrator Dashboard Statistics

---

# Project Structure

```text
React Frontend
        │
        ▼
Flask REST API
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
- Employee Management UI
- Employee APIs (Add & View)
- GitHub Repository Setup

---

# Work in Progress

The following modules are currently under development:

- Protected Routes using JWT
- Employee CRUD Operations (Edit/Delete)
- Department Management
- Device Management
- Access Privilege Management
- Activity Log Management
- Alert Management
- Risk Score Module
- Search & Filter Functionality
- Reports & Analytics
- Password Hashing
- Role-Based Authorization
- CERT Insider Threat Dataset Integration
- LANL Cyber Security Dataset Integration
- CMU Insider Threat Dataset Integration

---

# Future Enhancements

- Behavioral Anomaly Detection
- Machine Learning Based Insider Threat Prediction
- Real-Time Alerts
- Interactive Charts & Dashboards
- Activity Timeline Visualization
- Security Reports
- Audit Logs
- Email Notifications
- Advanced Risk Analytics

---

# Project Goal

The objective of this project is to build an enterprise-level Insider Threat Behavioral Intelligence System capable of securely managing employees, monitoring user activities, analyzing behavioral patterns, and detecting potential insider threats through role-based access control, data analytics, and machine learning techniques.
