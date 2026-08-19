/**
 * ITBIS UEBA Intelligence Engine Module (Module 8)
 * Handles peer comparison analytics, departmental averages, and threat trajectory predictions.
 */

let peerChartObj = null;

async function initUEBA() {
    if (!requireAuth()) return;

    try {
        const res = await apiFetch('/api/users/me');
        if (!res.ok) { logout(); return; }
        const user = await res.json();

        renderSidebar(user);
        const predictions = await loadPredictions();

        // Auto-load peer comparison for top suspect if available
        if (predictions && predictions.length > 0) {
            const topEmpId = predictions[0].employee_id;
            const searchInput = document.getElementById('ueba-emp-search');
            if (searchInput) searchInput.value = topEmpId;
            await loadPeerComparison(topEmpId);
        }
    } catch (err) {
        showToast('Error initializing UEBA engine: ' + err.message, 'error');
    }
}

async function loadPeerComparison(overrideEmpId = null) {
    let empId = overrideEmpId;
    if (!empId) {
        const searchVal = document.getElementById('ueba-emp-search').value.trim();
        if (!searchVal) {
            showToast('Please enter an employee ID.', 'error');
            return;
        }
        empId = searchVal.startsWith('EMP-') ? searchVal.substring(4) : searchVal;
    }

    try {
        const res = await apiFetch(`/api/ueba/peer-comparison/${empId}`);
        if (!res.ok) throw new Error('Employee not found or peer baseline error');
        const data = await res.json();

        document.getElementById('peer-results-container').classList.remove('hidden');
        document.getElementById('peer-table-title').textContent = `${data.name} (EMP-${data.employee_id}) vs. ${data.department} Department Peer Average`;

        const metricsBody = document.getElementById('peer-metrics-body');
        const rows = [
            { label: 'Daily Logon Events', emp: data.employee_metrics.avg_daily_logons, peer: data.peer_metrics.avg_daily_logons, dev: data.deviations_pct.avg_daily_logons },
            { label: 'After-Hours Logon %', emp: data.employee_metrics.after_hours_ratio_pct + '%', peer: data.peer_metrics.after_hours_ratio_pct + '%', dev: data.deviations_pct.after_hours_ratio_pct },
            { label: 'Daily USB Connections', emp: data.employee_metrics.avg_daily_usb_connects, peer: data.peer_metrics.avg_daily_usb_connects, dev: data.deviations_pct.avg_daily_usb_connects },
            { label: 'Daily File Accesses', emp: data.employee_metrics.avg_daily_file_accesses, peer: data.peer_metrics.avg_daily_file_accesses, dev: data.deviations_pct.avg_daily_file_accesses },
            { label: 'Daily Emails Sent', emp: data.employee_metrics.avg_daily_emails_sent, peer: data.peer_metrics.avg_daily_emails_sent, dev: data.deviations_pct.avg_daily_emails_sent },
            { label: 'Avg Email Size (KB)', emp: data.employee_metrics.avg_email_size_kb, peer: data.peer_metrics.avg_email_size_kb, dev: data.deviations_pct.avg_email_size_kb },
            { label: 'Daily Web Browses', emp: data.employee_metrics.avg_daily_web_browses, peer: data.peer_metrics.avg_daily_web_browses, dev: data.deviations_pct.avg_daily_web_browses }
        ];

        metricsBody.innerHTML = rows.map(r => {
            let devColor = 'text-slate-600';
            if (r.dev > 50) devColor = 'text-red-700 font-extrabold';
            else if (r.dev < -20) devColor = 'text-emerald-700 font-bold';
            return `
                <tr class="hover:bg-slate-50 border-b border-slate-100">
                    <td class="py-2.5 px-3 text-slate-800 font-semibold">${r.label}</td>
                    <td class="py-2.5 px-3 text-center text-indigo-600 font-extrabold">${r.emp}</td>
                    <td class="py-2.5 px-3 text-center text-slate-500 font-semibold">${r.peer}</td>
                    <td class="py-2.5 px-3 text-right ${devColor}">${r.dev > 0 ? '+' : ''}${r.dev}%</td>
                </tr>
            `;
        }).join('');

        // Render Chart.js comparison
        const ctx = document.getElementById('peerChart').getContext('2d');
        if (peerChartObj) peerChartObj.destroy();

        peerChartObj = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Logons', 'USB', 'File Access', 'Emails', 'Web Browses'],
                datasets: [
                    {
                        label: `${data.name} (EMP-${data.employee_id})`,
                        data: [
                            data.employee_metrics.avg_daily_logons,
                            data.employee_metrics.avg_daily_usb_connects,
                            data.employee_metrics.avg_daily_file_accesses,
                            data.employee_metrics.avg_daily_emails_sent,
                            data.employee_metrics.avg_daily_web_browses
                        ],
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: '#6366f1',
                        borderWidth: 1.5,
                        borderRadius: 6
                    },
                    {
                        label: `${data.department} Peer Average`,
                        data: [
                            data.peer_metrics.avg_daily_logons,
                            data.peer_metrics.avg_daily_usb_connects,
                            data.peer_metrics.avg_daily_file_accesses,
                            data.peer_metrics.avg_daily_emails_sent,
                            data.peer_metrics.avg_daily_web_browses
                        ],
                        backgroundColor: 'rgba(148, 163, 184, 0.6)',
                        borderColor: '#94a3b8',
                        borderWidth: 1.5,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 9, family: 'Inter' } } },
                    x: { grid: { display: false }, ticks: { font: { size: 9, family: 'Inter' } } }
                },
                plugins: { legend: { position: 'top', labels: { font: { size: 9, family: 'Inter' } } } }
            }
        });
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function loadPredictions() {
    const tableBody = document.getElementById('predictions-table-body');
    try {
        const res = await apiFetch('/api/ueba/predictions');
        if (!res.ok) throw new Error('Failed to load threat predictions');
        const data = await res.json();

        // Update top KPI cards
        const totalEl = document.getElementById('ueba-stat-total');
        const incEl = document.getElementById('ueba-stat-increasing');
        const devEl = document.getElementById('ueba-stat-deviating');
        
        if (totalEl) totalEl.textContent = data.length;
        if (incEl) incEl.textContent = data.filter(p => p.trajectory === 'Increasing').length;
        if (devEl) devEl.textContent = data.filter(p => p.risk_score >= 20 || p.trajectory !== 'Decreasing').length;

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-slate-400 font-medium">No threat risk predictions recorded.</td></tr>`;
            return;
        }

        const trajColors = {
            Increasing: 'bg-red-50 text-red-700 border-red-200',
            Stable: 'bg-amber-50 text-amber-700 border-amber-200',
            Decreasing: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };

        tableBody.innerHTML = data.map(p => `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="py-3 px-4 font-mono font-bold text-indigo-600">EMP-${p.employee_id}</td>
                <td class="py-3 px-4 font-semibold text-slate-900">${p.name}</td>
                <td class="py-3 px-4 text-slate-500 font-medium">${p.department || 'General'}</td>
                <td class="py-3 px-4 text-center font-extrabold text-red-600 text-sm">${p.risk_score}</td>
                <td class="py-3 px-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${trajColors[p.trajectory] || 'bg-slate-100'}">
                        ${p.trajectory === 'Increasing' ? '▲ ' : p.trajectory === 'Decreasing' ? '▼ ' : '▶ '}${p.trajectory}
                    </span>
                </td>
                <td class="py-3 px-4 text-slate-600 font-medium max-w-xs">${p.predicted_threat}</td>
                <td class="py-3 px-4 text-right">
                    <a href="/investigation?employee_id=${p.employee_id}" class="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-extrabold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-200/80 shadow-2xs">
                        🔍 Case
                    </a>
                </td>
            </tr>
        `).join('');
        return data;
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-red-500 font-semibold">${err.message}</td></tr>`;
        return [];
    }
}

async function downloadUEBAReportPDF() {
    try {
        showToast('Generating UEBA Threat Intelligence Report (PDF)...', 'info');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const res = await apiFetch('/api/ueba/predictions');
        if (!res.ok) throw new Error('Failed to load predictions for PDF export');
        const predictions = await res.json();

        // Header
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 25, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.text("ITBIS — Enterprise UEBA Analytics & Risk Trajectory Report", 14, 16);

        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated Date: ${new Date().toLocaleString()} | Monitored Entities: ${predictions.length}`, 14, 34);

        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Departmental Risk Velocity & Predictive Trajectories", 14, 46);

        doc.autoTable({
            startY: 50,
            head: [['Employee ID', 'Name', 'Department', 'Risk Score', '30-Day Trajectory', 'Predicted Context']],
            body: predictions.map(p => [
                `EMP-${p.employee_id}`,
                p.name,
                p.department || 'General',
                p.risk_score,
                p.trajectory,
                p.predicted_threat
            ]),
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
            margin: { left: 14, right: 14 }
        });

        doc.save(`itbis_ueba_analytics_report_${new Date().toISOString().slice(0,10)}.pdf`);
        showToast('UEBA report downloaded successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', initUEBA);
