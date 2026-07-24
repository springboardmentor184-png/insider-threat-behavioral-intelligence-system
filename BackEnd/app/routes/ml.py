from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from app.services.ml_engine import (
    predict_risk,
    predict_anomaly
)

router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning"]
)


class PredictionRequest(BaseModel):
    features: List[float]


@router.post("/predict")
def predict(
    request: PredictionRequest
):
    return predict_risk(
        request.features
    )


@router.post("/anomaly")
def detect_anomaly(
    request: PredictionRequest
):
    return predict_anomaly(
        request.features
    )


@router.get("/status")
def ml_status():
    return {
        "status": "active",
        "model": "Isolation Forest",
        "purpose": "Insider threat anomaly detection"
    }