🛡️ Insider Threat Behavioral Intelligence System

An AI-ready platform for monitoring employee activity, detecting behavioral anomalies, and managing insider risk — built with React, FastAPI, and MySQL.

🎯 Milestone 1 — Project Initialization, Design Process & Core Setup (Week 1-2)

📋 Milestone 1 — Task Checklist

#

Task

Status

1

Setup frontend and backend environments

✅ Done

2

Design system architecture and database schema

✅ Done

3

Implement authentication and role-based access system

✅ Done

4

Build employee profile management workflows

✅ Done

5

Configure activity log ingestion pipelines

✅ Done

6

Create UI wireframes and workflow planning

✅ Done

7

Define project objectives and insider threat workflows

✅ Done

ALL MILESTONE 1 TASKS COMPLETED (7/7)

🏗️ What Was Built

1. Frontend & Backend Environment Setup

Initialized React (Vite) frontend on localhost:5173

Initialized FastAPI backend on 127.0.0.1:8000, served via uvicorn

Configured CORS so frontend and backend communicate securely

Set up Python virtual environment and full dependency chain (fastapi, uvicorn, sqlalchemy, pymysql, python-jose, passlib, bcrypt, authlib)

2. System Architecture & Database Schema

Connected backend to MySQL via SQLAlchemy ORM

Designed and created core tables:

users — accounts, hashed passwords, roles

user_profiles — employee details (Employee ID, Department, Designation, Manager, Device Info, Access Privileges)

alerts — security alert records

activity_logs — activity tracking and ingestion

Verified live database connectivity end-to-end (register, write, read confirmed directly in MySQL Workbench)

3. Authentication & Role-Based Access

Registration with bcrypt-hashed passwords (no plain text stored)

Login issuing real JWT access tokens, verified against hashed passwords

Google OAuth 2.0 login: full flow implemented (redirect, Google consent, callback, JWT issuance, frontend session handoff)

Role-based dashboards for 4 distinct roles:

Administrator — system health, user management, audit logs, quick controls

Security Manager — organizational risk posture, compliance metrics, risk trends

SOC Engineer — live alerts, behavioral anomalies, active investigations

Security Analyst — assigned alerts, risk scores, investigation queue

Protected route logic reading role from JWT/session on frontend

4. Employee Profile Management

user_profiles schema completed: Employee ID, Department, Designation, Manager, Device Info, Access Privileges, linked to users table via user_id

Profile create/update workflow connected to backend and database

5. Activity Log Ingestion Pipeline

activity_logs table designed and connected

Login and key user actions written into activity_logs for downstream monitoring and reporting

6. UI & Workflow Planning

Built working screens for Login, Register, and all 4 role dashboards

As-built UI documented in place of pre-build wireframes, given the iterative build approach used

7. Project Objectives

Defined via product requirements: AI-powered behavioral monitoring, anomaly detection, insider risk scoring, and alerting for enterprises, financial institutions, and SOC teams

🐛 Useful Problems Solved

Real bugs with a non-obvious cause and a lasting fix.

#

Problem

Cause

Fix

1

DATABASE_URL always None (sqlalchemy.exc.ArgumentError)

The full connection string was passed as the variable name into os.getenv(), instead of just "DATABASE_URL"

DATABASE_URL = os.getenv("DATABASE_URL")

2

Special characters breaking the DB connection string

MySQL password contained a space and an @; @ is a reserved separator character in connection URLs

URL-encoded the password in .env (space → %20, @ → %40)

3

bcrypt/passlib version conflict (password cannot be longer than 72 bytes on a 9-char password)

A breaking change in bcrypt 4.1+ is incompatible with passlib's internal self-test

Pinned bcrypt==4.0.1

4

Valid logins failing (UnknownHashError)

Accounts created before hashing was added still had plain-text passwords; comparing a hash function against plain text always fails

Hashed all new registrations going forward; purged legacy plain-text accounts with DELETE FROM users WHERE password NOT LIKE '$2b$%';

5

Frontend rejecting successful backend logins

Frontend checked if (response.access_token), but backend hadn't implemented JWT issuance yet — a silent API contract mismatch

Backend updated to return access_token on successful login, matching frontend expectations exactly

6

Google OAuth crashing (SessionMiddleware must be installed)

Authlib's OAuth redirect flow needs temporary session storage; FastAPI has none by default

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

7

OAuth succeeding on backend, 404 on frontend

Backend correctly issued the JWT and redirected, but no frontend route existed to receive it

Built an OAuthSuccess page to parse the token from the URL, store it, and route to the dashboard

🏛️ Architecture Overview

  React (Vite)                          FastAPI (Uvicorn)
  localhost:5173     <---------------->  127.0.0.1:8000
                     fetch / OAuth
                     JSON + JWT
                                                |
                                                | SQLAlchemy ORM
                                                v
                                        MySQL Database
                                        insider_threat_db
                                        -----------------
                                        users
                                        user_profiles
                                        alerts
                                        activity_logs

Auth flow: Email/password → bcrypt verify → JWT issued → stored client-side → attached to protected requests

OAuth flow: Google button → Authlib redirect/callback → user found-or-created → same JWT path → /oauth-success handoff

🧰 Tech Stack

Frontend: React, Vite, React Router

Backend: FastAPI, Uvicorn

Database: MySQL, SQLAlchemy, PyMySQL

Auth: JWT (python-jose), bcrypt (passlib), Google OAuth 2.0 (Authlib)

✅ Milestone 1 Summary

STATUS: COMPLETE (7/7 tasks)

All Milestone 1 deliverables have been implemented and verified, including environment setup, database schema, full authentication (email/password + Google OAuth + JWT), role-based dashboards for all 4 roles, employee profile management, and activity log ingestion.

🎯 Milestone 2 — Behavioral Analytics & Anomaly Detection (Week 3-4)

📋 Milestone 2 — Task Checklist

#

Task

Status

1

Develop behavioral baselines

✅ Done

2

Implement behavioral profiling engine

✅ Done

3

Create threat detection models

✅ Done

4

Build anomaly detection workflows

✅ Done

5

Generate anomaly reports

✅ Done

ALL MILESTONE 2 TASKS COMPLETED (5/5)

🏗️ What Was Built

1. Behavioral Baselines

Per-employee activity ratios computed from CERT dataset logs (logon, device, email, http) already loaded into activity_logs

Baseline features: unusual_login_ratio, usb_ratio, email_ratio, web_ratio, calculated per employee across their full log history

2. Behavioral Profiling Engine

GET /behavior/analyze/{employee_id}

Returns total logs, unusual login count, USB activity, email count, and web access count for a single employee

Verified against real CERT employee IDs (e.g. NGF0157) with correct counts returned

3. Threat Detection Model

Isolation Forest (scikit-learn) trained on four behavioral features per employee

Model cached in memory after first training to avoid retraining on every request

Anomaly scores normalized to a 0-100 scale, with is_anomaly flag derived from the model's raw prediction

4. Anomaly Detection Workflow

GET /behavior/anomalies

Aggregates activity counts per employee inside MySQL (GROUP BY + CASE WHEN) instead of looping over raw rows in Python

Runs Isolation Forest to generate anomaly scores

Calculates weighted risk score and severity (Low / Medium / High / Critical) via alert_system.py

Returns results sorted by risk score, descending

GET /behavior/risk_summary

Returns employee counts per severity category

5. Anomaly Reports

GET /behavior/anomaly_report

Returns total employees analyzed, total flagged, severity breakdown, and top 5 highest-risk employees in one summary response

🐛 Useful Problems Solved

Real bugs with a non-obvious cause and a lasting fix.

#

Problem

Cause

Fix

1

Model save crashing after folder deletion (FileNotFoundError on isolation_forest.pkl)

app/models/ directory had been deleted; joblib.dump() can't write into a missing folder

Recreated backend/app/models/ — model regenerates fresh on training

2

/behavior/anomalies taking 30+ minutes on full dataset

Original code pulled every raw ActivityLog row into Python and looped per employee — an N+1-style bottleneck at scale

Replaced the Python loop with a single SQL query using GROUP BY employee + CASE WHEN, letting MySQL aggregate directly

3

Query still slow even after SQL-side aggregation

No index existed on the employee column, forcing a full table scan

CREATE INDEX idx_activity_logs_employee ON activity_logs(employee);

4

TypeError: unsupported operand type(s) for +: 'float' and 'decimal.Decimal'

MySQL's SUM() returns decimal.Decimal, which Python won't silently mix with float

Wrapped every SQL aggregate result in float() before division

5

Stuck queries surviving server restart (still "executing" in SHOW PROCESSLIST after Ctrl+C)

Refreshing the browser tab doesn't cancel an in-flight backend request; old query kept running server-side

Used SHOW PROCESSLIST + KILL QUERY <id> in MySQL Workbench, then fully closed and restarted the uvicorn terminal

🏛️ Architecture Overview

  React (Vite)                          FastAPI (Uvicorn)
  localhost:5173     <---------------->  127.0.0.1:8000
                     fetch / OAuth
                     JSON + JWT
                                                |
                                                | SQLAlchemy ORM
                                                v
                                        MySQL Database
                                        insider_threat_db
                                        -----------------
                                        users
                                        user_profiles
                                        alerts
                                        activity_logs

Behavior flow: activity_logs → SQL GROUP BY aggregation → pandas dataframe → Isolation Forest → risk score + severity → sorted JSON response

🧰 Tech Stack

Frontend: React, Vite, React Router

Backend: FastAPI, Uvicorn

Database: MySQL, SQLAlchemy, PyMySQL

AI/ML: scikit-learn (Isolation Forest), pandas

Auth: JWT (python-jose), bcrypt (passlib), Google OAuth 2.0 (Authlib)

⚠️ Known Limitation (Not Blocking)

Running /behavior/anomalies across the full ~1000 employees is slow on the current development machine, likely disk I/O bound. Verified to work correctly and quickly on smaller batches (e.g. .limit(50)). For production, this should move to a scheduled/background job instead of live on-request computation — planned for Milestone 4 (performance & deployment).

✅ Milestone 2 Summary

STATUS: COMPLETE (5/5 tasks)

All Milestone 2 deliverables have been implemented and verified, including behavioral baselines, the profiling engine, a trained Isolation Forest anomaly model, the full anomaly detection workflow with risk scoring and severity, and a summary anomaly report endpoint.

NEXT MILLESTONE 3 STARTED
 🛡️ Insider Threat Behavioral Intelligence System

An AI-ready platform for monitoring employee activity, detecting behavioral anomalies, and managing insider risk — built with React, FastAPI, and MySQL.

🎯 Milestone 3 — Risk Scoring & Threat Investigation (Week 5-6)

📋 Milestone 3 — Task Checklist

| # | Task | Status |
|---|------|--------|
| 1 | Implement insider risk scoring engine | ✅ Done |
| 2 | Build UEBA intelligence workflows | ✅ Done |
| 3 | Develop threat investigation modules | ✅ Done |
| 4 | Generate risk analytics | ✅ Done |
| 5 | Create security dashboards | ✅ Done |

*ALL MILESTONE 3 TASKS COMPLETED (5/5)*

 🏗️ What Was Built

 1. Insider Risk Scoring Engine
- risk_score.py — weighted scoring model combining behavioral anomaly score, USB activity, email activity, unusual login timing, and web access ratios into a single 0–100 risk score
- categorize() maps scores into Low / Medium / High / Critical bands
- get_risk_distribution() aggregates category counts for dashboard/report consumption
- Weighted model rebalanced to include file access ratio once file.csv was ingested, keeping total weight at 100%

 2. UEBA Intelligence Engine
- GET /ueba/summary — org-wide totals: average risk score, high-risk/critical counts, total activity logs
- GET /ueba/risk-distribution — Low/Medium/High/Critical counts
- GET /ueba/high-risk-users — sorted list of employees at or above the high-risk threshold
- GET /ueba/recent-anomalies — most recent 20 risk-score-history entries
- GET /ueba/peer-comparison/{employee_id} — compares an employee's risk score against their department's average
- GET /ueba/trend/{employee_id} — historical risk score trend with direction (Increasing / Decreasing / Stable)

 3. Threat Investigation Module
- POST /investigations/generate-for-high-risk — auto-creates incidents for employees at/above the risk threshold who don't already have an open one
- GET /investigations/ — full incident list
- GET /investigations/{id}/timeline — pulls up to 200 recent activity log events for the incident's employee, building an investigation timeline
- PUT /investigations/{id}/status — status transitions, now validated against a fixed set (Open, Investigating, Resolved, Closed) instead of accepting arbitrary free text
- PUT /investigations/{id}/assign — analyst assignment (endpoint existed on the backend from the start; wired into the frontend during this milestone)

 4. Alert & Incident Management
- alert_system.py — generates alerts with severity derived from risk score, using the spec's 5-tier scale (Informational/Low/Medium/High/Critical), distinct from the 4-tier risk category scale
- POST /alerts/generate — auto-generates alerts for at-risk employees without duplicating existing open alerts
- PUT /alerts/{id}/assign, /escalate, /resolve — full alert lifecycle
- POST /alerts/{id}/create-incident — links an alert to a new or existing open incident for the same employee
- *Email notification system* — High/Critical alerts trigger an email to all active users with an analyst-level role, including a plain-language breakdown of which specific behaviors (USB activity, file access volume, unusual login times, etc.) drove the score up, not just the number

 5. Security Dashboards (role-specific)
- GET /dashboard/analyst-summary, /soc-summary, /manager-summary, /admin-summary — four distinct views tailored to each role, covering risk distribution, investigation queues, department risk breakdowns, and platform-wide analytics respectively

 🐛 Useful Problems Solved

Real bugs with a non-obvious cause and a lasting fix.

 Problem  Cause  Fix 

  1.Route-based access control existed in name only.

  Every "protected" endpoint checked get_current_user (is logged in) but never checked .role — any authenticated user could assign analysts, escalate alerts, or update incident status regardless of privilege level.

  Added a require_role(*roles) dependency and applied it per-endpoint to match the actual intended permission level for each action.

  2.Incident status could be set to any arbitrary string 
  Update_incident_status accepted raw free-text with no validation. 
  Added a fixed VALID_STATUSES tuple and reject anything outside it with a 400.

  3.Analyst assignment endpoint existed but was invisible.
  Backend route was built but never called from any frontend page.
  Added the missing "Assign" UI action wired to the existing endpoint.

  4.Alert emails sent to Gmail failing with 535 authentication failed.
  SMTP host had a typo (smtp.gamil.com instead of smtp.gmail.com) in .env, plus mismatched env var casing (From_EMAIL vs FROM_EMAIL) silently falling back instead of erroring.
  Corrected the hostname and casing; verified with an isolated single-recipient test script before relying on the full alert flow.

  5.Alert emails to real recipients started timing out during repeated testing.
  Rapid, repeated calls to /behavior/anomalies sent many SMTP connections back-to-back, tripping Gmail's rate limiting.
  Added a 1.5s delay between recipient sends and moved email delivery to FastAPI BackgroundTasks, so the API responds immediately and doesn't block on SMTP round-trips.

  6. /behavior/anomalies response time directly tied to email delivery speed 
  Alert emails were sent synchronously inside the request/response cycle.
  Same background-task fix as above — email sending now happens after the HTTP response is already sent.

 🏛️ Architecture Overview


  React (Vite)                          FastAPI (Uvicorn)
  localhost:5173     <---------------->  127.0.0.1:8000
                     fetch / OAuth
                     JSON + JWT
                                                |
                                                | SQLAlchemy ORM
                                                v
                                        MySQL Database
                                        insider_threat_db
                                        -----------------
                                        users, user_profiles
                                        activity_logs
                                        alerts, incidents
                                        risk_score_history
                                        notifications


*Risk flow:* activity_logs → anomaly score (Isolation Forest) → weighted risk score → severity → alert created → background email dispatched to analyst roles → optional incident created from alert

 🧰 Tech Stack

- *Frontend:* React, Vite, React Router, Recharts
- *Backend:* FastAPI, Uvicorn, BackgroundTasks
- *Database:* MySQL, SQLAlchemy, PyMySQL
- *AI/ML:* scikit-learn (Isolation Forest), pandas
- *Notifications:* smtplib (Gmail SMTP, App Password auth)
- *Auth:* JWT (python-jose), bcrypt (passlib), Google OAuth 2.0 (Authlib)

⚠️ Known Limitation (Not Blocking)

Email alerts are sent one-by-one with a fixed delay to stay under SMTP rate limits. This scales fine for the current test data volume (a handful of analyst accounts) but would need a proper mail queue (e.g., a task queue with retry/backoff) for a production deployment with a larger analyst roster — planned consideration for Milestone 4 (performance & deployment).

✅ Milestone 3 Summary

*STATUS: COMPLETE (5/5 tasks)*

All Milestone 3 deliverables have been implemented and verified, including the weighted insider risk scoring engine, the full UEBA analytics suite (summary, distribution, peer comparison, trend), the threat investigation workflow with validated status transitions and analyst assignment, the complete alert lifecycle with role-based email notifications, and four role-specific security dashboards.

NEXT: Milestone 4 — Dashboards, Reports, Notification & Escalation, Deployment