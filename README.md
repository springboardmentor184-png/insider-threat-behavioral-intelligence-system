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
│   │   ├── auth.py
│   │   └── activity.py
│   ├── models/
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── department.py
│   │   ├── device.py
│   │   └── activity_event.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── department.py
│   │   ├── device.py
│   │   └── activity_event.py
│   ├── services/
│   ├── database.py
│   └── main.py
│
└── requirements.txt

frontend/
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── GoogleSuccess.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   ├── EmployeePage.jsx
│   │   ├── DepartmentPage.jsx
│   │   └── DevicePage.jsx
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── index.html
├── package.json
└── vite.config.js

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

## Activity Monitoring

- Ingest activity logs in bulk from CSV files (login, file access, device connect/disconnect, email events)
- Record individual live activity events
- Retrieve activity events, filterable by user or event type

## Frontend

- Login, Register, and Google OAuth login pages
- Role-based dashboard with sidebar navigation
- Employee management UI (view all, create/update/delete own profile)
- Department management UI (view all, create)
- Device management UI (create/update/delete own device)
- JWT auto-attached to all requests via Axios interceptor

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
| GET | `/employee/all` | Retrieve all employee profiles |

## Department

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/department` | Create department |
| GET | `/department` | Retrieve all departments |
| PUT | `/department/{department_id}` | Update department *(planned — not yet implemented)* |
| DELETE | `/department/{department_id}` | Delete department *(planned — not yet implemented)* |

## Device

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/device` | Create device |
| GET | `/device` | Retrieve devices |
| PUT | `/device` | Update the current employee's device |
| DELETE | `/device` | Delete the current employee's device |

## Activity Monitoring

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/activity/event` | Record a single activity event |
| POST | `/activity/ingest` | Bulk-ingest activity events from a CSV file |
| GET | `/activity/events` | Retrieve recent activity events (filterable) |


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


## Frontend Setup

Navigate to the frontend directory

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Run the development server

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
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
- Employee Management Module (with full employee listing)
- Department Management Module (create + view all — update/delete planned)
- Device Management Module
- Activity Log Ingestion Pipeline
- React Frontend (Milestone 1 scope: auth, employee/department/device management, role-based dashboard shell)

## In Progress

- Behavioral Analytics Engine 
- Anomaly Detection Workflows

## Planned


- Insider Threat Detection
- Machine Learning Model Integration (Isolation Forest-based anomaly detection)
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