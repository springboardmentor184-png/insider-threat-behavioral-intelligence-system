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
        await loadPredictions();
    } catch (err) {
        showToast('Error initializing UEBA engine: ' + err.message, 'error');
    }
}

async function loadPeerComparison() {
    const searchVal = document.getElementById('ueba-emp-search').value.trim();
    if (!searchVal) {
        showToast('Please enter an employee ID.', 'error');
        return;
    }
    const empId = searchVal.startsWith('EMP-') ? searchVal.substring(4) : searchVal;

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
            if (r.dev > 50) devColor = 'text-red-600 font-bold';
            else if (r.dev < -20) devColor = 'text-emerald-600';
            return `
                <tr class="hover:bg-slate-50 border-b border-slate-100">
                    <td class="py-2.5 px-3 text-slate-800 font-semibold">${r.label}</td>
                    <td class="py-2.5 px-3 text-center text-indigo-600 font-bold">${r.emp}</td>
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
                        label: 'Employee Metric',
                        data: [
                            data.employee_metrics.avg_daily_logons,
                            data.employee_metrics.avg_daily_usb_connects,
                            data.employee_metrics.avg_daily_file_accesses,
                            data.employee_metrics.avg_daily_emails_sent,
                            data.employee_metrics.avg_daily_web_browses
                        ],
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: '#6366f1',
                        borderWidth: 1.5
                    },
                    {
                        label: 'Department Peer Avg',
                        data: [
                            data.peer_metrics.avg_daily_logons,
                            data.peer_metrics.avg_daily_usb_connects,
                            data.peer_metrics.avg_daily_file_accesses,
                            data.peer_metrics.avg_daily_emails_sent,
                            data.peer_metrics.avg_daily_web_browses
                        ],
                        backgroundColor: 'rgba(148, 163, 184, 0.5)',
                        borderColor: '#94a3b8',
                        borderWidth: 1.5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 9 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 9 } } }
                },
                plugins: { legend: { position: 'top', labels: { font: { size: 9 } } } }
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

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-slate-400">No threat risk predictions recorded.</td></tr>`;
            return;
        }

        const trajColors = {
            Increasing: 'bg-red-100 text-red-700 border-red-200',
            Stable: 'bg-amber-100 text-amber-700 border-amber-200',
            Decreasing: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };

        tableBody.innerHTML = data.map(p => `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="py-3 px-4 font-bold text-slate-800">EMP-${p.employee_id}</td>
                <td class="py-3 px-4 font-medium">${p.name}</td>
                <td class="py-3 px-4 text-slate-400">${p.department || 'General'}</td>
                <td class="py-3 px-4 text-center font-extrabold text-red-600">${p.risk_score}</td>
                <td class="py-3 px-4 text-center">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${trajColors[p.trajectory] || 'bg-slate-100'}">
                        ${p.trajectory === 'Increasing' ? '▲ ' : p.trajectory === 'Decreasing' ? '▼ ' : '▶ '}${p.trajectory}
                    </span>
                </td>
                <td class="py-3 px-4 text-slate-600 font-medium">${p.predicted_threat}</td>
            </tr>
        `).join('');
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-red-500 font-semibold">${err.message}</td></tr>`;
    }
}

document.addEventListener('DOMContentLoaded', initUEBA);
