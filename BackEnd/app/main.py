from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine

from app.routes import auth
from app.routes import dashboard
from app.routes import employee
from app.routes import activity
from app.routes import file_access
from app.routes import login_activity
from app.routes import anomaly
from app.routes import ml
from app.routes import alert
from app.routes import investigation
from app.routes import risk
from app.routes import report
from app.routes import profile

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Insider Threat Behavioral Intelligence System",
    description="AI-powered insider threat detection and behavioral intelligence platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(employee.router)
app.include_router(activity.router)
app.include_router(file_access.router)
app.include_router(login_activity.router)
app.include_router(anomaly.router)
app.include_router(ml.router)
app.include_router(alert.router)
app.include_router(investigation.router)
app.include_router(risk.router)
app.include_router(report.router)
app.include_router(profile.router)


@app.get("/")
def root():
    return {
        "message": "Insider Threat Behavioral Intelligence System API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "connected"
    }