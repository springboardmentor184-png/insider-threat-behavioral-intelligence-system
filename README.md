# Insider Threat Behavioral Intelligence System

An AI-powered platform that continuously monitors employee activity, builds behavioral baselines, detects anomalies, and generates risk-based security alerts to help organizations proactively identify insider threats.

Built as part of the Infosys Springboard Internship Program.

## Overview

The platform helps organizations identify suspicious behavior, prevent data breaches, detect account misuse, and monitor privilege abuse through behavioral analytics and AI-driven risk assessment. It's designed for enterprises, financial institutions, healthcare organizations, government agencies, and Security Operations Centers (SOCs).

## Features (Module 1 — Implemented)

- **User Registration & Login** — secure account creation with hashed passwords (bcrypt)
- **JWT Authentication** — stateless token-based authentication
- **Role-Based Access Control (RBAC)** — supports four roles: Security Analyst, SOC Engineer, Security Manager, Administrator
- **Protected Routes** — endpoints secured by JWT validation and role checks
- **User Profile Retrieval** — authenticated users can fetch their own profile via `/me`

## Tech Stack

**Backend**
- Python
- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL (hosted on Neon)
- python-jose (JWT)
- Passlib + bcrypt (password hashing)

**Frontend**
- React (Vite)
- Axios
- React Router

**Planned / Full System Scope**
- MongoDB (activity logs)
- Elasticsearch (search & analytics)
- Redis (caching/sessions)
- Docker (containerization)
- AWS / Azure (deployment)
- Scikit-learn, XGBoost, Isolation Forest, TensorFlow/PyTorch (behavioral analytics & anomaly detection)

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry point
│   │   ├── database.py      # DB connection & session handling
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic request/response schemas
│   │   ├── auth.py          # Password hashing, JWT logic, RBAC
│   │   └── routes.py        # API endpoints
│   ├── requirements.txt
│   └── .env                 # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   └── api.js           # Axios instance/config
│   └── package.json
│
└── docs/
    └── project-specification.pdf
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A PostgreSQL database (e.g., a free [Neon](https://neon.tech) instance)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install fastapi uvicorn sqlalchemy psycopg2-binary "python-jose[cryptography]" "passlib[bcrypt]" python-multipart python-dotenv pydantic-settings "pydantic[email]"
```

Create a `.env` file in `backend/`:
```
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
SECRET_KEY=<your-generated-secret-key>
```

Run the server:
```bash
uvicorn app.main:app --reload
```

API docs available at `http://127.0.0.1:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

## API Endpoints

| Method | Endpoint    | Description                          | Auth Required |
|--------|-------------|---------------------------------------|----------------|
| POST   | `/register` | Register a new user                   | No             |
| POST   | `/login`    | Log in and receive a JWT access token | No             |
| GET    | `/me`       | Get the current authenticated user    | Yes            |
| GET    | `/users`    | List all users                        | Yes (Admin only) |

## Roles

- **Security Analyst**
- **SOC Engineer**
- **Security Manager**
- **Administrator**

## Roadmap

- [x] Module 1: User Authentication & Role-Based Access
- [ ] Module 2: Employee Identity & Profile Management
- [ ] Module 3: Activity Monitoring Engine
- [ ] Module 4: Behavioral Profiling Engine
- [ ] Module 5: Anomaly Detection Engine
- [ ] Module 6: Insider Risk Scoring Engine
- [ ] Module 7: Threat Investigation Module
- [ ] Module 8: UEBA Intelligence Engine
- [ ] Module 9: Alert & Incident Management System
- [ ] Module 10: Dashboard & Analytics
- [ ] Module 11: Notification & Escalation System
- [ ] Module 12: Reports & Export System
- [ ] Module 13: Final Integration, Testing & Deployment

## License

See [LICENSE](./LICENSE) for details.
