from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
from .database import Base, engine

from .routers import auth
from .routers import dashboard
from .routers import profile
from .routers import alerts
from .routers import users
from .routers import reports

from .routers import oauth2

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Insider Threat Behavioral Intelligence System",
    version="1.0.0"
)
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(oauth2.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(profile.router)
app.include_router(alerts.router)
app.include_router(users.router)
app.include_router(reports.router)


@app.get("/")
def home():
    return {
        "message": "Insider Threat Behavioral Intelligence System API Running"
    }