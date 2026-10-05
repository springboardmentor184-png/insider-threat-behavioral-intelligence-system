@echo off
TITLE Insider Threat UEBA System - Development Launcher
echo ======================================================================
echo    Insider Threat Behavioral Intelligence System (UEBA Platform)
echo                     Local Development Launcher
echo ======================================================================
echo.

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "Backend - FastAPI Server (Port 8000)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload"

timeout /t 3 >nul

echo [2/2] Starting React Vite Frontend on http://localhost:3000 ...
start "Frontend - React Vite Web App (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ======================================================================
echo  SYSTEM LAUNCHED SUCCESSFULLY!
echo ======================================================================
echo  - Frontend Web UI:    http://localhost:3000
echo  - Backend API Docs:   http://localhost:8000/docs
echo  - Default Login:      admin@company.com / AdminPass123!
echo ======================================================================
echo.
pause
