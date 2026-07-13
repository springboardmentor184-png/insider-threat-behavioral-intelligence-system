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

from app.core.database import engine, Base
from app.models.user import User
from app.models.otp import OTPCode
from app.api import auth
from app.api import users

from app.models.audit_log import AuditLog

from app.models.employee import Employee
from app.api import employees
from app.api import dashboard
from app.api import audit_logs

from app.api import project_status
from app.models.activity import Activity
from app.api import activity

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Insider Threat Behavioral Intelligence System")


@app.get("/")
def home():
    return {
        "message": "Backend is running successfully!"
    }

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(employees.router)
app.include_router(dashboard.router)
app.include_router(audit_logs.router)
app.include_router(project_status.router)
app.include_router(activity.router)