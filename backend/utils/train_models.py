import asyncio
import sys
from backend.core.database import AsyncSessionLocal, engine
from backend.services.behavioral_profiler import BehavioralProfilerService
from backend.services.anomaly_detector import AnomalyDetectorService
from backend.services.report_generator import ReportGeneratorService

async def train_and_scan():
    """
    Train the behavioral profiling models (compute employee baselines)
    and execute the anomaly detection rules against the event logs.
    """
    print("=" * 60)
    print("ITBIS MODEL TRAINING & DETECTION ENGINE")
    print("=" * 60)
    
    async with AsyncSessionLocal() as db:
        print("[1/3] Training Behavioral Profiler...")
        print("      - Aggregating historical logs for logon, devices, files, emails, and web traffic.")
        print("      - Calculating daily means, standard deviations, and activity ratios...")
        
        baselines_computed = await BehavioralProfilerService.compute_all_baselines(db)
        print(f"[*] Completed. Trained baselines for {baselines_computed} employees.")
        
        print("\n[2/3] Executing Anomaly Detection Models...")
        print("      - Running statistical outlier rules (Z-score > 3)...")
        print("      - Applying relative frequency logon hour probability models...")
        print("      - Checking security pattern signatures and whitelists...")
        
        anomalies_detected = await AnomalyDetectorService.analyze_all_employees(db)
        print(f"[*] Completed. Detected and logged {anomalies_detected} behavioral anomalies.")
        
        print("\n[3/3] Generating Executive Threat Report...")
        report = await ReportGeneratorService.generate_report(db)
        print(f"[*] Completed. Saved Report #{report.id}: '{report.title}'")
        
        print("=" * 60)
        print("Training successfully completed. All models are up to date.")
        print("=" * 60)
    
    # Dispose connection pools explicitly to prevent RuntimeErrors during loop closure
    await engine.dispose()

if __name__ == "__main__":
    # Ensure correct event loop policy on Windows
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(train_and_scan())
