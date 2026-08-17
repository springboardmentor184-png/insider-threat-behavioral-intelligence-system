# Insider Threat Behavioral Intelligence System

AI-powered platform for detecting insider threats through behavioral analytics,
anomaly detection, and risk scoring — built as part of the Infosys Springboard
AI Internship.

## Overview

This system monitors employee activity, builds individual behavioral baselines,
detects anomalies using machine learning, computes risk scores, and surfaces
correlated threat investigations for security analysts.

Built using the real **CERT Insider Threat Dataset** (Kaggle) — both employee
psychometric profiles and activity logs — rather than synthetic data.

## Tech stack

- **Backend:** Python, FastAPI, SQLAlchemy, SQLite
- **Auth:** JWT-based authentication, bcrypt password hashing, role-based access control
- **Machine Learning:** scikit-learn (Isolation Forest for anomaly detection)
- **Frontend:** React (Vite), custom dark "SOC command center" UI
- **Data:** CERT Insider Threat Dataset (psychometric + email activity logs)

## Features completed

### Milestone 1 — Core Platform
- User authentication (register/login) with JWT and bcrypt password hashing
- Role-based access control (Security Analyst, SOC Engineer, Security Manager, Administrator)
- Employee profile management (CRUD)
- Activity log ingestion pipeline (CSV-based, with a real-dataset adapter)
- Custom-designed React dashboard with live backend data

### Milestone 2 — Behavioral Analytics & Anomaly Detection
- Real CERT dataset ingestion (personality profiles + activity logs)
- Behavioral Baseline Engine — per-employee statistical profiling (mean/std-dev
  of activity volume, typical hours, device usage)
- Anomaly Detection Engine using Isolation Forest (scikit-learn)
- Live anomaly report in the dashboard

### Milestone 3 — Risk Scoring & Threat Investigation
- Insider Risk Score Engine — weighted 0–100 score per employee, classified
  into Low / Medium / High / Critical
- UEBA (User & Entity Behavior Analytics) — peer group comparison to flag
  statistical outliers
- Threat Investigation Module — auto-generated cases with correlated event
  timelines for flagged employees
- Interactive tabbed dashboard with risk gauges and expandable investigation timelines

## Project structure
backend/
api/ # FastAPI route definitions
database/
models/ # SQLAlchemy models
services/ # Business logic
utils/ # Auth/security helpers
data/sample/ # CERT dataset samples
app.py # FastAPI entry point
frontend/
src/
Login.jsx
Dashboard.jsx
api.js # Backend API client
docs/ # Architecture & API documentation

## Running locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```
API docs available at `http://127.0.0.1:8000/docs`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
App available at `http://localhost:5173`

## Author

Nithish Kumar R — Infosys Springboard AI Internship
