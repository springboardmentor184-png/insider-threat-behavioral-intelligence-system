"""
Page routes: serve Jinja2 HTML templates.
"""

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

router = APIRouter(tags=["Pages"])
templates = Jinja2Templates(directory="frontend/templates")


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Serve the login page."""
    return templates.TemplateResponse("login.html", {"request": request})


@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """Serve the registration page."""
    return templates.TemplateResponse("register.html", {"request": request})


@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard_page(request: Request):
    """Serve the dashboard page."""
    return templates.TemplateResponse("dashboard.html", {"request": request})


@router.get("/profile", response_class=HTMLResponse)
async def profile_page(request: Request):
    """Serve the profile page."""
    return templates.TemplateResponse("profile.html", {"request": request})


@router.get("/admin/users", response_class=HTMLResponse)
async def admin_users_page(request: Request):
    """Serve the admin user management page."""
    return templates.TemplateResponse("admin/users.html", {"request": request})


@router.get("/logs", response_class=HTMLResponse)
async def logs_page(request: Request):
    """Serve the dedicated activity logs page."""
    return templates.TemplateResponse("logs.html", {"request": request})


@router.get("/verify-2fa", response_class=HTMLResponse)
async def verify_2fa_page(request: Request):
    """Serve the 2FA verification page."""
    return templates.TemplateResponse("verify-2fa.html", {"request": request})


@router.get("/investigation", response_class=HTMLResponse)
async def investigation_page(request: Request):
    """Serve the threat investigation portal."""
    return templates.TemplateResponse("investigation.html", {"request": request})


@router.get("/ueba", response_class=HTMLResponse)
async def ueba_page(request: Request):
    """Serve the UEBA intelligence portal."""
    return templates.TemplateResponse("ueba.html", {"request": request})


@router.get("/reports", response_class=HTMLResponse)
async def reports_page(request: Request):
    """Serve the Reports & Export Hub."""
    return templates.TemplateResponse("reports.html", {"request": request})
