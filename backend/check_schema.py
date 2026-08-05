import pandas as pd
from app.database import engine
df = pd.read_sql("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='anomaly_reports'", engine)
print(df.to_string())
