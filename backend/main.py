"""
FastAPI application entry point for the Insider Threat Behavioral Intelligence System.
"""

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import auth, users, activity_logs, pages, dashboard, risk, ueba, investigations, notifications, reports_export

app = FastAPI(
    title="ITBIS — Insider Threat Behavioral Intelligence System",
    description="AI-powered insider threat detection and behavioral analytics platform.",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(activity_logs.router)
app.include_router(dashboard.router)
app.include_router(risk.router)
app.include_router(ueba.router)
app.include_router(investigations.router)
app.include_router(notifications.router)
app.include_router(reports_export.router)
app.include_router(pages.router)


@app.get("/")
async def root():
    """Redirect root to login page."""
    return RedirectResponse(url="/login")
