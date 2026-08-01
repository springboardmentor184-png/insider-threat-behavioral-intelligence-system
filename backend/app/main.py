# from fastapi import FastAPI

# from app.core.database import engine, Base
# from app.models.user import User
# from app.models.otp import OTPCode
# from app.api import auth
# from app.api import users

# Base.metadata.create_all(bind=engine)

# app = FastAPI(title="Insider Threat Behavioral Intelligence System")


# @app.get("/")
# def home():
#     return {
#         "message": "Backend is running successfully!"
#     }


# app.include_router(
#     auth.router,
#     prefix="/auth",
#     tags=["Authentication"]
# )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import os

from app.core.database import engine, Base
from app.models.user import User
from app.models.otp import OTPCode
from app.api import auth
from app.api import users

from app.models.audit_log import AuditLog
from app.models.employee import Employee
from app.models.alert import Alert
from app.models.incident import Incident

from app.api import employees
from app.api import dashboard
from app.api import audit_logs
from app.api import project_status
from app.models.activity import Activity
from app.api import activity
from app.api import alerts
from app.api import incidents
from app.api import ml_trigger
from app.api import reports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Insider Threat Behavioral Intelligence System")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_class=HTMLResponse)
def home():
    template_path = os.path.join(os.path.dirname(__file__), "templates", "index.html")
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Error loading interface</h1><p>{str(e)}</p>", status_code=500)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(employees.router)
app.include_router(dashboard.router)
app.include_router(audit_logs.router)
app.include_router(project_status.router)
app.include_router(activity.router)
app.include_router(alerts.router)
app.include_router(incidents.router)
app.include_router(ml_trigger.router)
app.include_router(reports.router)