from fastapi import FastAPI

from app.routes import auth
from app.routes import employees
from app.database import engine
from app import models

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Insider Threat Behavioral Intelligence System API",
    description="Backend API for Insider Threat Detection and Risk Analysis",
    version="1.0.0"
)
app.include_router(employees.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to AI Insider Threat Behavioral Intelligence System"
    }


@app.get("/health")
def health_check():
    return {
        "status": "Server is Running",
        "success": True
    }