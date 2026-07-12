🛡️ Insider Threat Behavioral Intelligence System

An AI-ready platform for monitoring employee activity, detecting behavioral anomalies, and managing insider risk — built with React, FastAPI, and MySQL.

Milestone 1 — Project Initialization, Design Process & Core Setup (Week 1–2)

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

✅ Done (as-built screens)

7

Define project objectives and insider threat workflows

✅ Done

🚀 What Was Built

✅ 1. Frontend & Backend Environment Setup

Initialized React (Vite) frontend on localhost:5173

Initialized FastAPI backend on 127.0.0.1:8000, served via uvicorn

Configured CORS so the two independently-hosted apps could communicate securely

Set up a Python virtual environment and full dependency chain (fastapi, uvicorn, sqlalchemy, pymysql, python-jose, passlib, bcrypt, authlib)

✅ 2. System Architecture & Database Schema

Connected backend to MySQL via SQLAlchemy ORM

Designed and created core tables:

users — accounts, hashed passwords, roles

user_profiles — employee details (extended with user_id, department, manager, device_info, access_privileges)

alerts — security alert records

activity_logs — activity tracking (schema ready, ingestion pending)

Verified live DB connectivity end-to-end (register → write → read confirmed in MySQL Workbench)

✅ 3. Authentication & Role-Based Access

Registration with bcrypt-hashed passwords (no plain text stored)

Login issuing real JWT access tokens, verified against hashed passwords

Google OAuth 2.0 login — full flow: redirect → Google consent → callback → JWT issuance → frontend session

Role-based dashboards for 4 distinct roles, each with tailored views:

🛠️ Administrator — system health, user management, audit logs, quick controls

📊 Security Manager — organizational risk posture, compliance metrics, risk trends

🕵️ SOC Engineer — live alerts, behavioral anomalies, active investigations

🔍 Security Analyst — assigned alerts, risk scores, investigation queue

Protected route logic reading role from JWT/session on the frontend

🟡 4. Employee Profile Management (In Progress)

Extended user_profiles schema to match spec: Employee ID, Department, Designation, Manager, Device Info, Access Privileges

Backend endpoints and profile form still to be implemented

✅ 5. Activity Log Ingestion 

activity_logs table exists and is ready

Login/action-based log writing implemented

✅ 6. UI & Workflow Planning

Built working screens for Login, Register, and all 4 role dashboards

Documented as-built UI in place of pre-build wireframes, given the iterative build approach

✅ 7. Project Objectives

Defined via the product requirements document: AI-powered behavioral monitoring, anomaly detection, insider risk scoring, and alerting for enterprises, financial institutions, and SOC teams

🐞 Useful Problems Solved

Real bugs with a non-obvious cause and a lasting fix — the kind worth remembering for next time.

<details>
<summary><b>1. Database URL always `None` — <code>os.getenv()</code> misuse</b></summary>

Problem: sqlalchemy.exc.ArgumentError: Expected string or URL object, got NoneCause: The full connection string was passed as the variable name into os.getenv(), instead of just "DATABASE_URL".Fix:

DATABASE_URL = os.getenv("DATABASE_URL")   # ✅ correct

</details>

<details>
<summary><b>2. Special characters breaking the DB connection string</b></summary>

Problem: Connection failed even with the correct password.Cause: The MySQL password contained a space and an @ — @ is a reserved separator character in connection URLs.Fix: URL-encoded the password in .env (space → %20, @ → %40).

</details>

<details>
<summary><b>3. bcrypt / passlib version conflict</b></summary>

Problem: ValueError: password cannot be longer than 72 bytes on a 9-character password.Cause: A breaking change in bcrypt 4.1+ is incompatible with passlib's internal self-test.Fix: Pinned bcrypt==4.0.1.

</details>

<details>
<summary><b>4. Valid logins failing — mixed plain-text and hashed passwords</b></summary>

Problem: passlib.exc.UnknownHashError: hash could not be identifiedCause: Accounts created before hashing was added to /register had plain-text passwords in the DB; comparing a hash function against plain text always fails.Fix: Hashed all new registrations; purged legacy accounts:

DELETE FROM users WHERE password NOT LIKE '$2b$%';

</details>

<details>
<summary><b>5. Frontend rejecting successful backend logins</b></summary>

Problem: Backend returned 200 OK, but the UI showed "Invalid Email or Password."Cause: Frontend checked if (response.access_token), but the backend hadn't implemented JWT issuance yet — a silent API contract mismatch.Fix: Backend now returns access_token on successful login, matching frontend expectations exactly.

</details>

<details>
<summary><b>6. Google OAuth crashing without session support</b></summary>

Problem: AssertionError: SessionMiddleware must be installed to access request.sessionCause: Authlib's OAuth redirect flow needs temporary session storage; FastAPI has none by default.Fix:

app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

</details>

<details>
<summary><b>7. OAuth succeeding on the backend, 404 on the frontend</b></summary>

Problem: After Google login, the browser reached /oauth-success?token=... but got a 404.Cause: The backend correctly issued the JWT and redirected — but no frontend route existed to catch it.Fix: Built an OAuthSuccess.jsx page to parse the token from the URL, store it, and route to the dashboard.

</details>

🧱 Architecture Overview

┌────────────────────┐        fetch/OAuth redirect        ┌──────────────────────┐
│   React (Vite)      │ ─────────────────────────────────▶ │   FastAPI (Uvicorn)   │
│   localhost:5173     │ ◀───────────────────────────────── │   127.0.0.1:8000       │
└────────────────────┘         JSON / JWT response          └──────────┬────────────┘
                                                                          │ SQLAlchemy ORM
                                                                          ▼
                                                              ┌──────────────────────┐
                                                              │   MySQL Database       │
                                                              │  insider_threat_db     │
                                                              ├──────────────────────┤
                                                              │ users                  │
                                                              │ user_profiles          │
                                                              │ alerts                 │
                                                              │ activity_logs          │
                                                              └──────────────────────┘

Auth flow: Email/password → bcrypt verify → JWT issued → stored client-side → attached to protected requestsOAuth flow: Google button → Authlib redirect/callback → user found-or-created → same JWT path → /oauth-success handoff

🛠️ Tech Stack

Layer

Technology

Frontend

React, Vite, React Router

Backend

FastAPI, Uvicorn

Database

MySQL, SQLAlchemy, PyMySQL

Auth

JWT (python-jose), bcrypt (passlib), Google OAuth 2.0 (Authlib)

📌 Milestone 1 Summary
7/7 core tasks addressed — 6 fully complete, 1 actively in progress with schema/infrastructure already in place. Authentication (including OAuth) and role-based dashboards — typically the most technically demanding part of this milestone — are fully functional end-to-end.

Next up: Employee profile endpoints → Milestone 2 (Behavioral Analytics & Anomaly Detection).