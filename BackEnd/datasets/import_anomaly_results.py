import os
import sys
import pandas as pd

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "backend"
        )
    )
)

from app.database.database import SessionLocal
from app.models.models import Employee


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CSV_PATH = os.path.join(
    BASE_DIR,
    "processed",
    "anomaly_results.csv"
)


def clean_value(value, default=None):

    if pd.isna(value):
        return default

    return value


def main():

    if not os.path.exists(CSV_PATH):

        print(f"File not found: {CSV_PATH}")

        return

    df = pd.read_csv(CSV_PATH)

    db = SessionLocal()

    try:

        db.query(Employee).delete()

        db.commit()

        for _, row in df.iterrows():

            user = str(
                clean_value(
                    row.get("user"),
                    ""
                )
            ).strip()

            if not user:

                continue

            employee = Employee(

                user=user,

                name=user,

                login_count=int(
                    clean_value(
                        row.get("login_count"),
                        0
                    )
                ),

                unique_devices=int(
                    clean_value(
                        row.get("unique_devices"),
                        0
                    )
                ),

                after_hours_logins=int(
                    clean_value(
                        row.get("after_hours_logins"),
                        0
                    )
                ),

                weekend_logins=int(
                    clean_value(
                        row.get("weekend_logins"),
                        0
                    )
                ),

                after_hours_ratio=float(
                    clean_value(
                        row.get("after_hours_ratio"),
                        0
                    )
                ),

                weekend_ratio=float(
                    clean_value(
                        row.get("weekend_ratio"),
                        0
                    )
                ),

                anomaly_prediction=int(
                    clean_value(
                        row.get("anomaly_prediction"),
                        1
                    )
                ),

                anomaly_score=float(
                    clean_value(
                        row.get("anomaly_score"),
                        0
                    )
                ),

                anomaly=int(
                    clean_value(
                        row.get("anomaly"),
                        0
                    )
                ),

                risk_score=float(
                    clean_value(
                        row.get("risk_score"),
                        0
                    )
                ),

                risk_level=str(
                    clean_value(
                        row.get("risk_level"),
                        "Low"
                    )
                )

            )

            db.add(employee)

        db.commit()

        total = db.query(Employee).count()

        print(
            f"Successfully imported {total} employees"
        )

    except Exception as error:

        db.rollback()

        print(
            f"Import failed: {error}"
        )

    finally:

        db.close()


if __name__ == "__main__":

    main()