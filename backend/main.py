from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import auth_routes, user_routes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Insider Threat Behavioral Intelligence System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)


@app.get("/")
def root():
    return {"message": "Insider Threat Backend is running"}