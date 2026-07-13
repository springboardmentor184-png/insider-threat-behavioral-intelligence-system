# System Architecture & Database Schema

## 1. Architecture Overview

Frontend (Next.js / React)
|
| REST API calls (JSON, JWT in Authorization header)
v
Backend (FastAPI)
|
| SQLAlchemy ORM
v
PostgreSQL (structured data: users, employee profiles, risk scores)
MongoDB (planned - unstructured/raw activity logs, high volume)


- **Frontend**: Next.js (Pages Router) + Tailwind CSS. Handles login/register UI, dashboards (role-based views).
- **Backend**: FastAPI. Exposes REST APIs for auth, user management, activity ingestion, risk scoring.
- **Auth**: JWT-based. Token issued on login, contains `sub` (email) and `role`. Sent via `Authorization: Bearer <token>` header on protected routes.
- **RBAC**: Enforced via FastAPI dependencies (`get_current_user`, `require_role`) — decodes JWT, checks role against allowed roles per endpoint.

## 2. Database Schema (PostgreSQL)

### `users` table
| Column | Type | Notes |
|---|---|---|
| id | Integer, PK | Auto-increment |
| name | String | Full name |
| email | String, unique | Login identifier |
| password_hash | String | bcrypt hashed, never store plain text |
| role | String | employee / analyst / manager / admin |
| created_at | DateTime | Auto-set on creation |

### `employee_profiles` table (planned - Step 6)
| Column | Type | Notes |
|---|---|---|
| id | Integer, PK | |
| user_id | Integer, FK -> users.id | One-to-one with users |
| designation | String | Job title |
| department | String | |
| join_date | Date | |
| device_ids | String | Comma-separated or JSON list |

### `activity_logs` table (planned - Step 7)
| Column | Type | Notes |
|---|---|---|
| id | Integer, PK | |
| user_id | Integer, FK -> users.id | Which employee |
| event_type | String | logon, device_connect, file_access, email_sent, http_visit |
| timestamp | DateTime | When the event occurred (from dataset) |
| source_system | String | Which CSV/system it came from |
| metadata | JSON | Extra event-specific details |

### `risk_scores` table (future milestone)
| Column | Type | Notes |
|---|---|---|
| id | Integer, PK | |
| user_id | Integer, FK -> users.id | |
| score | Float | Computed risk score |
| level | String | Low / Medium / High / Critical |
| computed_at | DateTime | |

## 3. Why this design
- **Separation of concerns**: `users` (auth) is separate from `employee_profiles` (HR-style data) so login logic stays simple and fast.
- **`activity_logs` is append-only**: every event is a new row, never updated — preserves an audit trail (important for insider threat investigation).
- **Role-based access at the API layer**, not the database layer, keeps the DB simple while still enforcing privacy (employees can't query other employees' data).