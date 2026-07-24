# from fastapi import APIRouter
# import pandas as pd

# router = APIRouter(prefix="/ml", tags=["Machine Learning"])

# BASELINE_PATH = "ml/outputs/baseline.csv"

# @router.get("/baseline")
# def get_baseline():

#     df = pd.read_csv(BASELINE_PATH)

#     return df.to_dict(orient="records")

from fastapi import APIRouter
import pandas as pd
from pathlib import Path

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

# Project Root
BASE_DIR = Path(__file__).resolve().parents[3]

OUTPUT_DIR = BASE_DIR / "ml" / "outputs"

BASELINE_PATH = OUTPUT_DIR / "baseline.csv"
ANOMALY_PATH = OUTPUT_DIR / "anomaly_report.csv"
RISK_PATH = OUTPUT_DIR / "risk_scores.csv"


@router.get("/baseline")
def get_baseline():
    df = pd.read_csv(BASELINE_PATH)
    return df.to_dict(orient="records")


@router.get("/anomalies")
def get_anomalies():
    df = pd.read_csv(ANOMALY_PATH)
    return df.to_dict(orient="records")


@router.get("/risk")
def get_risk():
    df = pd.read_csv(RISK_PATH)
    return df.to_dict(orient="records")