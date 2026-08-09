import time
from sqlalchemy.orm import Session

from app.services.risk_score import risk_score_calculator
from app.services.email_service import send_email
from app import models


ALERT_RECIPIENT_ROLES = (
    "Security Analyst",
    "SOC Engineer",
    "Security Manager",
    "Administrator",
)

EMAIL_SEVERITY_THRESHOLD = (
    "High",
    "Critical",
)

EMAIL_SEND_DELAY_SECONDS = 1.5


# Thresholds for calling out a specific behavior as noteworthy
# in the alert email.
#
# These are ratios (0.0-1.0) of that activity type out of
# the employee's total logged activity.

BEHAVIOR_FLAG_THRESHOLDS = {
    "unusual_login_ratio": 0.20,
    "usb_ratio": 0.15,
    "email_ratio": 0.40,
    "web_ratio": 0.40,
    "file_access_ratio": 0.15,
}


class AlertSystem:

    def generate_alert(
        self,
        employee,
        risk_score,
        usb_count=0,
        db: Session = None,
        notify: bool = True,
        background_tasks=None,
        behavior_details: dict = None,
    ):
        severity = risk_score_calculator.categorize(risk_score)

        alert = {
            "employee": employee,
            "risk_score": risk_score,
            "severity": severity,
            "status": "Open",
        }

        if (
            notify
            and db is not None
            and severity in EMAIL_SEVERITY_THRESHOLD
        ):
            if background_tasks is not None:
                background_tasks.add_task(
                    self._notify_analysts,
                    db,
                    employee,
                    risk_score,
                    severity,
                    behavior_details,
                )
            else:
                self._notify_analysts(
                    db,
                    employee,
                    risk_score,
                    severity,
                    behavior_details,
                )

        return alert

    def _build_behavior_summary(
        self,
        behavior_details: dict
    ) -> str:
        """
        Turns raw ratios into plain-language flags for the email body.
        """

        if not behavior_details:
            return "No detailed behavior breakdown available."

        flags = []

        unusual_login_ratio = behavior_details.get(
            "unusual_login_ratio",
            0
        )

        usb_ratio = behavior_details.get(
            "usb_ratio",
            0
        )

        email_ratio = behavior_details.get(
            "email_ratio",
            0
        )

        web_ratio = behavior_details.get(
            "web_ratio",
            0
        )

        file_access_ratio = behavior_details.get(
            "file_access_ratio",
            0
        )

        if (
            unusual_login_ratio
            > BEHAVIOR_FLAG_THRESHOLDS["unusual_login_ratio"]
        ):
            flags.append(
                f"- Unusual login times: "
                f"{round(unusual_login_ratio * 100, 1)}% of logins "
                f"occurred outside normal business hours"
            )

        if (
            usb_ratio
            > BEHAVIOR_FLAG_THRESHOLDS["usb_ratio"]
        ):
            flags.append(
                f"- Elevated USB device activity: "
                f"{round(usb_ratio * 100, 1)}% of logged events "
                f"were USB connect/disconnect — possible use of "
                f"removable media"
            )

        if (
            file_access_ratio
            > BEHAVIOR_FLAG_THRESHOLDS["file_access_ratio"]
        ):
            flags.append(
                f"- High file access volume: "
                f"{round(file_access_ratio * 100, 1)}% of logged events "
                f"were file access — review for unusual downloads "
                f"or file transfers"
            )

        if (
            email_ratio
            > BEHAVIOR_FLAG_THRESHOLDS["email_ratio"]
        ):
            flags.append(
                f"- High email activity: "
                f"{round(email_ratio * 100, 1)}% of logged events "
                f"were email — possible data movement via email"
            )

        if (
            web_ratio
            > BEHAVIOR_FLAG_THRESHOLDS["web_ratio"]
        ):
            flags.append(
                f"- High web access volume: "
                f"{round(web_ratio * 100, 1)}% of logged events "
                f"were web access"
            )

        if not flags:
            flags.append(
                "- No single behavior category stood out; risk is "
                "driven by the overall behavioral anomaly model "
                "(see anomaly score)."
            )

        return "\n".join(flags)

    def _notify_analysts(
        self,
        db: Session,
        employee,
        risk_score,
        severity,
        behavior_details: dict = None,
    ):
        recipients = (
            db.query(models.User)
            .filter(
                models.User.role.in_(ALERT_RECIPIENT_ROLES)
            )
            .filter(
                models.User.is_active == True
            )
            .all()
        )

        behavior_summary = self._build_behavior_summary(
            behavior_details
        )

        subject = (
            f"[{severity} Risk Alert] "
            f"Employee {employee} flagged"
        )

        body = (
            f"Insider Threat Alert\n\n"
            f"Employee: {employee}\n"
            f"Risk Score: {risk_score}\n"
            f"Severity: {severity}\n\n"
            f"Flagged behaviors:\n"
            f"{behavior_summary}\n\n"
            f"Please review this employee's activity "
            f"in the SOC dashboard."
        )

        for user in recipients:
            send_email(
                user.email,
                subject,
                body
            )

            time.sleep(
                EMAIL_SEND_DELAY_SECONDS
            )


alert_system = AlertSystem()