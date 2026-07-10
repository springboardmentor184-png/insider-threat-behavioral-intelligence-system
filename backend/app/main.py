from fastapi import FastAPI
from app.api.auth import router as auth_router

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
def home():
    return {"message": "Insider Threat Behavioral Intelligence System Backend is Running 🚀"}