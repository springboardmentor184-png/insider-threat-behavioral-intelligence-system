import pandas as pd

# Use the FULL path to your CSV file
csv_path = r'D:\ai-insider-threat-system\data\raw\insider\insider.csv'

# Read the data
df = pd.read_csv(csv_path)

print("✅ Dataset loaded!")
print(f"📊 Shape: {df.shape} (rows, columns)")
print("\n📋 First 5 rows:")
print(df.head())
print("\n📊 Data types:")
print(df.dtypes)
print("\n✅ Target distribution ('is_malicious'):")
print(df['is_malicious'].value_counts())
print("\n📊 Missing values:")
print(df.isnull().sum())