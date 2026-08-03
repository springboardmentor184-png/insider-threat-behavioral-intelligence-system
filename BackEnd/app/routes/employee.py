from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from datetime import datetime

from app.database.database import get_db
from app.models.models import Employee, LoginActivity, FileAccess, Alert, Investigation, AnomalyResult

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)


def format_datetime(value):
    if not value:
        return "-"
    return value.strftime("%Y-%m-%d %H:%M:%S")


def get_risk_level(score):
    score = float(score or 0)

    if score >= 80:
        return "Critical"

    if score >= 60:
        return "High"

    if score >= 30:
        return "Medium"

    return "Low"


def employee_response(employee):
    risk_score = round(float(employee.risk_score or 0), 2)

    return {
        "id": employee.id,
        "user": employee.user,
        "name": employee.name or employee.user,
        "employee_id": employee.user,
        "email": employee.email or "-",
        "department": employee.department or "-",
        "designation": employee.designation or "-",
        "manager": employee.manager or "-",
        "login_count": employee.login_count or 0,
        "unique_devices": employee.unique_devices or 0,
        "after_hours_logins": employee.after_hours_logins or 0,
        "weekend_logins": employee.weekend_logins or 0,
        "after_hours_ratio": round(float(employee.after_hours_ratio or 0), 2),
        "weekend_ratio": round(float(employee.weekend_ratio or 0), 2),
        "anomaly_prediction": employee.anomaly_prediction,
        "anomaly_score": round(float(employee.anomaly_score or 0), 4),
        "anomaly": employee.anomaly or 0,
        "risk_score": risk_score,
        "risk_level": employee.risk_level or get_risk_level(risk_score),
        "is_active": bool(employee.is_active),
        "created_at": format_datetime(employee.created_at)
    }


def get_employee_or_404(employee_id, db):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return employee


@router.get("/")
def get_employees(
    search: str = "",
    risk_level: str = "",
    db: Session = Depends(get_db)
):
    query = db.query(Employee)

    if search.strip():
        search_value = f"%{search.strip()}%"

        query = query.filter(
            (
                Employee.user.ilike(search_value)
            )
            |
            (
                Employee.name.ilike(search_value)
            )
            |
            (
                Employee.email.ilike(search_value)
            )
            |
            (
                Employee.department.ilike(search_value)
            )
        )

    if risk_level.strip():
        query = query.filter(
            Employee.risk_level.ilike(
                risk_level.strip()
            )
        )

    employees = (
        query
        .order_by(Employee.risk_score.desc())
        .all()
    )

    return [
        employee_response(employee)
        for employee in employees
    ]


@router.get("/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    employee = get_employee_or_404(
        employee_id,
        db
    )

    return employee_response(employee)


@router.get("/{employee_id}/activities")
def get_employee_activities(
    employee_id: int,
    limit: int = 500,
    db: Session = Depends(get_db)
):
    employee = get_employee_or_404(
        employee_id,
        db
    )

    limit = max(
        1,
        min(limit, 5000)
    )

    login_activities = (
        db.query(LoginActivity)
        .filter(
            LoginActivity.employee_id
            == employee.id
        )
        .order_by(
            LoginActivity.login_time.desc()
        )
        .limit(limit)
        .all()
    )

    file_activities = (
        db.query(FileAccess)
        .filter(
            FileAccess.employee_id
            == employee.id
        )
        .order_by(
            FileAccess.access_time.desc()
        )
        .limit(limit)
        .all()
    )

    activities = []

    for activity in login_activities:
        activities.append(
            {
                "id": f"login-{activity.id}",
                "type": "Login Activity",
                "activity": activity.activity or "Login",
                "device": activity.pc or "-",
                "resource": activity.ip_address or "-",
                "location": activity.location or "-",
                "status": (
                    "Success"
                    if activity.success
                    else "Failed"
                ),
                "is_anomaly": bool(
                    activity.is_anomaly
                ),
                "anomaly_score": round(
                    float(
                        activity.anomaly_score
                        or 0
                    ),
                    4
                ),
                "timestamp": format_datetime(
                    activity.login_time
                ),
                "sort_time": (
                    activity.login_time
                    or datetime.min
                )
            }
        )

    for activity in file_activities:
        activities.append(
            {
                "id": f"file-{activity.id}",
                "type": "File Activity",
                "activity": activity.action or "Access",
                "device": activity.pc or "-",
                "resource": activity.filename or "-",
                "location": "-",
                "status": "Completed",
                "is_anomaly": bool(
                    activity.is_anomaly
                ),
                "anomaly_score": round(
                    float(
                        activity.anomaly_score
                        or 0
                    ),
                    4
                ),
                "timestamp": format_datetime(
                    activity.access_time
                ),
                "sort_time": (
                    activity.access_time
                    or datetime.min
                )
            }
        )

    activities.sort(
        key=lambda item: item["sort_time"],
        reverse=True
    )

    for activity in activities:
        activity.pop(
            "sort_time",
            None
        )

    return {
        "employee": employee_response(
            employee
        ),
        "total": len(activities),
        "login_total": len(
            login_activities
        ),
        "file_total": len(
            file_activities
        ),
        "activities": activities
    }


@router.get("/{employee_id}/intelligence")
def get_employee_intelligence(
    employee_id: int,
    activity_limit: int = 1000,
    db: Session = Depends(get_db)
):
    employee = get_employee_or_404(
        employee_id,
        db
    )

    activity_limit = max(
        1,
        min(
            activity_limit,
            10000
        )
    )

    login_count = (
        db.query(LoginActivity)
        .filter(
            LoginActivity.employee_id
            == employee.id
        )
        .count()
    )

    file_count = (
        db.query(FileAccess)
        .filter(
            FileAccess.employee_id
            == employee.id
        )
        .count()
    )

    anomalous_logins = (
        db.query(LoginActivity)
        .filter(
            LoginActivity.employee_id
            == employee.id,
            LoginActivity.is_anomaly
            == True
        )
        .count()
    )

    anomalous_files = (
        db.query(FileAccess)
        .filter(
            FileAccess.employee_id
            == employee.id,
            FileAccess.is_anomaly
            == True
        )
        .count()
    )

    alerts = (
        db.query(Alert)
        .filter(
            Alert.employee_id
            == employee.id
        )
        .order_by(
            Alert.created_at.desc()
        )
        .all()
    )

    investigations = (
        db.query(Investigation)
        .filter(
            Investigation.employee_id
            == employee.id
        )
        .order_by(
            Investigation.updated_at.desc()
        )
        .all()
    )

    anomaly_results = (
        db.query(AnomalyResult)
        .filter(
            AnomalyResult.employee_id
            == employee.id
        )
        .order_by(
            AnomalyResult.detected_at.desc()
        )
        .all()
    )

    activity_data = get_employee_activities(
        employee_id,
        activity_limit,
        db
    )

    risk_score = round(
        float(
            employee.risk_score
            or 0
        ),
        2
    )

    risk_level = (
        employee.risk_level
        or get_risk_level(
            risk_score
        )
    )

    total_anomalies = (
        anomalous_logins
        + anomalous_files
        + len(anomaly_results)
    )

    return {
        "employee": employee_response(
            employee
        ),
        "risk": {
            "score": risk_score,
            "level": risk_level,
            "anomaly_score": round(
                float(
                    employee.anomaly_score
                    or 0
                ),
                4
            ),
            "anomaly_prediction": (
                employee.anomaly_prediction
            ),
            "anomaly_flag": (
                employee.anomaly
            )
        },
        "statistics": {
            "total_activities": (
                login_count
                + file_count
            ),
            "login_activities": (
                login_count
            ),
            "file_activities": (
                file_count
            ),
            "anomalous_logins": (
                anomalous_logins
            ),
            "anomalous_files": (
                anomalous_files
            ),
            "total_anomalies": (
                total_anomalies
            ),
            "alerts": len(alerts),
            "investigations": (
                len(investigations)
            )
        },
        "activities": (
            activity_data[
                "activities"
            ]
        ),
        "alerts": [
            {
                "id": alert.id,
                "title": alert.title,
                "description": (
                    alert.description
                    or "-"
                ),
                "severity": (
                    alert.severity
                    or "Medium"
                ),
                "status": (
                    alert.status
                    or "Open"
                ),
                "risk_score": round(
                    float(
                        alert.risk_score
                        or 0
                    ),
                    2
                ),
                "alert_type": (
                    alert.alert_type
                    or "-"
                ),
                "created_at": (
                    format_datetime(
                        alert.created_at
                    )
                )
            }
            for alert in alerts
        ],
        "investigations": [
            {
                "id": investigation.id,
                "title": (
                    investigation.title
                ),
                "description": (
                    investigation.description
                    or "-"
                ),
                "priority": (
                    investigation.priority
                    or "Medium"
                ),
                "status": (
                    investigation.status
                    or "Open"
                ),
                "assigned_to": (
                    investigation.assigned_to
                    or "-"
                ),
                "created_at": (
                    format_datetime(
                        investigation.created_at
                    )
                ),
                "updated_at": (
                    format_datetime(
                        investigation.updated_at
                    )
                )
            }
            for investigation
            in investigations
        ],
        "anomaly_results": [
            {
                "id": result.id,
                "anomaly_score": round(
                    float(
                        result.anomaly_score
                        or 0
                    ),
                    4
                ),
                "risk_level": (
                    result.risk_level
                    or "Low"
                ),
                "detected_at": (
                    format_datetime(
                        result.detected_at
                    )
                )
            }
            for result
            in anomaly_results
        ]
    }


@router.get("/{employee_id}/download/pdf")
def download_employee_pdf(
    employee_id: int,
    db: Session = Depends(get_db)
):
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import (
            getSampleStyleSheet,
            ParagraphStyle
        )
        from reportlab.lib.enums import (
            TA_CENTER
        )
        from reportlab.lib.units import mm
        from reportlab.platypus import (
            SimpleDocTemplate,
            Paragraph,
            Spacer,
            Table,
            TableStyle,
            PageBreak
        )
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail=(
                "reportlab is not installed. "
                "Run: pip install reportlab"
            )
        )

    intelligence = (
        get_employee_intelligence(
            employee_id,
            10000,
            db
        )
    )

    employee = intelligence[
        "employee"
    ]

    risk = intelligence[
        "risk"
    ]

    statistics = intelligence[
        "statistics"
    ]

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=19,
        leading=24,
        spaceAfter=12
    )

    heading_style = ParagraphStyle(
        "HeadingStyle",
        parent=styles["Heading2"],
        fontSize=13,
        leading=17,
        spaceBefore=10,
        spaceAfter=7
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["BodyText"],
        fontSize=8,
        leading=11
    )

    story = []

    story.append(
        Paragraph(
            "Employee Behavioral Intelligence Report",
            title_style
        )
    )

    story.append(
        Paragraph(
            (
                "Generated: "
                + datetime.now().strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
            ),
            normal_style
        )
    )

    story.append(
        Spacer(
            1,
            5 * mm
        )
    )

    story.append(
        Paragraph(
            "Employee Profile",
            heading_style
        )
    )

    profile_data = [
        [
            "Employee ID",
            str(
                employee[
                    "employee_id"
                ]
            )
        ],
        [
            "Name",
            str(
                employee[
                    "name"
                ]
            )
        ],
        [
            "Email",
            str(
                employee[
                    "email"
                ]
            )
        ],
        [
            "Department",
            str(
                employee[
                    "department"
                ]
            )
        ],
        [
            "Designation",
            str(
                employee[
                    "designation"
                ]
            )
        ],
        [
            "Manager",
            str(
                employee[
                    "manager"
                ]
            )
        ],
        [
            "Status",
            (
                "Active"
                if employee[
                    "is_active"
                ]
                else "Inactive"
            )
        ]
    ]

    profile_table = Table(
        profile_data,
        colWidths=[
            50 * mm,
            120 * mm
        ]
    )

    profile_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    0.5,
                    colors.grey
                ),
                (
                    "BACKGROUND",
                    (
                        0,
                        0
                    ),
                    (
                        0,
                        -1
                    ),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (
                        0,
                        0
                    ),
                    (
                        0,
                        -1
                    ),
                    "Helvetica-Bold"
                ),
                (
                    "FONTSIZE",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    8
                ),
                (
                    "VALIGN",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    "TOP"
                ),
                (
                    "LEFTPADDING",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    6
                ),
                (
                    "RIGHTPADDING",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    6
                ),
                (
                    "TOPPADDING",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    5
                ),
                (
                    "BOTTOMPADDING",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    5
                )
            ]
        )
    )

    story.append(
        profile_table
    )

    story.append(
        Paragraph(
            "Risk Assessment",
            heading_style
        )
    )

    risk_data = [
        [
            "Risk Score",
            str(
                risk[
                    "score"
                ]
            )
        ],
        [
            "Risk Level",
            str(
                risk[
                    "level"
                ]
            )
        ],
        [
            "Anomaly Score",
            str(
                risk[
                    "anomaly_score"
                ]
            )
        ],
        [
            "Anomaly Prediction",
            str(
                risk[
                    "anomaly_prediction"
                ]
            )
        ],
        [
            "Anomaly Flag",
            str(
                risk[
                    "anomaly_flag"
                ]
            )
        ]
    ]

    risk_table = Table(
        risk_data,
        colWidths=[
            70 * mm,
            100 * mm
        ]
    )

    risk_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    0.5,
                    colors.grey
                ),
                (
                    "BACKGROUND",
                    (
                        0,
                        0
                    ),
                    (
                        0,
                        -1
                    ),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (
                        0,
                        0
                    ),
                    (
                        0,
                        -1
                    ),
                    "Helvetica-Bold"
                ),
                (
                    "FONTSIZE",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    8
                ),
                (
                    "TOPPADDING",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    5
                ),
                (
                    "BOTTOMPADDING",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    5
                )
            ]
        )
    )

    story.append(
        risk_table
    )

    story.append(
        Paragraph(
            "Activity Statistics",
            heading_style
        )
    )

    statistics_data = [
        [
            "Total Activities",
            statistics[
                "total_activities"
            ]
        ],
        [
            "Login Activities",
            statistics[
                "login_activities"
            ]
        ],
        [
            "File Activities",
            statistics[
                "file_activities"
            ]
        ],
        [
            "Anomalous Logins",
            statistics[
                "anomalous_logins"
            ]
        ],
        [
            "Anomalous Files",
            statistics[
                "anomalous_files"
            ]
        ],
        [
            "Total Anomalies",
            statistics[
                "total_anomalies"
            ]
        ],
        [
            "Alerts",
            statistics[
                "alerts"
            ]
        ],
        [
            "Investigations",
            statistics[
                "investigations"
            ]
        ]
    ]

    statistics_table = Table(
        statistics_data,
        colWidths=[
            70 * mm,
            100 * mm
        ]
    )

    statistics_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    0.5,
                    colors.grey
                ),
                (
                    "BACKGROUND",
                    (
                        0,
                        0
                    ),
                    (
                        0,
                        -1
                    ),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (
                        0,
                        0
                    ),
                    (
                        0,
                        -1
                    ),
                    "Helvetica-Bold"
                ),
                (
                    "FONTSIZE",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    8
                )
            ]
        )
    )

    story.append(
        statistics_table
    )

    story.append(
        PageBreak()
    )

    story.append(
        Paragraph(
            "Complete Activity History",
            heading_style
        )
    )

    activity_rows = [
        [
            "Time",
            "Type",
            "Activity",
            "Device",
            "Resource",
            "Status",
            "Anomaly"
        ]
    ]

    for activity in intelligence[
        "activities"
    ]:
        activity_rows.append(
            [
                Paragraph(
                    str(
                        activity[
                            "timestamp"
                        ]
                    ),
                    normal_style
                ),
                Paragraph(
                    str(
                        activity[
                            "type"
                        ]
                    ),
                    normal_style
                ),
                Paragraph(
                    str(
                        activity[
                            "activity"
                        ]
                    ),
                    normal_style
                ),
                Paragraph(
                    str(
                        activity[
                            "device"
                        ]
                    ),
                    normal_style
                ),
                Paragraph(
                    str(
                        activity[
                            "resource"
                        ]
                    ),
                    normal_style
                ),
                Paragraph(
                    str(
                        activity[
                            "status"
                        ]
                    ),
                    normal_style
                ),
                Paragraph(
                    (
                        "Yes"
                        if activity[
                            "is_anomaly"
                        ]
                        else "No"
                    ),
                    normal_style
                )
            ]
        )

    if len(
        activity_rows
    ) == 1:
        activity_rows.append(
            [
                "No activity data",
                "",
                "",
                "",
                "",
                "",
                ""
            ]
        )

    activity_table = Table(
        activity_rows,
        repeatRows=1,
        colWidths=[
            25 * mm,
            25 * mm,
            28 * mm,
            24 * mm,
            38 * mm,
            18 * mm,
            16 * mm
        ]
    )

    activity_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    0.35,
                    colors.grey
                ),
                (
                    "BACKGROUND",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        0
                    ),
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        0
                    ),
                    "Helvetica-Bold"
                ),
                (
                    "FONTSIZE",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    6
                ),
                (
                    "VALIGN",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    "TOP"
                ),
                (
                    "TOPPADDING",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    3
                ),
                (
                    "BOTTOMPADDING",
                    (
                        0,
                        0
                    ),
                    (
                        -1,
                        -1
                    ),
                    3
                )
            ]
        )
    )

    story.append(
        activity_table
    )

    if intelligence[
        "alerts"
    ]:
        story.append(
            PageBreak()
        )

        story.append(
            Paragraph(
                "Alerts",
                heading_style
            )
        )

        alert_rows = [
            [
                "Title",
                "Severity",
                "Status",
                "Risk Score",
                "Created"
            ]
        ]

        for alert in intelligence[
            "alerts"
        ]:
            alert_rows.append(
                [
                    Paragraph(
                        str(
                            alert[
                                "title"
                            ]
                        ),
                        normal_style
                    ),
                    str(
                        alert[
                            "severity"
                        ]
                    ),
                    str(
                        alert[
                            "status"
                        ]
                    ),
                    str(
                        alert[
                            "risk_score"
                        ]
                    ),
                    str(
                        alert[
                            "created_at"
                        ]
                    )
                ]
            )

        alert_table = Table(
            alert_rows,
            repeatRows=1,
            colWidths=[
                70 * mm,
                25 * mm,
                25 * mm,
                25 * mm,
                35 * mm
            ]
        )

        alert_table.setStyle(
            TableStyle(
                [
                    (
                        "GRID",
                        (
                            0,
                            0
                        ),
                        (
                            -1,
                            -1
                        ),
                        0.4,
                        colors.grey
                    ),
                    (
                        "BACKGROUND",
                        (
                            0,
                            0
                        ),
                        (
                            -1,
                            0
                        ),
                        colors.lightgrey
                    ),
                    (
                        "FONTNAME",
                        (
                            0,
                            0
                        ),
                        (
                            -1,
                            0
                        ),
                        "Helvetica-Bold"
                    ),
                    (
                        "FONTSIZE",
                        (
                            0,
                            0
                        ),
                        (
                            -1,
                            -1
                        ),
                        7
                    )
                ]
            )
        )

        story.append(
            alert_table
        )

    if intelligence[
        "investigations"
    ]:
        story.append(
            Paragraph(
                "Investigations",
                heading_style
            )
        )

        investigation_rows = [
            [
                "Title",
                "Priority",
                "Status",
                "Assigned To",
                "Updated"
            ]
        ]

        for investigation in intelligence[
            "investigations"
        ]:
            investigation_rows.append(
                [
                    Paragraph(
                        str(
                            investigation[
                                "title"
                            ]
                        ),
                        normal_style
                    ),
                    str(
                        investigation[
                            "priority"
                        ]
                    ),
                    str(
                        investigation[
                            "status"
                        ]
                    ),
                    str(
                        investigation[
                            "assigned_to"
                        ]
                    ),
                    str(
                        investigation[
                            "updated_at"
                        ]
                    )
                ]
            )

        investigation_table = Table(
            investigation_rows,
            repeatRows=1,
            colWidths=[
                65 * mm,
                25 * mm,
                25 * mm,
                30 * mm,
                35 * mm
            ]
        )

        investigation_table.setStyle(
            TableStyle(
                [
                    (
                        "GRID",
                        (
                            0,
                            0
                        ),
                        (
                            -1,
                            -1
                        ),
                        0.4,
                        colors.grey
                    ),
                    (
                        "BACKGROUND",
                        (
                            0,
                            0
                        ),
                        (
                            -1,
                            0
                        ),
                        colors.lightgrey
                    ),
                    (
                        "FONTNAME",
                        (
                            0,
                            0
                        ),
                        (
                            -1,
                            0
                        ),
                        "Helvetica-Bold"
                    ),
                    (
                        "FONTSIZE",
                        (
                            0,
                            0
                        ),
                        (
                            -1,
                            -1
                        ),
                        7
                    )
                ]
            )
        )

        story.append(
            investigation_table
        )

    document.build(
        story
    )

    buffer.seek(0)

    filename = (
        f"employee_{employee['employee_id']}"
        "_intelligence_report.pdf"
    )

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        }
    )