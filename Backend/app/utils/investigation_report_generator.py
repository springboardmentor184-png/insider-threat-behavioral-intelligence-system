from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)

from datetime import datetime
import os


def generate_investigation_report(
    investigation,
    timeline,
    evidence,
    device_analysis,
    risk_history,
    correlation
):
    """
    Generate a PDF Investigation Report.
    """

    # =====================================================
    # Reports Folder
    # =====================================================

    reports_dir = "reports"
    os.makedirs(reports_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = (
        f"Investigation_Report_"
        f"{investigation['employee_code']}_"
        f"{timestamp}.pdf"
    )

    filepath = os.path.join(
        reports_dir,
        filename
    )

    # =====================================================
    # PDF Document
    # =====================================================

    doc = SimpleDocTemplate(
        filepath,
        leftMargin=30,
        rightMargin=30,
        topMargin=25,
        bottomMargin=25
    )

    styles = getSampleStyleSheet()

    story = []

    # =====================================================
    # Styles
    # =====================================================

    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Heading1"],
        alignment=TA_CENTER,
        fontSize=18,
        textColor=colors.white,
        leading=22,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=10,
        textColor=colors.white,
        leading=14
    )

    section_style = ParagraphStyle(
        "SectionStyle",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#0B5394"),
        spaceBefore=10,
        spaceAfter=6
    )

    normal_style = ParagraphStyle(
        "NormalStyle",
        parent=styles["BodyText"],
        fontSize=9,
        leading=14
    )

    # =====================================================
    # HEADER
    # =====================================================

    header = Table(
        [
            [
                Paragraph(
                    "<b>AI INSIDER THREAT "
                    "BEHAVIORAL INTELLIGENCE SYSTEM</b>",
                    title_style
                )
            ],
            [
                Paragraph(
                    "THREAT INVESTIGATION REPORT",
                    subtitle_style
                )
            ]
        ],
        colWidths=[520]
    )

    header.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    colors.HexColor("#0B5394")
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    12
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    12
                ),
                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER"
                )
            ]
        )
    )

    story.append(header)
    story.append(Spacer(1, 12))

    # =====================================================
    # REPORT INFORMATION
    # =====================================================

    report_id = (
        f"INV-{investigation['employee_code']}-"
        f"{timestamp}"
    )

    info_table = Table(
        [
            [
                "Report ID",
                report_id,
                "Generated",
                datetime.now().strftime(
                    "%d-%b-%Y %I:%M %p"
                )
            ],
            [
                "Classification",
                "CONFIDENTIAL",
                "Investigation ID",
                str(investigation["id"])
            ]
        ],
        colWidths=[90, 170, 90, 140]
    )

    info_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#D9EAF7")
                ),
                (
                    "BACKGROUND",
                    (0, 1),
                    (-1, 1),
                    colors.whitesmoke
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),
                (
                    "FONTNAME",
                    (2, 0),
                    (2, -1),
                    "Helvetica-Bold"
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(info_table)
    story.append(Spacer(1, 15))

    # =====================================================
    # INVESTIGATION SUMMARY
    # =====================================================

    story.append(
        Paragraph(
            "<b>INVESTIGATION SUMMARY</b>",
            section_style
        )
    )

    summary_table = Table(
        [
            [
                "Incident",
                investigation["incident_title"]
            ],
            [
                "Threat Severity",
                investigation["threat_severity"]
            ],
            [
                "Investigation Status",
                investigation["status"]
            ],
            [
                "Assigned Analyst",
                investigation["assigned_analyst"]
            ],
            [
                "Created",
                str(investigation["created_at"])
            ]
        ],
        colWidths=[170, 350]
    )

    summary_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#D9EAF7")
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(summary_table)
    story.append(Spacer(1, 12))

    # =====================================================
    # EMPLOYEE INFORMATION
    # =====================================================

    story.append(
        Paragraph(
            "<b>EMPLOYEE INFORMATION</b>",
            section_style
        )
    )

    employee_table = Table(
        [
            [
                "Employee ID",
                investigation["employee_code"]
            ],
            [
                "Employee Name",
                investigation["full_name"]
            ],
            [
                "Department",
                investigation["department"]
            ],
            [
                "Role",
                investigation["role"]
            ]
        ],
        colWidths=[170, 350]
    )

    employee_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#EDF5FC")
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(employee_table)
    story.append(Spacer(1, 12))

    # =====================================================
    # THREAT EVIDENCE
    # =====================================================

    story.append(
        Paragraph(
            "<b>THREAT EVIDENCE</b>",
            section_style
        )
    )

    evidence_table = Table(
        [
            ["Evidence", "Observed Value"],
            [
                "Failed Logins",
                str(evidence["failed_logins"])
            ],
            [
                "Files Downloaded",
                str(evidence["files_downloaded"])
            ],
            [
                "Emails Sent",
                str(evidence["emails_sent"])
            ],
            [
                "USB Used",
                "Yes" if evidence["usb_used"] else "No"
            ],
            [
                "After Hours Login",
                "Yes"
                if evidence["after_hours_login"]
                else "No"
            ],
            [
                "Detection Method",
                evidence["detection_method"]
            ],
            [
                "Risk Level",
                evidence["risk_level"]
            ]
        ],
        colWidths=[260, 260]
    )

    evidence_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#0B5394")
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(evidence_table)
    story.append(Spacer(1, 15))

    # =====================================================
    # ACTIVITY TIMELINE
    # =====================================================

    story.append(
        Paragraph(
            "<b>ACTIVITY TIMELINE</b>",
            section_style
        )
    )

    timeline_rows = [
        ["Time", "Event", "Severity"]
    ]

    for event in timeline.get("events", []):

        timeline_rows.append(
            [
                str(event.get("time", "")),
                str(event.get("title", "")),
                str(event.get("severity", ""))
            ]
        )

    timeline_table = Table(
        timeline_rows,
        colWidths=[80, 330, 110]
    )

    timeline_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#0B5394")
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP"
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                )
            ]
        )
    )

    story.append(timeline_table)
    story.append(Spacer(1, 15))

    # =====================================================
    # DEVICE ANALYSIS
    # =====================================================

    story.append(
        Paragraph(
            "<b>DEVICE ANALYSIS</b>",
            section_style
        )
    )

    device_table = Table(
        [
            ["Metric", "Value"],
            [
                "Login Hour",
                f"{device_analysis['login_hour']}:00"
            ],
            [
                "USB Device Used",
                "Yes"
                if device_analysis["usb_used"]
                else "No"
            ],
            [
                "After Hours Login",
                "Yes"
                if device_analysis["after_hours_login"]
                else "No"
            ],
            [
                "Files Downloaded",
                str(device_analysis["files_downloaded"])
            ],
            [
                "Emails Sent",
                str(device_analysis["emails_sent"])
            ],
            [
                "Device Risk",
                device_analysis["device_risk"]
            ]
        ],
        colWidths=[260, 260]
    )

    device_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#212529")
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(device_table)
    story.append(Spacer(1, 15))

    # =====================================================
    # RISK HISTORY
    # =====================================================

    story.append(
        Paragraph(
            "<b>USER RISK HISTORY</b>",
            section_style
        )
    )

    risk_table = Table(
        [
            ["Metric", "Value"],
            [
                "Current Risk",
                risk_history["current_risk"]
            ],
            [
                "Previous Risk",
                risk_history["previous_risk"]
            ],
            [
                "Total Incidents",
                str(risk_history["total_incidents"])
            ],
            [
                "Average Risk Score",
                str(risk_history["average_risk_score"])
            ],
            [
                "Behaviour Trend",
                risk_history["behaviour_trend"]
            ]
        ],
        colWidths=[260, 260]
    )

    risk_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#0B5394")
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(risk_table)
    story.append(Spacer(1, 15))

    # =====================================================
    # EVENT CORRELATION
    # =====================================================

    story.append(
        Paragraph(
            "<b>EVENT CORRELATION</b>",
            section_style
        )
    )

    correlation_summary = Table(
        [
            ["Employee", correlation["employee_name"]],
            ["Total Events", str(correlation["total_events"])],
            [
                "Correlation Score",
                f"{correlation['correlation_score']}%"
            ],
            ["Risk Level", correlation["risk_level"]]
        ],
        colWidths=[170, 350]
    )

    correlation_summary.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#EDF5FC")
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(correlation_summary)
    story.append(Spacer(1, 8))

    correlation_events = [
        ["Security Event", "Severity", "Correlated"]
    ]

    for event in correlation.get("events", []):

        correlation_events.append(
            [
                event.get("event", ""),
                event.get("severity", ""),
                "Yes" if event.get("correlated") else "No"
            ]
        )

    if len(correlation_events) > 1:

        correlation_table = Table(
            correlation_events,
            colWidths=[300, 110, 110]
        )

        correlation_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#0B5394")
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.white
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold"
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.grey
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        7
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        7
                    )
                ]
            )
        )

        story.append(correlation_table)

    story.append(Spacer(1, 15))

    # =====================================================
    # INVESTIGATION FINDINGS
    # =====================================================

    story.append(
        Paragraph(
            "<b>INVESTIGATION FINDINGS</b>",
            section_style
        )
    )

    story.append(
        Paragraph(
            f"<b>Investigation Notes:</b> "
            f"{investigation.get('investigation_notes') or 'No notes provided.'}",
            normal_style
        )
    )

    story.append(Spacer(1, 8))

    story.append(
        Paragraph(
            f"<b>Recommendation:</b> "
            f"{investigation.get('recommendation') or 'No recommendation provided.'}",
            normal_style
        )
    )

    story.append(Spacer(1, 15))

    # =====================================================
    # FOOTER
    # =====================================================

    footer = Table(
        [
            [
                Paragraph(
                    "<b>Generated by AI Insider Threat "
                    "Behavioral Intelligence System</b>",
                    ParagraphStyle(
                        "Footer",
                        parent=styles["Normal"],
                        alignment=TA_CENTER,
                        fontSize=8,
                        textColor=colors.grey
                    )
                )
            ],
            [
                Paragraph(
                    "CONFIDENTIAL • For Internal Security Use Only",
                    ParagraphStyle(
                        "Footer2",
                        parent=styles["Normal"],
                        alignment=TA_CENTER,
                        fontSize=8,
                        textColor=colors.grey
                    )
                )
            ]
        ],
        colWidths=[520]
    )

    footer.setStyle(
        TableStyle(
            [
                (
                    "LINEABOVE",
                    (0, 0),
                    (-1, 0),
                    0.5,
                    colors.grey
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    10
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    5
                )
            ]
        )
    )

    story.append(footer)

    # =====================================================
    # BUILD PDF
    # =====================================================

    doc.build(story)

    return filepath