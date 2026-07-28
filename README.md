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