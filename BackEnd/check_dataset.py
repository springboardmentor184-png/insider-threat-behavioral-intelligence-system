import pandas as pd
import os

files = [
    "logon.csv",
    "file.csv",
    "email.csv",
    "device.csv",
    "http.csv",
    "psychometric.csv"
]

folder = "datasets"

for file in files:
    path = os.path.join(folder, file)

    print("\n==============================")
    print(file)
    print("==============================")

    df = pd.read_csv(path)

    print("Columns:")
    print(list(df.columns))

    print("\nFirst 3 rows:")
    print(df.head(3))