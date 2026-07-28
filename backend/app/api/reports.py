from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from ..core.database import get_db
from ..core.security import require_roles
from ..models import models
from ..core.mongodb import activity_collection

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/pdf/{employee_id}")
async def download_pdf_report(
    employee_id: str,
    current_user: models.User = Depends(require_roles(["Admin", "Security Manager", "SOC Engineer"])),
    db: Session = Depends(get_db)
):
    # Get employee details
    employee = db.query(models.Employee).filter(models.Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get activities and build baseline
    activities = await activity_collection.find({"employee_id": employee_id}).to_list(length=1000)
    
    if not activities:
        raise HTTPException(status_code=404, detail="No activities found for this employee")
    
    # --- Build Baseline and Detect Anomalies (using TOP 5 approach) ---
    event_types = {}
    source_systems = {}
    ip_addresses = {}
    
    for act in activities:
        event = act.get("event_type", "UNKNOWN")
        event_types[event] = event_types.get(event, 0) + 1
        
        source = act.get("source_system", "UNKNOWN")
        source_systems[source] = source_systems.get(source, 0) + 1
        
        ip = act.get("ip_address", "UNKNOWN")
        ip_addresses[ip] = ip_addresses.get(ip, 0) + 1
    
    top_events = sorted(event_types.items(), key=lambda x: x[1], reverse=True)[:5]
    top_sources = sorted(source_systems.items(), key=lambda x: x[1], reverse=True)[:5]
    top_ips = sorted(ip_addresses.items(), key=lambda x: x[1], reverse=True)[:5]
    
    normal_events = [e[0] for e in top_events]
    normal_sources = [s[0] for s in top_sources]
    normal_ips = [i[0] for i in top_ips]
    
    anomalies = []
    for act in activities:
        anomaly_reasons = []
        event = act.get("event_type", "UNKNOWN")
        source = act.get("source_system", "UNKNOWN")
        ip = act.get("ip_address", "UNKNOWN")
        
        if event not in normal_events:
            anomaly_reasons.append(f"Unusual event: {event}")
        if source not in normal_sources:
            anomaly_reasons.append(f"Unusual source: {source}")
        if ip not in normal_ips:
            anomaly_reasons.append(f"Unusual IP: {ip}")
        
        if anomaly_reasons:
            anomalies.append({
                "timestamp": act.get("timestamp"),
                "event_type": event,
                "source_system": source,
                "ip_address": ip,
                "reasons": anomaly_reasons,
                "metadata": act.get("metadata", {})
            })
    
    total_activities = len(activities)
    total_anomalies = len(anomalies)
    anomaly_percentage = round((total_anomalies / total_activities) * 100, 2) if total_activities else 0
    
    risk_score = min(100, anomaly_percentage * 2)
    
    if risk_score == 0:
        risk_level = "🟢 No Risk"
    elif risk_score < 30:
        risk_level = "🟢 Low Risk"
    elif risk_score < 60:
        risk_level = "🟡 Medium Risk"
    elif risk_score < 80:
        risk_level = "🟠 High Risk"
    else:
        risk_level = "🔴 Critical Risk"
    
    # --- Generate PDF ---
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=24, alignment=TA_CENTER, spaceAfter=20)
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'], fontSize=16, spaceAfter=10)
    normal_style = styles['Normal']
    
    elements = []
    
    # Title
    elements.append(Paragraph("Insider Threat Behavioral Report", title_style))
    elements.append(Spacer(1, 0.25*inch))
    
    # Header Info
    elements.append(Paragraph(f"<b>Employee:</b> {employee.first_name} {employee.last_name}", normal_style))
    elements.append(Paragraph(f"<b>Department:</b> {employee.department}", normal_style))
    elements.append(Paragraph(f"<b>Designation:</b> {employee.designation}", normal_style))
    elements.append(Paragraph(f"<b>Report Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC", normal_style))
    elements.append(Spacer(1, 0.25*inch))
    
    # Risk Summary Table
    risk_data = [
        ["Metric", "Value"],
        ["Risk Score", f"{risk_score:.1f}%"],
        ["Risk Level", risk_level],
        ["Total Activities", str(total_activities)],
        ["Total Anomalies", str(total_anomalies)],
        ["Anomaly Percentage", f"{anomaly_percentage}%"]
    ]
    
    risk_table = Table(risk_data, colWidths=[3*inch, 2*inch])
    risk_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (1, 0), 12),
        ('BACKGROUND', (0, 1), (1, -1), colors.beige),
        ('GRID', (0, 0), (1, -1), 1, colors.black)
    ]))
    elements.append(risk_table)
    elements.append(Spacer(1, 0.25*inch))
    
    # Top Anomalies
    elements.append(Paragraph("Top Anomalies", heading_style))
    
    if anomalies:
        anomaly_data = [["#", "Event Type", "Source", "IP Address", "Reasons"]]
        for i, anomaly in enumerate(anomalies[:10], 1):
            reasons_str = ", ".join(anomaly.get("reasons", []))
            anomaly_data.append([
                str(i),
                anomaly.get("event_type", "UNKNOWN"),
                anomaly.get("source_system", "UNKNOWN"),
                anomaly.get("ip_address", "UNKNOWN"),
                reasons_str[:50] + "..." if len(reasons_str) > 50 else reasons_str
            ])
        
        anomaly_table = Table(anomaly_data, colWidths=[0.5*inch, 1.2*inch, 1.2*inch, 1.2*inch, 2*inch])
        anomaly_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        elements.append(anomaly_table)
    else:
        elements.append(Paragraph("No anomalies detected.", normal_style))
    
    elements.append(Spacer(1, 0.25*inch))
    
    # Recommendations
    elements.append(Paragraph("Recommendations", heading_style))
    if total_anomalies > 50:
        elements.append(Paragraph("🔴 High anomaly count - Investigate immediately!", normal_style))
    elif total_anomalies > 20:
        elements.append(Paragraph("🟡 Medium anomaly count - Monitor closely", normal_style))
    elif total_anomalies > 0:
        elements.append(Paragraph("🟡 Some anomalies detected - Review recent activities", normal_style))
    else:
        elements.append(Paragraph("🟢 Low anomaly count - Normal behavior", normal_style))
    
    if len(set([a.get("event_type", "") for a in anomalies])) > 5:
        elements.append(Paragraph("⚠️ Multiple unusual event types detected - Review access patterns", normal_style))
    
    # Footer
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph("This is an auto-generated report. For more details, contact the Security Operations Center.", styles['Italic']))
    
    doc.build(elements)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=threat_report_{employee.first_name}_{employee.last_name}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
        }
    )