import joblib
import os
from datetime import datetime

import numpy as np
import pandas as pd

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.models import (
    LoginActivity,
    FileAccess,
    AnomalyResult
)


MODEL_PATH = "trained_models/isolation_forest.pkl"


def run_risk_analysis():

    print("Starting risk analysis...")

    # --------------------------------------------------
    # LOAD MODEL
    # --------------------------------------------------

    if not os.path.exists(MODEL_PATH):

        print("Isolation Forest model not found.")

        return

    print("Loading Isolation Forest model...")

    model = joblib.load(MODEL_PATH)

    db: Session = SessionLocal()

    try:

        # --------------------------------------------------
        # GET ALL USERS
        # --------------------------------------------------

        users = (

            db.query(
                LoginActivity.user
            )

            .filter(
                LoginActivity.user.isnot(None)
            )

            .distinct()

            .all()

        )

        user_list = [
            row[0]
            for row in users
        ]

        print(
            f"Users found: {len(user_list)}"
        )

        if not user_list:

            print("No users found.")

            return

        # --------------------------------------------------
        # LOGIN COUNTS
        # --------------------------------------------------

        print("Calculating login statistics...")

        login_counts = (

            db.query(

                LoginActivity.user,

                func.count(
                    LoginActivity.id
                )

            )

            .filter(
                LoginActivity.user.isnot(None)
            )

            .group_by(
                LoginActivity.user
            )

            .all()

        )

        login_count_map = {

            user: count

            for user, count in login_counts

        }

        # --------------------------------------------------
        # FILE ACCESS COUNTS
        # --------------------------------------------------

        print("Calculating file access statistics...")

        file_counts = (

            db.query(

                FileAccess.user,

                func.count(
                    FileAccess.id
                )

            )

            .filter(
                FileAccess.user.isnot(None)
            )

            .group_by(
                FileAccess.user
            )

            .all()

        )

        file_count_map = {

            user: count

            for user, count in file_counts

        }

        # --------------------------------------------------
        # GET ALL LOGIN DATES
        # --------------------------------------------------

        print("Analyzing login times...")

        login_records = (

            db.query(

                LoginActivity.user,

                LoginActivity.date

            )

            .filter(

                LoginActivity.user.isnot(None)

            )

            .all()

        )

        after_hours_map = {

            user: 0

            for user in user_list

        }

        weekend_map = {

            user: 0

            for user in user_list

        }

        # --------------------------------------------------
        # CALCULATE TIME-BASED FEATURES
        # --------------------------------------------------

        for user, date_value in login_records:

            try:

                dt = datetime.strptime(

                    date_value,

                    "%m/%d/%Y %H:%M:%S"

                )

                if (

                    dt.hour < 7

                    or dt.hour >= 19

                ):

                    after_hours_map[user] += 1

                if dt.weekday() >= 5:

                    weekend_map[user] += 1

            except Exception:

                continue

        # --------------------------------------------------
        # BUILD ML FEATURES
        # --------------------------------------------------

        print("Preparing machine learning features...")

        feature_rows = []

        user_features = []

        for user in user_list:

            login_count = login_count_map.get(

                user,

                0

            )

            file_access_count = file_count_map.get(

                user,

                0

            )

            after_hours_count = after_hours_map.get(

                user,

                0

            )

            weekend_count = weekend_map.get(

                user,

                0

            )

            if login_count > 0:

                after_hours_ratio = (

                    after_hours_count /

                    login_count

                )

                weekend_ratio = (

                    weekend_count /

                    login_count

                )

            else:

                after_hours_ratio = 0

                weekend_ratio = 0

            feature_rows.append(

                [

                    login_count,

                    file_access_count,

                    after_hours_ratio,

                    weekend_ratio

                ]

            )

            user_features.append(

                {

                    "user": user,

                    "login_count": login_count,

                    "file_access_count": file_access_count,

                    "after_hours_count": after_hours_count,

                    "weekend_count": weekend_count,

                    "after_hours_ratio": after_hours_ratio,

                    "weekend_ratio": weekend_ratio

                }

            )

        # --------------------------------------------------
        # RUN ML MODEL IN ONE BATCH
        # --------------------------------------------------

        print("Running machine learning predictions...")

        feature_array = np.array(

            feature_rows,

            dtype=float

        )

        predictions = model.predict(

            feature_array

        )

        anomaly_scores = model.decision_function(

            feature_array

        )

        # --------------------------------------------------
        # GET EXISTING RESULTS
        # --------------------------------------------------

        print("Updating risk results...")

        existing_results = (

            db.query(

                AnomalyResult

            )

            .all()

        )

        existing_map = {

            result.user: result

            for result in existing_results

        }

        # --------------------------------------------------
        # CREATE OR UPDATE RESULTS
        # --------------------------------------------------

        for index, data in enumerate(

            user_features

        ):

            user = data["user"]

            login_count = data["login_count"]

            file_access_count = data["file_access_count"]

            after_hours_count = data["after_hours_count"]

            weekend_count = data["weekend_count"]

            after_hours_ratio = data["after_hours_ratio"]

            weekend_ratio = data["weekend_ratio"]

            anomaly_prediction = int(

                predictions[index]

            )

            anomaly_score = float(

                anomaly_scores[index]

            )

            # --------------------------------------------------
            # RISK SCORE
            # --------------------------------------------------

            risk_score = 0

            risk_score += (

                after_hours_ratio * 30

            )

            risk_score += (

                weekend_ratio * 25

            )

            if file_access_count > 1000:

                risk_score += 30

            elif file_access_count > 500:

                risk_score += 20

            elif file_access_count > 100:

                risk_score += 10

            elif file_access_count > 50:

                risk_score += 5

            if anomaly_prediction == -1:

                risk_score += 25

            # --------------------------------------------------
            # RISK LEVEL
            # --------------------------------------------------

            if risk_score >= 70:

                risk_level = "Critical"

            elif risk_score >= 45:

                risk_level = "High"

            elif risk_score >= 20:

                risk_level = "Medium"

            else:

                risk_level = "Low"

            # --------------------------------------------------
            # UPDATE EXISTING RESULT
            # --------------------------------------------------

            if user in existing_map:

                result = existing_map[user]

            else:

                result = AnomalyResult(

                    user=user

                )

                db.add(result)

            result.login_count = login_count

            result.after_hours_logins = (

                after_hours_count

            )

            result.weekend_logins = (

                weekend_count

            )

            result.after_hours_ratio = (

                after_hours_ratio

            )

            result.weekend_ratio = (

                weekend_ratio

            )

            result.anomaly_prediction = (

                anomaly_prediction

            )

            result.anomaly_score = (

                anomaly_score

            )

            result.anomaly = (

                anomaly_prediction

            )

            result.risk_score = round(

                risk_score,

                2

            )

            result.risk_level = (

                risk_level

            )

            # Progress indicator

            if (

                (index + 1) % 100 == 0

            ):

                print(

                    f"Processed {index + 1} users"

                )

        # --------------------------------------------------
        # SAVE ALL RESULTS
        # --------------------------------------------------

        print("Saving results to database...")

        db.commit()

        print()

        print(

            "Risk analysis completed successfully."

        )

        print(

            f"Total users processed: {len(user_list)}"

        )

    except Exception as e:

        db.rollback()

        print()

        print(

            "Risk analysis failed:"

        )

        print(e)

    finally:

        db.close()


if __name__ == "__main__":

    run_risk_analysis()