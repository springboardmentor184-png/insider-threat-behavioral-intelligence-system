/**
 * ITBIS Threat Investigation Module (Module 7 & 9)
 * Handles incident case management, analyst assignment, evidence attachment, and activity timeline.
 */

let selectedIncidentId = null;

async function initInvestigation() {
    if (!requireAuth()) return;

    try {
        const res = await apiFetch('/api/users/me');
        if (!res.ok) { logout(); return; }
        const user = await res.json();

        renderSidebar(user);
        await loadIncidents();

        // Handle URL query parameters (e.g. ?employee_id=... or ?incident_id=...)
        const urlParams = new URLSearchParams(window.location.search);
        const empId = urlParams.get('employee_id');
        const incId = urlParams.get('incident_id');

        if (incId) {
            await selectCase(parseInt(incId));
        } else if (empId) {
            const cleanEmpId = empId.replace('EMP-', '').trim();
            const allCasesRes = await apiFetch('/api/investigations/');
            if (allCasesRes.ok) {
                const allCasesData = await allCasesRes.json();
                const match = allCasesData.data.find(c => c.employee_id === cleanEmpId || c.employee_id === `EMP-${cleanEmpId}`);
                if (match) {
                    await selectCase(match.id);
                } else {
                    // Auto-create investigation case for this employee if none exists
                    showToast(`Creating investigation case for target employee EMP-${cleanEmpId}...`, 'info');
                    const createRes = await apiFetch('/api/investigations/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            employee_id: cleanEmpId,
                            title: `Behavioral Threat Investigation: EMP-${cleanEmpId}`,
                            severity: 'High',
                            description: `Auto-launched investigation case for employee EMP-${cleanEmpId} from email alert report link.`
                        })
                    });
                    if (createRes.ok) {
                        const newInc = await createRes.json();
                        await loadIncidents();
                        await selectCase(newInc.id);
                    }
                }
            }
        } else {
            // Auto-select first incident case if list is not empty
            const allCasesRes = await apiFetch('/api/investigations/');
            if (allCasesRes.ok) {
                const allCasesData = await allCasesRes.json();
                if (allCasesData.data && allCasesData.data.length > 0) {
                    await selectCase(allCasesData.data[0].id);
                }
            }
        }
    } catch (err) {
        showToast('Error initializing investigation portal: ' + err.message, 'error');
    }
}

async function loadIncidents() {
    const container = document.getElementById('incidents-list-container');
    const badge = document.getElementById('incidents-count-badge');

    const status = document.getElementById('filter-inc-status').value;
    const severity = document.getElementById('filter-inc-severity').value;

    let url = '/api/investigations/?';
    if (status) url += `status=${encodeURIComponent(status)}&`;
    if (severity) url += `severity=${encodeURIComponent(severity)}&`;

    try {
        const res = await apiFetch(url);
        if (!res.ok) throw new Error('Failed to load incidents');
        const result = await res.json();

        badge.textContent = `${result.total_records} cases`;

        if (result.data.length === 0) {
            container.innerHTML = `<div class="py-8 text-center text-xs text-slate-400 font-medium">No investigation cases match criteria.</div>`;
            return;
        }

        const sevColors = {
            Critical: 'bg-red-100 text-red-700 border-red-200',
            High: 'bg-orange-100 text-orange-700 border-orange-200',
            Medium: 'bg-amber-100 text-amber-700 border-amber-200',
            Low: 'bg-blue-100 text-blue-700 border-blue-200'
        };

        container.innerHTML = result.data.map(inc => `
            <div onclick="selectCase(${inc.id})" class="p-3 border rounded-xl hover:bg-slate-50 cursor-pointer transition-all ${selectedIncidentId === inc.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100'}">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[11px] font-mono font-bold text-indigo-600">${inc.incident_number}</span>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold border ${sevColors[inc.severity] || 'bg-slate-100'}">${inc.severity}</span>
                </div>
                <h4 class="text-xs font-bold text-slate-800 line-clamp-1">${inc.title}</h4>
                <div class="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span>EMP-${inc.employee_id}</span>
                    <span class="px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">${inc.status}</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `<div class="py-4 text-center text-xs text-red-500 font-semibold">${err.message}</div>`;
    }
}

let currentTargetEmployeeId = null;

async function selectCase(incidentId) {
    selectedIncidentId = incidentId;
    await loadIncidents(); // re-render list with active highlight

    const noCasePane = document.getElementById('no-case-selected');
    const casePane = document.getElementById('case-details-pane');

    try {
        const res = await apiFetch(`/api/investigations/${incidentId}`);
        if (!res.ok) throw new Error('Failed to load incident details');
        const inc = await res.json();

        currentTargetEmployeeId = String(inc.employee_id).replace('EMP-', '').trim();

        noCasePane.classList.add('hidden');
        casePane.classList.remove('hidden');

        document.getElementById('case-inc-number').textContent = inc.incident_number;
        document.getElementById('case-severity-badge').textContent = inc.severity;
        document.getElementById('case-title').textContent = inc.title;
        document.getElementById('case-meta').textContent = `Assigned to: ${inc.assigned_analyst} • Target User: EMP-${currentTargetEmployeeId}`;
        document.getElementById('case-status-select').value = inc.status;
        document.getElementById('case-description-text').textContent = inc.description;

        // Load all detected anomalies for this employee
        await loadDetectedAnomalies(currentTargetEmployeeId);

        // Load unified activity timeline for target user
        await loadActivityTimeline(currentTargetEmployeeId);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function loadDetectedAnomalies(employeeId) {
    const listContainer = document.getElementById('case-anomalies-list');
    const countBadge = document.getElementById('detected-anomalies-count');
    if (!listContainer) return;

    try {
        const cleanId = String(employeeId).replace('EMP-', '').trim();
        const res = await apiFetch(`/api/dashboard/anomalies?search=${cleanId}&limit=100`);
        if (!res.ok) throw new Error('Failed to load anomalies');
        const data = await res.json();
        
        const filtered = data.data.filter(a => String(a.employee_id).replace('EMP-', '').trim() === cleanId);
        countBadge.textContent = `${filtered.length} anomalies detected`;

        if (filtered.length === 0) {
            listContainer.innerHTML = `<div class="py-4 text-center text-xs text-slate-400 font-medium">No active anomalies flagged for employee EMP-${cleanId}.</div>`;
            return;
        }

        const sevBadges = {
            Critical: 'bg-red-50 text-red-700 border-red-200',
            High: 'bg-orange-50 text-orange-700 border-orange-200',
            Medium: 'bg-amber-50 text-amber-700 border-amber-200',
            Low: 'bg-blue-50 text-blue-700 border-blue-200'
        };

        listContainer.innerHTML = filtered.map(anom => `
            <div class="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs space-y-1 hover:bg-slate-100/50 transition-all shadow-2xs">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-sm">⚠️</span>
                        <span class="font-extrabold text-slate-900">${anom.category}</span>
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${sevBadges[anom.severity] || 'bg-slate-100'}">${anom.severity}</span>
                    </div>
                    <span class="font-mono text-[10px] text-slate-400 font-bold">${new Date(anom.timestamp).toLocaleString()}</span>
                </div>
                <p class="text-slate-600 font-medium leading-relaxed">${anom.description}</p>
                <div class="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                    <span>Host PC: <strong class="text-slate-700 font-mono">${anom.pc || 'N/A'}</strong></span>
                    <span>Status: <strong class="text-indigo-600 font-bold">${anom.status}</strong></span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        listContainer.innerHTML = `<div class="py-3 text-center text-xs text-red-500 font-semibold">${err.message}</div>`;
    }
}

async function downloadCurrentEmployeeActivitiesCSV() {
    if (!currentTargetEmployeeId) {
        showToast('No employee selected for export.', 'error');
        return;
    }
    try {
        showToast(`Exporting activity logs CSV for EMP-${currentTargetEmployeeId}...`, 'info');
        const url = `/api/reports/export/employee-activities-csv/${currentTargetEmployeeId}`;
        const res = await apiFetch(url);
        if (!res.ok) throw new Error('CSV export failed');
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `itbis_employee_${currentTargetEmployeeId}_activities.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        showToast(`Downloaded activities CSV for EMP-${currentTargetEmployeeId}`, 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function downloadCurrentEmployeePDFReport() {
    if (!currentTargetEmployeeId) {
        showToast('No employee selected for report generation.', 'error');
        return;
    }
    try {
        showToast(`Generating Threat PDF Report for EMP-${currentTargetEmployeeId}...`, 'info');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Fetch baseline & anomalies for employee
        const baseRes = await apiFetch(`/api/dashboard/baselines/${currentTargetEmployeeId}`);
        let empData = { name: `EMP-${currentTargetEmployeeId}`, risk_score: 'N/A', department: 'Operations' };
        if (baseRes.ok) {
            empData = await baseRes.json();
        }

        // Header
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, 210, 25, 'F');
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont("Helvetica", "bold");
        doc.text("ITBIS — Individual Employee Threat Report", 14, 16);

        // Subhead
        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Target Employee: ${empData.name} (EMP-${currentTargetEmployeeId}) | Department: ${empData.department || 'N/A'}`, 14, 34);
        doc.text(`Calculated Composite Risk Score: ${empData.risk_score || 'N/A'} / 100`, 14, 40);
        doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 46);

        // Fetch anomalies
        const anomRes = await apiFetch(`/api/dashboard/anomalies?search=${currentTargetEmployeeId}&limit=100`);
        let anomaliesList = [];
        if (anomRes.ok) {
            const anomData = await anomRes.json();
            anomaliesList = anomData.data.filter(a => String(a.employee_id).replace('EMP-', '').trim() === currentTargetEmployeeId);
        }

        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Flagged Behavioral Anomalies", 14, 56);

        if (anomaliesList.length === 0) {
            doc.setFontSize(10);
            doc.setFont("Helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text("No active behavioral anomalies detected for this employee.", 14, 64);
        } else {
            doc.autoTable({
                startY: 60,
                head: [['Timestamp', 'Category', 'Severity', 'Host PC', 'Description']],
                body: anomaliesList.map(a => [
                    new Date(a.timestamp).toLocaleString(),
                    a.category,
                    a.severity,
                    a.pc || 'N/A',
                    a.description
                ]),
                theme: 'striped',
                headStyles: { fillColor: [79, 70, 229] },
                margin: { left: 14, right: 14 }
            });
        }

        doc.save(`itbis_threat_report_EMP_${currentTargetEmployeeId}.pdf`);
        showToast('PDF report downloaded successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function loadActivityTimeline(employeeId) {
    const timelineContainer = document.getElementById('case-activity-timeline');
    try {
        const res = await apiFetch(`/api/investigations/timeline/${employeeId}?limit=40`);
        if (!res.ok) throw new Error('Failed to load activity timeline');
        const timeline = await res.json();

        if (timeline.length === 0) {
            timelineContainer.innerHTML = `<div class="py-4 text-center text-xs text-slate-400">No activity events found for employee EMP-${employeeId}.</div>`;
            return;
        }

        const typeBadges = {
            Logon: 'bg-blue-100 text-blue-700',
            Device: 'bg-amber-100 text-amber-700',
            File: 'bg-violet-100 text-violet-700',
            Email: 'bg-emerald-100 text-emerald-700',
            HTTP: 'bg-slate-100 text-slate-700',
            ANOMALY_ALERT: 'bg-red-100 text-red-700 font-bold border border-red-200'
        };

        timelineContainer.innerHTML = timeline.map(item => `
            <div class="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex items-start gap-3">
                <span class="px-2 py-0.5 text-[9px] rounded-full font-bold ${typeBadges[item.event_type] || 'bg-slate-100'}">${item.event_type}</span>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between text-slate-400 text-[10px] mb-0.5">
                        <span class="font-mono">${new Date(item.timestamp).toLocaleString()}</span>
                        <span>Host: ${item.pc}</span>
                    </div>
                    <p class="text-slate-700 font-medium">${item.details}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        timelineContainer.innerHTML = `<div class="py-4 text-center text-xs text-red-500 font-semibold">${err.message}</div>`;
    }
}

async function updateCaseStatus() {
    if (!selectedIncidentId) return;
    const newStatus = document.getElementById('case-status-select').value;
    try {
        const res = await apiFetch(`/api/investigations/${selectedIncidentId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error('Failed to update status');
        showToast(`Incident status updated to ${newStatus}`, 'success');
        await loadIncidents();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function submitEvidenceNote() {
    if (!selectedIncidentId) return;
    const noteInput = document.getElementById('evidence-note-input');
    const note = noteInput.value.trim();
    if (!note) {
        showToast('Please enter an evidence note.', 'error');
        return;
    }

    try {
        const res = await apiFetch(`/api/investigations/${selectedIncidentId}/evidence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: note, event_type: "Note" })
        });
        if (!res.ok) throw new Error('Failed to attach note');
        noteInput.value = '';
        showToast('Evidence note attached successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function openCreateIncidentModal() {
    document.getElementById('create-incident-modal').classList.remove('hidden');
}

function closeCreateIncidentModal() {
    document.getElementById('create-incident-modal').classList.add('hidden');
}

document.getElementById('create-incident-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const empVal = document.getElementById('inc-target-emp').value.trim();
    const empId = empVal.startsWith('EMP-') ? empVal.substring(4) : empVal;
    const title = document.getElementById('inc-title').value.trim();
    const severity = document.getElementById('inc-severity').value;
    const description = document.getElementById('inc-description').value.trim();

    try {
        const res = await apiFetch('/api/investigations/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                employee_id: empId,
                title: title,
                severity: severity,
                description: description
            })
        });
        if (!res.ok) throw new Error('Failed to create incident case');
        const inc = await res.json();
        showToast(`Investigation Case ${inc.incident_number} created successfully!`, 'success');
        closeCreateIncidentModal();
        await loadIncidents();
        selectCase(inc.id);
    } catch (err) {
        showToast(err.message, 'error');
    }
});

document.addEventListener('DOMContentLoaded', initInvestigation);
