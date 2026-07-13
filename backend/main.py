# backend/main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "AI Insider Threat System Backend Running!"}