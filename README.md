# 🛡️ AI Insider Threat Behavioral Intelligence System

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://mongodb.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://mysql.com)

An enterprise-grade AI-powered insider threat detection system that monitors employee activities, builds behavioral baselines, detects anomalies, and calculates risk scores in real-time.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Usage](#usage)
- [Milestones](#milestones)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

The **AI Insider Threat Behavioral Intelligence System** is designed to detect and prevent insider threats by:

- **Monitoring** employee activities across multiple systems
- **Building** behavioral baselines for each employee
- **Detecting** anomalies in real-time
- **Scoring** risk levels (0-100)
- **Generating** actionable reports and recommendations

This system helps security teams identify suspicious behavior such as:
- Unusual login times and locations
- Unauthorized file access
- Data exfiltration attempts
- Unusual network activity
- Access from unknown IP addresses

---

## ✨ Features

### 🔐 Authentication & Authorization
- ✅ JWT-based authentication
- ✅ bcrypt password hashing
- ✅ 4 role-based access levels:
  - **Admin** – Full system access
  - **Security Manager** – Oversight and reporting
  - **SOC Engineer** – Investigation and response
  - **Analyst** – View-only access

### 👤 Employee Management
- ✅ Create and manage employee profiles
- ✅ Link employees to user accounts
- ✅ Department and role mapping
- ✅ Full CRUD operations

### 📊 Activity Logging
- ✅ Log activities to MongoDB
- ✅ Track event types: LOGIN, FILE_ACCESS, NETWORK, EMAIL, USB
- ✅ Source system tracking
- ✅ IP address monitoring
- ✅ Severity levels: INFO, WARNING, CRITICAL

### 📈 Behavioral Analytics
- ✅ Build behavioral baselines
- ✅ Analyze event patterns
- ✅ Track source systems usage
- ✅ Monitor IP address patterns
- ✅ Identify working hours trends

### 🚨 Anomaly Detection
- ✅ Real-time anomaly detection
- ✅ Statistical-based detection (no ML training required)
- ✅ Multiple anomaly triggers:
  - Unusual event types
  - Unusual source systems
  - Unusual IP addresses
- ✅ Severity classification (INFO, WARNING, CRITICAL)

### 📉 Risk Scoring
- ✅ Dynamic risk scores (0-100)
- ✅ Risk level classification:
  - 🟢 No Risk (0)
  - 🟢 Low Risk (1-29)
  - 🟡 Medium Risk (30-59)
  - 🟠 High Risk (60-79)
  - 🔴 Critical Risk (80-100)
- ✅ Risk factors identification
- ✅ Actionable recommendations

### 📋 Reports
- ✅ Anomaly reports with timelines
- ✅ Activity summary
- ✅ Recommendations based on anomalies
- ✅ Export-ready data

### 🖥️ Dashboard
- ✅ Real-time statistics
- ✅ Risk score visualization
- ✅ Recent anomalies table
- ✅ Risk factors display
- ✅ Refresh functionality
- ✅ Role-based UI

---

## 🏗️ System Architecture
┌─────────────────────────────────────────────────────────────────┐
│ System Architecture │
├─────────────────────────────────────────────────────────────────┤
│ │
│ ┌──────────────┐ ┌──────────────────────┐ │
│ │ React │ API │ FastAPI Backend │ │
│ │ Dashboard │─────────────▶│ (Port 8000) │ │
│ │ (Port 5173) │ │ │ │
│ └──────────────┘ └──────────┬───────────┘ │
│ ▲ │ │
│ │ ▼ │
│ │ ┌──────────────────────────────────┐ │
│ │ │ Authentication & │ │
│ └──────────────│ Authorization (JWT) │ │
│ ┌──────────────┴──────────────────────────────────┘ │
│ │ │ │ │
│ │ ▼ ▼ │
│ │ ┌─────────────────┐ ┌─────────────────────┐ │
│ │ │ MySQL │ │ MongoDB │ │
│ │ │ (Relational) │ │ (Activity Logs) │ │
│ │ │ - Users │ │ - Activity Logs │ │
│ │ │ - Roles │ │ - Behavioral Data │ │
│ │ │ - Employees │ │ │ │
│ │ └─────────────────┘ └─────────────────────┘ │
│ │ │
│ └──────────▶ Behavioral Analytics Engine │
│ - Baselines │
│ - Anomaly Detection │
│ - Risk Scoring │
└─────────────────────────────────────────────────────────────────┘


---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Programming language |
| FastAPI | 0.100+ | Web framework |
| SQLAlchemy | Latest | ORM for MySQL |
| Motor | Latest | Async MongoDB driver |
| PyMySQL | Latest | MySQL driver |
| Passlib | Latest | Password hashing |
| python-jose | Latest | JWT handling |
| Pydantic | Latest | Data validation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | Latest | Type safety |
| Vite | 8.x | Build tool |
| Tailwind CSS | 4.x | Styling |
| React Router | 6.x | Navigation |
| Axios | Latest | API calls |

### Databases
| Technology | Purpose |
|------------|---------|
| MySQL | Structured data (users, roles, employees) |
| MongoDB | Unstructured data (activity logs) |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Create new user | Public |
| POST | `/auth/login` | Login & get JWT | Public |

### Admin
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/users` | List all users | Admin only |

### Employees
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/employees/` | List all employees | Admin, Security Manager |
| POST | `/employees/` | Create employee | Admin only |
| GET | `/employees/{id}` | Get employee by ID | Admin, Security Manager |
| PUT | `/employees/{id}` | Update employee | Admin only |
| DELETE | `/employees/{id}` | Delete employee | Admin only |

### Activities & Analytics
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/activities/` | Log an activity | All roles |
| GET | `/activities/` | View all activities | All roles |
| GET | `/activities/baseline/{id}` | Get behavioral baseline | All roles |
| POST | `/activities/detect-anomaly` | Detect anomaly | All roles |
| GET | `/activities/report/{id}` | Generate anomaly report | Admin, Sec Mgr, SOC Engineer |
| GET | `/activities/risk-score/{id}` | Calculate risk score | Admin, Sec Mgr, SOC Engineer |

---

## 🚀 Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- MongoDB 7.0+

