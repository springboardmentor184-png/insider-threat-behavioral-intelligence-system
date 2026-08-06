from app.database import SessionLocal
from app.analytics.detector import run_behavioral_profiling_and_detection, seed_rich_anomalies_if_needed
from app.models.models import Anomaly

db = SessionLocal()

print("Current anomaly count:", db.query(Anomaly).count())

# Clear old anomalies if count is 3
if db.query(Anomaly).count() <= 3:
    print("Clearing old 3 anomalies...")
    db.query(Anomaly).delete()
    db.commit()

# Seed 15+ rich anomalies
res = seed_rich_anomalies_if_needed(db)
print("Seeded new anomalies:", res)

# Run profiling engine
prof_res = run_behavioral_profiling_and_detection(db)
print("Profiling completed:", prof_res)

total = db.query(Anomaly).count()
print("New total anomaly count in database:", total)

db.close()
