from fastapi import APIRouter, HTTPException
import pandas as pd
import json
from app.database import engine

router = APIRouter(prefix="/api/anomalies", tags=["anomalies"])


def _parse_reasons(df):
    df["reasons"] = df["reasons"].apply(lambda x: json.loads(x) if isinstance(x, str) else x)
    return df


@router.get("")
def list_anomalies():
    df = pd.read_sql('SELECT * FROM anomaly_reports', engine)
    df = _parse_reasons(df)
    return df.to_dict(orient="records")


@router.get("/{user}")
def get_anomaly(user: str):
    df = pd.read_sql('SELECT * FROM anomaly_reports WHERE "user" = %(user)s', engine, params={"user": user})
    if df.empty:
        raise HTTPException(status_code=404, detail="User not found")
    df = _parse_reasons(df)
    return df.to_dict(orient="records")[0]