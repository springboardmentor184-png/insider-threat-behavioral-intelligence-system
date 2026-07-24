import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_FILE = os.path.join(BASE_DIR, "logon.csv")

OUTPUT_DIR = os.path.join(BASE_DIR, "processed")

OUTPUT_FILE = os.path.join(
    OUTPUT_DIR,
    "logon_cleaned_1000.csv"
)

SAMPLE_SIZE = 1000

os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Loading dataset...")

df = pd.read_csv(INPUT_FILE)

print(f"Original rows: {len(df)}")
print(f"Original columns: {list(df.columns)}")

before_duplicates = len(df)

df = df.drop_duplicates()

print(
    f"Removed duplicate rows: "
    f"{before_duplicates - len(df)}"
)

before_nulls = len(df)

df = df.dropna()

print(
    f"Removed rows containing null values: "
    f"{before_nulls - len(df)}"
)

for column in df.select_dtypes(
    include=["object"]
).columns:

    df[column] = df[column].astype(str).str.strip()

before_zero_rows = len(df)

numeric_columns = df.select_dtypes(
    include=["int64", "float64"]
).columns

if len(numeric_columns) > 0:

    df = df[
        ~(df[numeric_columns] == 0).all(axis=1)
    ]

print(
    f"Removed completely zero-valued rows: "
    f"{before_zero_rows - len(df)}"
)

if len(df) > SAMPLE_SIZE:

    df = df.sample(
        n=SAMPLE_SIZE,
        random_state=42
    )

else:

    print(
        f"Dataset contains only {len(df)} valid records."
    )

df = df.reset_index(drop=True)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n================================")
print("DATA PREPROCESSING COMPLETED")
print("================================")

print(f"Final rows: {len(df)}")
print(f"Final columns: {len(df.columns)}")

print(f"\nSaved file:")
print(OUTPUT_FILE)

print("\nFinal dataset preview:")
print(df.head())

print("\nFinal dataset information:")

df.info()