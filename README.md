# Insider Threat Behavioral Intelligence System (ITBIS)

ITBIS is an enterprise-grade, AI-powered security platform designed to identify insider threat behaviors and organizational risk posture by analyzing employee activity logs. It continuously monitors logons, file accesses, USB device connections, email communications, and web traffic.

The platform is designed around the **CERT Insider Threat Dataset** and **LANL Cyber Security Dataset**, enabling security operations centers (SOCs) to visualize threat feeds and detect anomalies.

---

## Technical Architecture

- **Backend**: FastAPI (Python)
- **Database**: MySQL 8.0 (SQLAlchemy Async ORM, pool-recycle management)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript, Tailwind CSS (via CDN)
- **Authentication**: Access & Refresh Token cookies + Real Google OAuth 2.0 + Google Authenticator TOTP Multi-Factor Authentication
- **Testing**: Pytest + HTTPX AsyncClient with isolated in-memory SQLite

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- MySQL 8.0+ (running locally on port `3306` with database named `itbis`)

### 2. Installation & Setup

1. **Clone the repository** and navigate into it:
   ```bash
   cd insider-threat-behavioral-intelligence-system
   ```

2. **Create a virtual environment** and activate it:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the root directory (based on `.env.example`):
   ```ini
   DATABASE_URL=mysql+aiomysql://root:password@127.0.0.1:3306/itbis
   SECRET_KEY=itbis-dev-secret-key-change-in-production-2026
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=15

   # Google OAuth 2.0 Credentials (Set real credentials to enable real Google Sign-In)
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/oauth2/google/callback
   ```

---

## Real Google OAuth 2.0 Configuration
To enable the actual, live Google Sign-In:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and search for **APIs & Services > Credentials**.
3. Configure the **OAuth Consent Screen** (choose External, enter application information).
4. Click **Create Credentials > OAuth Client ID** and choose **Web Application**.
5. Under **Authorized redirect URIs**, enter exactly:
   - `http://localhost:8000/api/auth/oauth2/google/callback`
6. Click Save, then copy the **Client ID** and **Client Secret** into your `.env` file.
7. Restart the FastAPI server.

*Note: If no client credentials are set in `.env`, the platform automatically uses a secure OAuth simulator that maps to a mock user `google.demo@itbis.com` for local developer testing.*

---

## Database Initialization & Ingestion (CERT Dataset)

First, create the database in MySQL:
```sql
CREATE DATABASE itbis;
```

To run the application with real-world statistics, run the importer script to seed the database with **14,221** live records from the CERT Insider Threat Dataset:
```bash
python -m backend.utils.import_dataset
```

Next, seed the default role accounts:
```bash
python -m backend.utils.seed_data
```

### Seed Analyst Access Credentials

| Platform Role | Email Address | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@itbis.com` | `admin123` |
| **Security Analyst** | `analyst@itbis.com` | `analyst123` |
| **SOC Engineer** | `soc@itbis.com` | `soc123` |
| **Security Manager** | `manager@itbis.com` | `manager123` |

---

## Multi-Factor Authentication (Google Authenticator)
1. Log in to the application and click your profile initials in the bottom left corner.
2. Under **Google Authenticator (MFA)**, click **Enable 2FA**.
3. Scan the generated QR code using the Google Authenticator app on your mobile device.
4. Verify by entering the 6-digit token to activate.
5. On your next login attempt, you will be prompted for your Google Authenticator verification code before entering the dashboard!

---

## Running the Application

1. **Start the local FastAPI server**:
   ```bash
   .\venv\Scripts\uvicorn.exe backend.main:app --reload --port 8000
   ```

2. **Access the application**:
   Open [http://localhost:8000/login](http://localhost:8000/login) in your browser.

---

## Automated Testing

Run the full testing suite using `pytest`:

```bash
$env:PYTHONPATH="."; .\venv\Scripts\python.exe -m pytest tests/ -v
```

This runs 13 automated tests covering:
- Bcrypt password hashing & validations
- JWT rotation and secure cookie clearing
- Simulated Google OAuth redirects
- Google Authenticator TOTP Setup / verification flows
- Admin user creation and role restriction filters
