import os
import pandas as pd
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.models.models import Employee, LoginActivity, FileAccess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "datasets")

LOGON_PATH = os.path.join(DATASET_DIR, "logon.csv")
FILE_PATH = os.path.join(DATASET_DIR, "file.csv")

BATCH_SIZE = 10000


def import_cert_data():
    db: Session = SessionLocal()

    try:
        if not os.path.exists(LOGON_PATH):
            raise FileNotFoundError(f"Missing dataset file: {LOGON_PATH}")

        if not os.path.exists(FILE_PATH):
            raise FileNotFoundError(f"Missing dataset file: {FILE_PATH}")

        logon_df = pd.read_csv(LOGON_PATH)
        file_df = pd.read_csv(FILE_PATH)

        logon_df.columns = [
            str(column).strip().lower()
            for column in logon_df.columns
        ]

        file_df.columns = [
            str(column).strip().lower()
            for column in file_df.columns
        ]

        required_logon_columns = {
            "id",
            "date",
            "user",
            "pc",
            "activity"
        }

        required_file_columns = {
            "id",
            "date",
            "user",
            "pc",
            "filename"
        }

        missing_logon = (
            required_logon_columns
            - set(logon_df.columns)
        )

        missing_file = (
            required_file_columns
            - set(file_df.columns)
        )

        if missing_logon:
            raise ValueError(
                f"Missing logon columns: {missing_logon}"
            )

        if missing_file:
            raise ValueError(
                f"Missing file columns: {missing_file}"
            )

        logon_df["date"] = pd.to_datetime(
            logon_df["date"],
            errors="coerce"
        )

        file_df["date"] = pd.to_datetime(
            file_df["date"],
            errors="coerce"
        )

        logon_df = logon_df.dropna(
            subset=["date", "user"]
        )

        file_df = file_df.dropna(
            subset=["date", "user"]
        )

        logon_df["user"] = (
            logon_df["user"]
            .astype(str)
            .str.strip()
        )

        file_df["user"] = (
            file_df["user"]
            .astype(str)
            .str.strip()
        )

        users = sorted(
            set(logon_df["user"].unique())
            .union(set(file_df["user"].unique()))
        )

        existing_employees = {
            employee.user: employee
            for employee in db.query(Employee).all()
        }

        employee_map = {}

        for username in users:

            employee = existing_employees.get(username)

            if employee is None:

                employee = Employee(
                    user=username,
                    name=username,
                    is_active=True
                )

                db.add(employee)
                db.flush()

            employee_map[username] = employee

        db.commit()

        employee_stats = {}

        for username in users:

            employee_stats[username] = {
                "login_count": 0,
                "unique_devices": set(),
                "after_hours_logins": 0,
                "weekend_logins": 0,
                "file_access_count": 0
            }

        login_records = []

        for row in logon_df.itertuples(index=False):

            username = str(row.user).strip()

            employee = employee_map.get(username)

            if not employee:
                continue

            event_time = row.date

            activity = (
                str(row.activity).strip()
                if pd.notna(row.activity)
                else "Logon"
            )

            pc = (
                str(row.pc).strip()
                if pd.notna(row.pc)
                else None
            )

            employee_stats[username]["login_count"] += 1

            if pc:
                employee_stats[
                    username
                ]["unique_devices"].add(pc)

            if event_time.hour < 7 or event_time.hour >= 19:

                employee_stats[
                    username
                ]["after_hours_logins"] += 1

            if event_time.weekday() >= 5:

                employee_stats[
                    username
                ]["weekend_logins"] += 1

            login_records.append(
                {
                    "employee_id": employee.id,
                    "user": username,
                    "pc": pc,
                    "activity": activity,
                    "login_time": event_time.to_pydatetime(),
                    "success": True,
                    "is_anomaly": False,
                    "anomaly_score": 0.0
                }
            )

            if len(login_records) >= BATCH_SIZE:

                db.bulk_insert_mappings(
                    LoginActivity,
                    login_records
                )

                db.commit()

                login_records = []

        if login_records:

            db.bulk_insert_mappings(
                LoginActivity,
                login_records
            )

            db.commit()

        file_records = []

        for row in file_df.itertuples(index=False):

            username = str(row.user).strip()

            employee = employee_map.get(username)

            if not employee:
                continue

            event_time = row.date

            filename = (
                str(row.filename).strip()
                if pd.notna(row.filename)
                else ""
            )

            pc = (
                str(row.pc).strip()
                if pd.notna(row.pc)
                else None
            )

            employee_stats[
                username
            ]["file_access_count"] += 1

            file_records.append(
                {
                    "employee_id": employee.id,
                    "user": username,
                    "pc": pc,
                    "filename": filename,
                    "content": None,
                    "access_time": event_time.to_pydatetime(),
                    "action": "Access",
                    "is_anomaly": False,
                    "anomaly_score": 0.0
                }
            )

            if len(file_records) >= BATCH_SIZE:

                db.bulk_insert_mappings(
                    FileAccess,
                    file_records
                )

                db.commit()

                file_records = []

        if file_records:

            db.bulk_insert_mappings(
                FileAccess,
                file_records
            )

            db.commit()

        for username, stats in employee_stats.items():

            employee = employee_map[username]

            login_count = stats["login_count"]

            after_hours = (
                stats["after_hours_logins"]
            )

            weekend = (
                stats["weekend_logins"]
            )

            file_access = (
                stats["file_access_count"]
            )

            after_hours_ratio = (

                after_hours / login_count

                if login_count > 0

                else 0
            )

            weekend_ratio = (

                weekend / login_count

                if login_count > 0

                else 0
            )

            risk_score = (

                min(
                    after_hours_ratio * 35,
                    35
                )

                + min(
                    weekend_ratio * 25,
                    25
                )

                + min(
                    file_access / 1000 * 20,
                    20
                )

                + min(
                    len(
                        stats["unique_devices"]
                    ) / 10 * 20,
                    20
                )
            )

            risk_score = round(
                min(risk_score, 100),
                2
            )

            if risk_score >= 75:

                risk_level = "Critical"

            elif risk_score >= 50:

                risk_level = "High"

            elif risk_score >= 25:

                risk_level = "Medium"

            else:

                risk_level = "Low"

            anomaly = (
                1
                if risk_score >= 50
                else 0
            )

            employee.login_count = (
                login_count
            )

            employee.unique_devices = len(
                stats["unique_devices"]
            )

            employee.after_hours_logins = (
                after_hours
            )

            employee.weekend_logins = (
                weekend
            )

            employee.after_hours_ratio = round(
                after_hours_ratio,
                4
            )

            employee.weekend_ratio = round(
                weekend_ratio,
                4
            )

            employee.anomaly_prediction = (
                1
                if anomaly
                else 0
            )

            employee.anomaly_score = round(
                risk_score / 100,
                4
            )

            employee.anomaly = anomaly

            employee.risk_score = (
                risk_score
            )

            employee.risk_level = (
                risk_level
            )

        db.commit()

        print(
            "CERT dataset import completed successfully"
        )

        print(
            f"Employees processed: {len(users)}"
        )

        print(
            f"Login records processed: {len(logon_df)}"
        )

        print(
            f"File records processed: {len(file_df)}"
        )

    except Exception as error:

        db.rollback()

        print("Import failed:")

        print(error)

        raise

    finally:

        db.close()


if __name__ == "__main__":

    import_cert_data()