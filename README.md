# 🛡️ Insider Threat Behavioral Intelligence System

An AI-powered Insider Threat Behavioral Intelligence System developed as part of the Infosys Springboard Virtual Internship.

---

# 📖 Project Overview

This project aims to detect potential insider threats by analyzing employee behavior using Machine Learning and Artificial Intelligence.

The system will monitor employee activities, identify suspicious behavioral patterns, assess risk levels, and help security teams take preventive actions.

---

# 🎯 Project Objectives

- Secure user authentication
- Employee activity monitoring
- Behavioral risk analysis
- Insider threat prediction using ML
- Interactive dashboard for visualization

---

# 🚀 Current Progress

### ✅ Backend

- FastAPI project setup
- User Registration API
- Password hashing using bcrypt
- Password verification
- SQLAlchemy integration
- SQLite database connection
- User data persistence
- Duplicate email validation

### ⏳ In Progress

- Login API
- JWT Authentication
- Role-Based Access Control (RBAC)

### 📅 Planned

- Employee activity logging
- ML model integration
- Risk score prediction
- Dashboard APIs

---

# 🛠️ Technology Stack

## Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Passlib (bcrypt)
- Uvicorn

## AI / ML (Planned)

- Pandas
- NumPy
- Scikit-learn
- TensorFlow

---

# 📂 Project Structure

```
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
└── venv/
```

---

# ⚙️ Setup

Clone the repository

```bash
git clone <repository-url>
```

Go inside backend

```bash
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run server

```bash
uvicorn app.main:app --reload
```

Swagger

```
http://127.0.0.1:8000/docs
```

---

# 📌 Available API

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Register a new user |

---

# 🗺️ Roadmap

- ✅ User Registration
- 🔄 Login Authentication
- 🔄 JWT Token
- 🔄 Role-Based Access Control
- 🔄 Employee Monitoring
- 🔄 Insider Threat Detection
- 🔄 Dashboard
- 🔄 Machine Learning Integration

---

# 👨‍💻 Contributor

**Aman Kumar**

B.Tech Information Technology

MITS Gwalior

Infosys Springboard Virtual Internship

---

# 📄 License

This project is developed for educational purposes as part of the Infosys Springboard Internship Program.