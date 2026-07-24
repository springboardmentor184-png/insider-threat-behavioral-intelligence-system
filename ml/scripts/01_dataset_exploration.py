import pandas as pd

df = pd.read_csv(r"C:\Users\Suhas\OneDrive\Desktop\Insider-Threat-Behavioral-Intelligence-System\ml\datasets\r1\logon.csv")


print(df["date"].head())