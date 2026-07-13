from fastapi import FastAPI

app = FastAPI(
    title="AI Insider Threat Behavioral Intelligence System API",
    description="Backend API for Insider Threat Detection and Risk Analysis",
    version="1.0.0"
)


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