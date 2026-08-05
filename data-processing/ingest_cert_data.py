import os
import pandas as pd
from sqlalchemy import create_engine

DB_USER = "postgres"
DB_PASS = "sql%40123456"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "itbis_db"

engine = create_engine(f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

RAW = "data/raw"
CHUNK = 50000

def load_simple(filename, table, drop_cols=None):
    path = os.path.join(RAW, filename)
    df = pd.read_csv(path)
    if drop_cols:
        df = df.drop(columns=drop_cols, errors="ignore")
    df.to_sql(table, engine, if_exists="replace", index=False)
    print(f"{table}: {len(df)} rows loaded")

def load_chunked(filename, table, drop_cols=None, sample_frac=None):
    path = os.path.join(RAW, filename)
    first = True
    total = 0
    for chunk in pd.read_csv(path, chunksize=CHUNK):
        if drop_cols:
            chunk = chunk.drop(columns=drop_cols, errors="ignore")
        if sample_frac:
            chunk = chunk.sample(frac=sample_frac)
        chunk.to_sql(table, engine, if_exists="replace" if first else "append", index=False)
        first = False
        total += len(chunk)
        print(f"{table}: {total} rows loaded so far", end="\r")
    print(f"\n{table}: {total} rows loaded (done)")

load_simple("employees.csv", "employees")
load_simple("labels.csv", "labels")
load_simple("logon.csv", "logon")
load_simple("device.csv", "device")
load_simple("file.csv", "file_access", drop_cols=["content"])
load_simple("email.csv", "email", drop_cols=["content"])
load_chunked("http.csv", "http", drop_cols=["content"], sample_frac=0.2)  # keep 20%