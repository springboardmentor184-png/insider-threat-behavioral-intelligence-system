/**
 * ITBIS Reports & Export Hub Module (Module 12)
 * Handles downloading native Excel (.xlsx) workbooks and formatted PDF summaries for all 5 report categories.
 */

async function initReports() {
    if (!requireAuth()) return;

    try {
        const res = await apiFetch('/api/users/me');
        if (!res.ok) { logout(); return; }
        const user = await res.json();

        renderSidebar(user);
    } catch (err) {
        showToast('Error initializing reports hub: ' + err.message, 'error');
    }
}

async function exportExcel(category) {
    try {
        showToast(`Preparing Excel workbook for ${category.replace('_', ' ')}...`, 'info');
        const url = `/api/reports/export/excel?category=${category}`;
        const res = await apiFetch(url);
        if (!res.ok) throw new Error('Failed to generate Excel report');
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `itbis_${category}_report.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast('Excel report downloaded successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function exportPDF(category) {
    try {
        showToast(`Generating PDF report for ${category.replace('_', ' ')}...`, 'info');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 210, 35, 'F');

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text(`ITBIS ${category.toUpperCase().replace('_', ' ')} REPORT`, 14, 22);

        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(224, 231, 255);
        doc.text(`Generated: ${new Date().toLocaleString()} • Insider Threat Platform`, 14, 29);

        let currentY = 45;

        if (category === 'insider_threat' || category === 'risk_assessment') {
            const res = await apiFetch('/api/risk/scores');
            const data = await res.json();
            
            doc.autoTable({
                startY: currentY,
                head: [['Employee ID', 'Name', 'Department', 'Risk Score', 'Risk Category']],
                body: (data.data || []).map(u => [
                    `EMP-${u.employee_id}`,
                    u.name,
                    u.department || 'N/A',
                    u.risk_score,
                    u.risk_category
                ]),
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] }
            });
        } else if (category === 'investigation') {
            const res = await apiFetch('/api/investigations');
            const data = await res.json();

            doc.autoTable({
                startY: currentY,
                head: [['Case ID', 'Target EMP', 'Title', 'Severity', 'Status']],
                body: (data.data || []).map(inc => [
                    inc.incident_number,
                    `EMP-${inc.employee_id}`,
                    inc.title,
                    inc.severity,
                    inc.status
                ]),
                theme: 'striped',
                headStyles: { fillColor: [15, 23, 42] }
            });
        } else {
            const res = await apiFetch('/api/dashboard/stats');
            const data = await res.json();

            doc.autoTable({
                startY: currentY,
                head: [['System Metric', 'Value']],
                body: [
                    ['Total Monitored Employees', data.total_employees],
                    ['High Risk Suspects', data.high_risk_employees],
                    ['Active Threat Alerts', data.alerts_count],
                    ['Total System Event Logs Ingested', data.total_logs]
                ],
                theme: 'striped',
                headStyles: { fillColor: [99, 102, 241] }
            });
        }

        doc.save(`itbis_${category}_summary.pdf`);
        showToast('PDF report downloaded successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initReports);
