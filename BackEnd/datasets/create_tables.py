import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

from app.database.database import engine, Base
from app.models.models import AnomalyResult

from sqlalchemy import text


print("Creating anomaly_results table...")

AnomalyResult.__table__.create(
    bind=engine,
    checkfirst=True
)

with engine.connect() as connection:

    result = connection.execute(
        text(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'anomaly_results'
            """
        )
    )

    table = result.fetchone()

    if table:

        print(
            "SUCCESS: anomaly_results table EXISTS"
        )

    else:

        print(
            "ERROR: anomaly_results table DOES NOT EXIST"
        )