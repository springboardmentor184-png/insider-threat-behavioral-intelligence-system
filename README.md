# Aegis — Insider Threat Behavioral Intelligence System

Aegis is a local, role-based security analytics application for exploring employee activity patterns in the CERT Insider Threat Dataset. It ingests logon and removable-device events, derives behavioral baselines, identifies unusual activity, and presents anomalies, alerts, and management reporting in a web console.

The application is a demonstration and investigation aid: an anomaly is a signal for analyst review, not evidence of wrongdoing.

## What it provides

- JWT-authenticated console with Security Analyst, SOC Engineer, Security Manager, and Administrator views.
- CERT logon and device-log ingestion into `activity_logs`.
- Per-employee behavioral baselines and explainable z-score anomaly alerts.
- An Isolation Forest training pipeline that ranks unusual employee profiles from engineered behavior features.
- Dashboard trend, severity, top-risk, activity, alert, and report views.
- Percentile-based Low, Medium, High, and Critical risk categories with color-coded profile badges.
- Administrator-only console-user management, including role changes enforced by the API.
- Administrator-only employee directory with department filtering and searchable profile context.
- In-app notification bell with persisted read state for live high/critical alerts and investigation events.
- Summary or detailed PDF export. The detailed report includes the full alert list, risk-factor breakdown for every employee, and investigation-status counts.
- Local-demo, token-based password reset (the one-time reset link is displayed in the browser; no email is sent).
- Persistent light/dark theme and role-aware actions.

## Threat investigations

Select **Investigate** from an alert or a flagged user in Reports to open that employee's investigation view. It shows real chronological logon and removable-device events, the current persisted risk score (and only real prior scores when they exist), plus a rule-based correlation summary for after-hours logons and device activity. The view also shows department, designation, and manager context. Analysts can persist the incident state as **Open**, **In Progress**, or **Resolved**. The correlation is an analyst aid, not a new ML model or a finding of intent.

## Employee profile data (synthetic/demo only)

CERT's supplied logon and device files contain activity identifiers, not HR records. When the API starts (or `python employee_profile_seed.py` is run from `backend/`), Aegis creates deterministic **synthetic/demo** profiles for every employee ID in `activity_logs`. Department, designation, manager, managed-device information, and access privileges are invented solely to provide investigation context; they are not CERT data and must not be interpreted as real personnel, asset, or entitlement records. The administrator-only **Employees** page makes this distinction visible and supports search and department filtering.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (Pages Router), React, Tailwind CSS, Recharts, Lucide |
| API | FastAPI, SQLAlchemy, Pydantic |
| Data/modeling | pandas, scikit-learn, joblib, imbalanced-learn |
| Authentication | JWT (`python-jose`), Passlib/bcrypt |
| Database | PostgreSQL (`insider_threat_db`) |

## Run locally

Prerequisites: Python 3.10+ and Node.js 18+.

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

uvicorn main:app --reload
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The API is served at `http://localhost:8000`, with interactive API documentation at `http://localhost:8000/docs`.

Create `backend/.env` locally with the PostgreSQL connection URL before starting the API; the
file is intentionally ignored by Git and must not be committed. Ensure the local PostgreSQL
service is running before starting the API. The application creates its required tables on startup.

### Local password reset demo

Use **Forgot password?** on the sign-in page and enter a registered account email. A cryptographically secure, one-time token is stored only as a hash and expires after 30 minutes. When SMTP is configured, Aegis sends a reset email containing the link. If SMTP configuration or delivery fails, the request stays available and displays the one-time link as a clearly labeled local fallback.

Configure `backend/.env` (see `backend/.env.example`) before starting the API:

```text
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_ADDRESS=
FRONTEND_URL=http://localhost:3000
```

`FRONTEND_URL` is optional for local development but should be the public console URL in a deployed environment. Do not commit SMTP credentials or application passwords.

## Dataset setup and analytics pipeline

The supplied CERT r4.2 subset is expected at:

```text
backend/data/cert_data/r4.2/logon.csv
backend/data/cert_data/r4.2/device.csv
```

The project intentionally uses logon and device activity only. It does not require the much larger HTTP data file.

After the API has created the tables, run the pipeline from `backend/`:

```powershell
python ingest_logs.py
python baseline_engine.py
python anomaly_detection.py
python -m ml.train_model
```

`ingest_logs.py` uses bulk inserts in 50,000-row chunks. For a smaller demo import, set `CERT_INGEST_LIMIT_PER_SOURCE` to a positive row count before running it. Leave it unset (or set it to `0`) to ingest the full supplied files.

CERT timestamps are historical. The activity and anomaly trend endpoints therefore select their trailing window from the latest event in the database, rather than from the current calendar date. This keeps the demo charts populated regardless of when it is run.

## How detection works

### Operational anomaly alerts

The baseline engine calculates each employee's typical logon time, activity rate, and device behavior. The operational detector compares each logon hour with that employee's baseline using a z-score:

```text
z = (observed logon hour - employee average logon hour) / employee standard deviation
```

Absolute z-scores of 2, 3, and 4 map to medium, high, and critical severity. A minimum standard-deviation floor avoids a false-positive flood for people whose past activity is nearly identical.

### Isolation Forest profile ranking

`backend/ml/train_model.py` builds one profile per employee from 27 behavior features, including logon/device volume, after-hours and weekend ratios, PC variety, activity-day counts, and session-duration statistics. A `RobustScaler` reduces the influence of extreme numeric values, then an unsupervised `IsolationForest` assigns an anomaly score. The 90th percentile is used as the default flagging threshold; the serialized model and reproducible evaluation are written to `backend/ml/`.

The current `training_report.json` evaluates 1,000 profiles. Of 13 configured CERT reference IDs, only 3 exist in the supplied logon/device subset; those three are the only evaluable positives. The report records precision, recall, F1, the threshold, and the exact evaluation population.

### Risk categories

The operational risk score remains numeric and explainable, but the console also assigns a category relative to the latest score distribution. Profiles at or below the lower half are **Low**; the next quarter is **Medium**; the next 15% is **High**; and the highest decile is **Critical**. Ranking is used to break equal rounded scores deterministically, so all four categories remain useful even when many raw scores are similar.

The Reports page and manager dashboard show these labels with distinct colors. Administrators can export the same current summary as a PDF without moving data to an external service.

## Access control

Security Analysts can use the dashboard, activity, alerts, and reports views. Administrators have those views plus console-user management. Listing users and changing a role are protected by administrator-only backend routes; hiding controls in the browser is not the authorization boundary.

### Why accuracy is not reported

Insider-threat data is highly imbalanced. A model that labels every employee as normal would score about 99.7% accuracy in this subset while detecting zero known insiders. That makes accuracy misleading for the job the system performs. Precision describes alert quality, recall describes coverage of the evaluable known-insider references, and F1 exposes the trade-off between them; those are the reported metrics instead.

## Known limitations

- The included CERT subset covers only logon and device events and only a small portion of the broader r4.2 scenarios; it is not a complete representation of enterprise activity.
- Reference-insider labels are incomplete for the supplied files, so offline metrics cover only the IDs present in the data. They do not establish production performance.
- The operational z-score detector uses logon-hour deviations; it cannot infer intent and should always be reviewed with contextual evidence.
- The Isolation Forest ranks aggregate employee profiles. It is not yet wired as the sole production alerting decision and does not provide causal explanations.
- PostgreSQL is used for the local application database. Production deployment still requires a unique secret key, secure transport, least-privilege database credentials, auditing, retention/privacy controls, backups, and managed operations.
- Alert triage, access governance, calibration, bias assessment, and human review remain essential before using outputs in personnel or security decisions.
- Docker/container packaging, cloud deployment, and managed production operations are deferred.
- File, email, web, and network telemetry monitoring are out of scope for this supplied CERT subset, which contains only logon and device records.
- OAuth2/third-party identity-provider login, email delivery for password resets, escalation workflows, and combined PDF-plus-Excel report exports are deferred.
