from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
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


def generate_report(employee, baseline, prediction):

    # ==================================================
    # Create Reports Folder
    # ==================================================

    reports_dir = "reports"
    os.makedirs(reports_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    filename = (
        f"Anomaly_Report_{employee.employee_id}_{timestamp}.pdf"
    )

    filepath = os.path.join(reports_dir, filename)

    # ==================================================
    # PDF Document
    # ==================================================

    doc = SimpleDocTemplate(
        filepath,
        leftMargin=30,
        rightMargin=30,
        topMargin=25,
        bottomMargin=25
    )

    styles = getSampleStyleSheet()

    story = []

    # ==================================================
    # Custom Styles
    # ==================================================

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

    footer_style = ParagraphStyle(
        "FooterStyle",
        parent=styles["Italic"],
        alignment=TA_CENTER,
        fontSize=8,
        textColor=colors.grey
    )

    # ==================================================
    # HEADER
    # ==================================================

    header = Table(
        [
            [
                Paragraph(
                    "<b>AI INSIDER THREAT BEHAVIORAL INTELLIGENCE SYSTEM</b>",
                    title_style
                )
            ],
            [
                Paragraph(
                    "AI ANOMALY DETECTION REPORT",
                    subtitle_style
                )
            ]
        ],
        colWidths=[520]
    )

    header.setStyle(TableStyle([

        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0B5394")),

        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),

        ("TOPPADDING", (0, 0), (-1, -1), 12),

        ("ALIGN", (0, 0), (-1, -1), "CENTER")

    ]))

    story.append(header)
    story.append(Spacer(1, 12))

    # ==================================================
    # REPORT INFORMATION
    # ==================================================

    report_id = f"RPT-{employee.employee_id}-{timestamp}"

    info_table = Table(

        [

            [
                "Report ID",
                report_id,
                "Generated",
                datetime.now().strftime("%d-%b-%Y %I:%M %p")
            ],

            [
                "Classification",
                "CONFIDENTIAL",
                "Version",
                "1.0"
            ]

        ],

        colWidths=[90, 170, 90, 140]

    )

    info_table.setStyle(TableStyle([

        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#D9EAF7")),

        ("BACKGROUND", (0, 1), (-1, 1), colors.whitesmoke),

        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),

        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),

        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),

        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),

        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),

        ("TOPPADDING", (0, 0), (-1, -1), 8),

        ("ALIGN", (0, 0), (-1, -1), "CENTER")

    ]))

    story.append(info_table)

    story.append(Spacer(1, 15))
        # ==================================================
    # EXECUTIVE SUMMARY
    # ==================================================

    story.append(
        Paragraph(
            "<b>EXECUTIVE SUMMARY</b>",
            section_style
        )
    )

    status = prediction["prediction"]
    risk = prediction["risk"]

    status_color = (
        colors.red
        if status == "Anomaly"
        else colors.green
    )

    summary_table = Table(
        [
            [
                "Overall Status",
                status
            ],
            [
                "Risk Level",
                risk
            ],
            [
                "Detection Engine",
                "Hybrid AI (Isolation Forest + Business Rules)"
            ]
        ],
        colWidths=[170, 350]
    )

    summary_table.setStyle(TableStyle([

        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#D9EAF7")),

        ("BACKGROUND", (1, 0), (1, -1), colors.whitesmoke),

        ("TEXTCOLOR", (1, 0), (1, 0), status_color),

        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),

        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),

        ("FONTNAME", (1, 0), (1, 0), "Helvetica-Bold"),

        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),

        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),

        ("TOPPADDING", (0, 0), (-1, -1), 8)

    ]))

    story.append(summary_table)

    story.append(Spacer(1, 12))

    # ==================================================
    # EMPLOYEE INFORMATION
    # ==================================================

    story.append(
        Paragraph(
            "<b>EMPLOYEE INFORMATION</b>",
            section_style
        )
    )

    employee_table = Table(
        [
            ["Employee ID", employee.employee_id],
            ["Employee Name", employee.full_name],
            ["Email Address", employee.email],
            ["Department", employee.department],
            ["Role", employee.role]
        ],
        colWidths=[170, 350]
    )

    employee_table.setStyle(TableStyle([

        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EDF5FC")),

        ("BACKGROUND", (1, 0), (1, -1), colors.white),

        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),

        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),

        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),

        ("TOPPADDING", (0, 0), (-1, -1), 8)

    ]))

    story.append(employee_table)

    story.append(Spacer(1, 12))

    # ==================================================
    # BEHAVIOUR ANALYSIS
    # ==================================================

    story.append(
        Paragraph(
            "<b>BEHAVIOUR ANALYSIS</b>",
            section_style
        )
    )

    behaviour_table = Table(
        [

            [
                "Behaviour Metric",
                "Observed Value"
            ],

            [
                "Average Failed Logins",
                str(baseline.avg_failed_logins)
            ],

            [
                "Average Files Downloaded",
                str(baseline.avg_files_downloaded)
            ],

            [
                "Average Emails Sent",
                str(baseline.avg_emails_sent)
            ],

            [
                "Average Login Hour",
                str(baseline.avg_login_hour)
            ],

            [
                "USB Usage Rate",
                f"{baseline.usb_usage_rate}%"
            ],

            [
                "After Hours Activity",
                f"{baseline.after_hours_rate}%"
            ]

        ],

        colWidths=[260, 260]

    )

    behaviour_table.setStyle(TableStyle([

        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B5394")),

        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),

        ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),

        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),

        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),

        ("ALIGN", (1, 1), (1, -1), "CENTER"),

        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),

        ("TOPPADDING", (0, 0), (-1, -1), 8)

    ]))

    story.append(behaviour_table)

    story.append(Spacer(1, 15))
        # ==================================================
    # AI PREDICTION
    # ==================================================

    story.append(
        Paragraph(
            "<b>AI PREDICTION</b>",
            section_style
        )
    )

    prediction_color = (
        colors.HexColor("#C62828")
        if prediction["prediction"] == "Anomaly"
        else colors.HexColor("#2E7D32")
    )

    prediction_table = Table(
        [
            ["Prediction", prediction["prediction"]],
            ["Risk Level", prediction["risk"]],
            ["Detection Method", "Isolation Forest + Business Rules"]
        ],
        colWidths=[170, 350]
    )

    prediction_table.setStyle(TableStyle([

        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#D9EAF7")),

        ("BACKGROUND", (1, 0), (1, -1), colors.white),

        ("TEXTCOLOR", (1, 0), (1, 1), prediction_color),

        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),

        ("FONTNAME", (1, 0), (1, 1), "Helvetica-Bold"),

        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),

        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),

        ("TOPPADDING", (0, 0), (-1, -1), 8)

    ]))

    story.append(prediction_table)

    story.append(Spacer(1, 12))

    # ==================================================
    # RISK FACTORS
    # ==================================================

    story.append(
        Paragraph(
            "<b>RISK FACTORS</b>",
            section_style
        )
    )

    risks = []

    if baseline.avg_failed_logins >= 8:
        risks.append("• Excessive Failed Login Attempts")

    if baseline.avg_files_downloaded >= 400:
        risks.append("• High File Download Activity")

    if baseline.avg_emails_sent >= 80:
        risks.append("• Unusual Email Activity")

    if baseline.usb_usage_rate >= 80:
        risks.append("• Frequent USB Usage")

    if baseline.after_hours_rate >= 80:
        risks.append("• High After-Hours Activity")

    if not risks:
        risks.append("• No suspicious behaviour detected.")
        risks.append("• Employee behaviour is within baseline.")
        risks.append("• Continue routine monitoring.")

    for risk in risks:
        story.append(
            Paragraph(risk, normal_style)
        )

    story.append(Spacer(1, 12))

    # ==================================================
    # RECOMMENDATIONS
    # ==================================================

    story.append(
        Paragraph(
            "<b>RECOMMENDATIONS</b>",
            section_style
        )
    )

    if prediction["prediction"] == "Anomaly":

        recommendations = [

            "• Investigate login history immediately.",

            "• Review downloaded files for sensitive information.",

            "• Audit USB device activities.",

            "• Verify unusual email communication.",

            "• Escalate the incident to the Security Operations Center (SOC)."

        ]

    else:

        recommendations = [

            "• Employee behaviour appears normal.",

            "• Continue periodic monitoring.",

            "• No immediate action is required."

        ]

    for rec in recommendations:
        story.append(
            Paragraph(rec, normal_style)
        )

    story.append(Spacer(1, 15))

    # ==================================================
    # FOOTER
    # ==================================================

    footer_table = Table(
        [
            [
                Paragraph(
                    "<b>Generated by AI Insider Threat Behavioral Intelligence System</b>",
                    footer_style
                )
            ],
            [
                Paragraph(
                    "CONFIDENTIAL • For Internal Security Use Only",
                    footer_style
                )
            ]
        ],
        colWidths=[520]
    )

    footer_table.setStyle(TableStyle([

        ("LINEABOVE", (0, 0), (-1, 0), 0.5, colors.grey),

        ("TOPPADDING", (0, 0), (-1, -1), 10),

        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),

        ("ALIGN", (0, 0), (-1, -1), "CENTER")

    ]))

    story.append(footer_table)

    # ==================================================
    # BUILD PDF
    # ==================================================

    doc.build(story)

    return filepath