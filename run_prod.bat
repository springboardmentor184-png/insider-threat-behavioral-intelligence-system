@echo off
TITLE Insider Threat UEBA System - Production Launcher
echo ======================================================================
echo    Insider Threat Behavioral Intelligence System (UEBA Platform)
echo                     Production Build & Server Launcher
echo ======================================================================
echo.

echo [1/3] Building Production Frontend Assets...
cd /d "%~dp0frontend"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed! Exiting...
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Starting Production FastAPI Backend Server (0.0.0.0:8000)...
start "Backend - FastAPI Production (Port 8000)" cmd /k "cd /d "%~dp0backend" && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 >nul

echo [3/3] Starting Production Preview Frontend Server (0.0.0.0:3000)...
start "Frontend - Vite Production Preview (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run preview -- --host 0.0.0.0 --port 3000"

echo.
echo ======================================================================
echo  PRODUCTION DEPLOYMENT RUNNING LOCALLY!
echo ======================================================================
echo  - Frontend App:   http://localhost:3000
echo  - Backend API:    http://localhost:8000
echo  - Swagger UI:     http://localhost:8000/docs
echo ======================================================================
echo.
pause
