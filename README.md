# Insider Threat Behavioral Intelligence System

An AI-powered Insider Threat Behavioral Intelligence System developed as part of the Infosys Springboard Virtual Internship.

---

# Project Overview

The Insider Threat Behavioral Intelligence System is designed to identify potential insider threats by analyzing employee behavior using Artificial Intelligence and Machine Learning.

The system provides secure authentication, employee management, department management, device management, and will later integrate behavioral analytics and machine learning models to detect suspicious insider activities and assess organizational risk.

---

# Project Objectives

- Secure user authentication and authorization
- Employee profile management
- Department and device management
- Behavioral activity monitoring
- Insider threat detection using Machine Learning
- Risk assessment and prediction
- Interactive security dashboard

---

# Technology Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Passlib (bcrypt)
- JWT Authentication
- Google OAuth 2.0
- Uvicorn

## Frontend (Planned)

- React.js

## AI / Machine Learning (Planned)

- Pandas
- NumPy
- Scikit-learn
- TensorFlow

---

# Project Structure

```text
backend/
│
├── app/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── database.py
│   └── main.py
│
├── requirements.txt

```

---

# Implemented Features

## Authentication

- User Registration
- User Login
- Password Hashing using bcrypt
- JWT Authentication
- Protected Routes
- User Profile API
- Role-Based Access Control (RBAC)
- Google OAuth 2.0 Login

## Employee Management

- Create Employee Profile
- Retrieve Employee Profile
- Update Employee Profile
- Delete Employee Profile

## Department Management

- Create Department
- Retrieve Department
- Update Department
- Delete Department

## Device Management

- Create Device
- Retrieve Device
- Update Device
- Delete Device

---

# API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login using email and password |
| GET | `/profile` | Retrieve authenticated user profile |
| GET | `/auth/google/login` | Login using Google OAuth |

## Employee

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/employee/profile` | Create employee profile |
| GET | `/employee/profile` | Retrieve employee profile |
| PUT | `/employee/profile` | Update employee profile |
| DELETE | `/employee/profile` | Delete employee profile |

## Department

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/department` | Create department |
| GET | `/department` | Retrieve departments |
| PUT | `/department/{department_id}` | Update department |
| DELETE | `/department/{department_id}` | Delete department |

## Device

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/device` | Create device |
| GET | `/device` | Retrieve devices |
| PUT | `/device/{device_id}` | Update device |
| DELETE | `/device/{device_id}` | Delete device |

---

# Setup Instructions

## Clone the repository

```bash
git clone https://github.com/springboardmentor184-png/insider-threat-behavioral-intelligence-system.git
```

## Navigate to the backend directory

```bash
cd backend
```

## Create a virtual environment

```bash
python -m venv venv
```

## Activate the virtual environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

## Install dependencies

```bash
pip install -r requirements.txt
```

## Run the application

```bash
uvicorn app.main:app --reload
```

## API Documentation

Swagger UI

```
http://127.0.0.1:8000/docs
```

---

# Current Progress

## Completed

- User Authentication
- JWT Authentication
- Role-Based Access Control
- Google OAuth Authentication
- Employee Management Module
- Department Management Module
- Device Management Module

## In Progress

- React Frontend Development

## Planned

- Employee Activity Monitoring
- Behavioral Analytics
- Insider Threat Detection
- Machine Learning Model Integration
- Risk Score Prediction
- Dashboard and Reporting

---

# Contributors

**Aman Kumar**

B.Tech Information Technology  
Madhav Institute of Technology and Science (MITS), Gwalior

Infosys Springboard Virtual Internship

---

# License

This project is developed for educational purposes as part of the Infosys Springboard Virtual Internship.