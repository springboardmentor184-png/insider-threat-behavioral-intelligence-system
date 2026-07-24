import os
import pandas as pd

PROCESSED_DIR = "e:\\Insider-Threat-Behavioral-Intelligence-System\\ml-engine\\data"

def engineer_features():
    input_path = os.path.join(PROCESSED_DIR, "behavioral_aggregates.csv")
    if not os.path.exists(input_path):
        print(f"Aggregates file not found at {input_path}. Please run preprocessing first.")
        return False
        
    df = pd.read_csv(input_path)
    print("Engineering features for machine learning...")

    # Initialize dataframe for machine learning features
    ml_df = pd.DataFrame()
    ml_df['employee_code'] = df['employee_code']
    
    # 1. Late login deviation (hours past 9 AM)
    ml_df['late_login'] = (df['avg_login_time'] - 9.0).clip(lower=0.0)
    
    # 2. Weekend login count
    ml_df['weekend_login'] = df['weekend_logins'].astype(float)
    
    # 3. Multiple devices used
    ml_df['multiple_devices'] = df['unique_devices'].astype(float)
    
    # 4. USB connections
    ml_df['usb_usage'] = df['usb_usage'].astype(float)
    
    # 5. Mass file access (log scale or raw counts)
    ml_df['mass_file_access'] = df['files_accessed'].astype(float)
    
    # 6. Large file transfer count
    ml_df['large_file_transfer'] = df['large_file_transfers'].astype(float)
    
    # 7. Ratio of external emails
    ml_df['external_email_ratio'] = df['external_emails'] / df['total_emails'].replace(0, 1)
    
    # 8. Web browsing of job search domains
    ml_df['job_search_websites'] = df['job_search'].astype(float)
    
    # 9. Failed logins count
    ml_df['failed_logins'] = df['failed_logins'].astype(float)
    
    # 10. Login frequency
    ml_df['login_frequency'] = df['login_frequency'].astype(float)
    
    # 11. Average session duration in hours
    ml_df['average_session_duration'] = df['avg_session_duration'].astype(float)
    
    # 12. Activity after normal office hours
    ml_df['activity_after_hours'] = df['after_hours_activity'].astype(float)

    output_path = os.path.join(PROCESSED_DIR, "ml_features.csv")
    ml_df.to_csv(output_path, index=False)
    print(f"Feature engineering complete. Saved ML-ready dataset to {output_path}")
    return True

if __name__ == "__main__":
    engineer_features()
