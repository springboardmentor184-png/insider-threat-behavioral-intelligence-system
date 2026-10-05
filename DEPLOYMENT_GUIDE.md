# 🚀 Insider Threat UEBA System - Project Deployment Guide

This guide provides step-by-step instructions for deploying and running the **Insider Threat Behavioral Intelligence System (UEBA)** located in `D:\Downloads\infosys springboard`.

---

## 📋 Table of Contents
1. [Quick Local Launch (One-Click Windows Launcher)](#1-quick-local-launch-one-click-windows-launcher)
2. [Manual Local Setup (Development Mode)](#2-manual-local-setup-development-mode)
3. [Production Deployment Mode (Local)](#3-production-deployment-mode-local)
4. [Docker & Docker Compose Deployment](#4-docker--docker-compose-deployment)
5. [Cloud Deployment Guide (Render + Vercel / Netlify / Railway)](#5-cloud-deployment-guide)
6. [Environment Variables & Credentials](#6-environment-variables--credentials)

---

## 1. Quick Local Launch (One-Click Windows Launcher)

Two launcher scripts have been created in the project root directory:

* **Development Launcher (`run_dev.bat`)**:
  * Double-click `run_dev.bat` to automatically start both the FastAPI Backend (with hot reloading) and the Vite React Frontend.
  * Access UI at: **`http://localhost:3000`**
  * Access API Docs at: **`http://localhost:8000/docs`**

* **Production Launcher (`run_prod.bat`)**:
  * Double-click `run_prod.bat` to compile production static frontend assets (`dist/`) and serve both backend and frontend in production mode.

---

## 2. Manual Local Setup (Development Mode)

### Prerequisites
* **Python**: `3.10` or higher (Python 3.11 installed in `backend/venv`)
* **Node.js**: `v18.0.0` or higher (Node `v26.4.0` / npm `11.17.0` installed)

### Step A: Backend Setup
1. Open PowerShell / Command Prompt and navigate to `backend`:
   ```powershell
   cd "D:\Downloads\infosys springboard\backend"
   ```
2. Activate Virtual Environment:
   ```powershell
   .\venv\Scripts\activate
   ```
3. Install Dependencies (if needed):
   ```powershell
   pip install -r requirements.txt
   ```
4. Start Backend Server:
   ```powershell
   python -m uvicorn app.main:app --port 8000 --reload
   ```
   * Fast API Interactive Swagger Docs: `http://localhost:8000/docs`

### Step B: Frontend Setup
1. Open a second terminal window and navigate to `frontend`:
   ```powershell
   cd "D:\Downloads\infosys springboard\frontend"
   ```
2. Install Dependencies (if needed):
   ```powershell
   npm install
   ```
3. Start React Development Server:
   ```powershell
   npm run dev
   ```
   * Open browser at: `http://localhost:3000`

---

## 3. Production Deployment Mode (Local)

To build optimized frontend bundle and host backend on `0.0.0.0`:

1. Build frontend static bundle:
   ```powershell
   cd "D:\Downloads\infosys springboard\frontend"
   npm run build
   ```
2. Run backend in production host binding:
   ```powershell
   cd "D:\Downloads\infosys springboard\backend"
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
3. Serve frontend in preview mode:
   ```powershell
   cd "D:\Downloads\infosys springboard\frontend"
   npm run preview -- --host 0.0.0.0 --port 3000
   ```

---

## 4. Docker & Docker Compose Deployment

The project includes pre-configured Dockerfiles and `docker-compose.yml` for multi-container orchestration (PostgreSQL database, FastAPI backend, Nginx frontend).

If Docker Desktop is installed:

```powershell
cd "D:\Downloads\infosys springboard"
docker-compose up --build -d
```

### Services Containers:
* `auth-system-db`: PostgreSQL 15 Database (Port `5432`)
* `auth-system-backend`: FastAPI Python Backend (Port `8000`)
* `auth-system-frontend`: Nginx React App (Port `3000`)

---

## 5. Cloud Deployment Guide

### Option A: Deploying Backend to Render / Railway
1. **Repository**: Push the codebase to GitHub.
2. **Backend Web Service**:
   - Environment: `Python 3.11`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Set Environment Variables: `SECRET_KEY`, `ALGORITHM`, `DATABASE_URL`, `SMTP_USER`, `SMTP_PASSWORD`, `ADMIN_EMAIL`.

### Option B: Deploying Frontend to Vercel / Netlify
1. Connect GitHub repo to Vercel or Netlify.
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Configure API rewrite / proxy or set `VITE_API_BASE_URL` pointing to your deployed backend URL.

---

## 6. Environment Variables & Credentials

The backend configuration is stored in `backend/.env`:

| Key | Description | Default / Example Value |
| :--- | :--- | :--- |
| `SECRET_KEY` | JWT signing secret | `insider_threat_behavioral_intelligence_system_secret_key_2026` |
| `ALGORITHM` | JWT hashing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token session TTL | `60` |
| `DATABASE_URL` | Relational Database URI | `sqlite:///./insider_threat.db` |
| `SMTP_SERVER` | Mail server host | `smtp.gmail.com` |
| `SMTP_PORT` | TLS Port | `587` |
| `SMTP_USER` | Email address for alerts | `venkatsainama995@gmail.com` |
| `SMTP_PASSWORD` | Google App Password | `sutw yhex uuqi ogcu` |
| `ADMIN_EMAIL` | SOC Admin recipient email | `venkatsainama995@gmail.com` |

---

## 🔑 Default Administrator Login Credentials

For testing and reviewing the dashboard out-of-the-box:
* **Email / Username**: `admin@company.com` or `admin_corp`
* **Password**: `AdminPass123!`
