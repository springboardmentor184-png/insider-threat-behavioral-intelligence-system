from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import import_data
from app.routes import alerts
from app.routes import auth
from app.routes import employees
from app.routes import activity
from app.database import engine
from app.routes import baseline
from app.routes import ai
from app import models
from app.routes import ueba
from app.routes import investigation
from app.routes import alert_management
from app.routes import notification
from app.routes import notifications
from app.routes import analytics

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Insider Threat Behavioral Intelligence System API",
    description="Backend API for Insider Threat Detection and Risk Analysis",
    version="1.0.0"
)

# -----------------------------
# CORS Configuration
# -----------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Include Routers
# -----------------------------
app.include_router(auth.router)
app.include_router(employees.router)
app.include_router(activity.router)
app.include_router(alerts.router)
app.include_router(import_data.router)
app.include_router(baseline.router)
app.include_router(ai.router)
app.include_router(ueba.router)
app.include_router(investigation.router)
app.include_router(alert_management.router)
app.include_router(notification.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
# -----------------------------
# Root Endpoint
# -----------------------------
@app.get("/")
def root():
    return {
        "message": "Welcome to AI Insider Threat Behavioral Intelligence System"
    }

# -----------------------------
# Health Check
# -----------------------------
@app.get("/health")
def health_check():
    return {
        "status": "Server is Running",
        "success": True
    }