/**
 * ITBIS Dashboard Module
 * Dynamically queries backend API endpoints to display real dataset statistics,
 * paginated and sortable logs, and interactive analytics charts.
 */

const ROLE_LABELS = {
    security_analyst: 'Security Analyst',
    soc_engineer: 'SOC Engineer',
    security_manager: 'Security Manager',
    administrator: 'Administrator',
};

const ROLE_NAV_ITEMS = {
    security_analyst: [
        { icon: '📊', label: 'Dashboard', href: '/dashboard' },
        { icon: '📋', label: 'Activity Logs', href: '/logs' },
        { icon: '👤', label: 'My Profile', href: '/profile' },
    ],
    soc_engineer: [
        { icon: '📊', label: 'Dashboard', href: '/dashboard' },
        { icon: '📋', label: 'Activity Logs', href: '/logs' },
        { icon: '👤', label: 'My Profile', href: '/profile' },
    ],
    security_manager: [
        { icon: '📊', label: 'Dashboard', href: '/dashboard' },
        { icon: '📋', label: 'Activity Logs', href: '/logs' },
        { icon: '👤', label: 'My Profile', href: '/profile' },
    ],
    administrator: [
        { icon: '📊', label: 'Dashboard', href: '/dashboard' },
        { icon: '📋', label: 'Activity Logs', href: '/logs' },
        { icon: '👥', label: 'User Management', href: '/admin/users' },
        { icon: '👤', label: 'My Profile', href: '/profile' },
    ],
};

// --- Dashboard State variables ---
let currentPage = 1;
let logLimit = 15;
let currentSearch = '';
let currentCategory = null;
let currentSortColumn = 'timestamp';
let currentSortDirection = 'desc';
let allLoadedLogs = []; // Stores current queries for export

async function initDashboard() {
    if (!requireAuth()) return;

    try {
        const res = await apiFetch('/api/users/me');
        if (!res.ok) { logout(); return; }

        const user = await res.json();
        renderSidebar(user);
        renderHeader(user);

        // Load dashboard stats & visual charts
        await loadStats();
        await loadCharts();
        await loadLogs();
    } catch (err) {
        showToast('Error initializing dashboard: ' + err.message, 'error');
    }
}

function renderSidebar(user) {
    const navContainer = document.getElementById('sidebar-nav');
    const userNameEl = document.getElementById('sidebar-user-name');
    const userRoleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-avatar');

    const items = ROLE_NAV_ITEMS[user.role] || ROLE_NAV_ITEMS.security_analyst;
    const currentPath = window.location.pathname;

    navContainer.innerHTML = `
        <div class="space-y-1">
            <div class="nav-section-label text-slate-400">Navigation</div>
            ${items.map(item => `
                <a href="${item.href}" class="nav-item flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${currentPath === item.href ? 'active bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}">
                    <span>${item.icon}</span>
                    <span>${item.label}</span>
                </a>
            `).join('')}
        </div>
    `;

    userNameEl.textContent = user.full_name;
    userRoleEl.textContent = ROLE_LABELS[user.role] || user.role;

    const initials = user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    if (user.profile_image) {
        avatarEl.innerHTML = `<img src="${user.profile_image}" alt="${user.full_name}" class="w-full h-full object-cover">`;
    } else {
        avatarEl.textContent = initials;
    }
}

function renderHeader(user) {
    const headerTitle = document.getElementById('header-title');
    const headerSubtitle = document.getElementById('header-subtitle');

    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';

    headerTitle.textContent = `${greeting}, ${user.full_name.split(' ')[0]}`;
    headerSubtitle.textContent = `Monitored Unit: ${user.department || 'All Departments'} • Role: ${ROLE_LABELS[user.role] || user.role}`;
}

// --- Load Summary Stats ---
async function loadStats() {
    try {
        const res = await apiFetch('/api/dashboard/stats');
        if (!res.ok) throw new Error('Failed to load stats');
        const stats = await res.json();

        document.getElementById('stat-monitored').textContent = stats.total_employees;
        document.getElementById('stat-high-risk').textContent = stats.high_risk_employees;
        document.getElementById('stat-alerts').textContent = stats.active_alerts;
        document.getElementById('stat-logs').textContent = Number(stats.total_logs).toLocaleString();
    } catch (err) {
        console.error(err);
    }
}

// --- Load Visual Analytics &suspects ---
let categoryChartObj = null;

async function loadCharts() {
    try {
        const res = await apiFetch('/api/dashboard/charts');
        if (!res.ok) throw new Error('Failed to load chart metrics');
        const metrics = await res.json();

        // 1. Populate top risk suspects table
        const suspectsBody = document.getElementById('risk-users-body');
        if (metrics.risk_users.length === 0) {
            suspectsBody.innerHTML = `<tr><td colspan="5" class="py-3 text-center text-slate-400">No risk suspects found</td></tr>`;
        } else {
            suspectsBody.innerHTML = metrics.risk_users.map(u => {
                let badgeClass = 'bg-amber-50 text-amber-600 border border-amber-200';
                let statusText = 'Suspicious';
                if (u.risk_score >= 85) {
                    badgeClass = 'bg-red-50 text-red-600 border border-red-200';
                    statusText = 'Critical';
                }
                return `
                    <tr class="hover:bg-slate-50 border-b border-slate-100">
                        <td class="py-2.5 px-3 font-semibold text-slate-800">EMP-${String(u.employee_id).padStart(4, '0')}</td>
                        <td class="py-2.5 px-3 font-medium">${u.name}</td>
                        <td class="py-2.5 px-3 text-slate-400">${u.department || 'Research'}</td>
                        <td class="py-2.5 px-3 text-right font-bold text-slate-800">${u.risk_score}</td>
                        <td class="py-2.5 px-3 text-center">
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}">
                                ${statusText}
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // 2. Initialize or Update Chart.js doughnut chart
        const ctx = document.getElementById('categoryChart').getContext('2d');
        if (categoryChartObj) {
            categoryChartObj.destroy();
        }

        categoryChartObj = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: metrics.categories.labels,
                datasets: [{
                    data: metrics.categories.data,
                    backgroundColor: [
                        '#6366f1', // Indigo
                        '#0ea5e9', // Sky Blue
                        '#10b981', // Emerald Green
                        '#f59e0b', // Amber Orange
                        '#64748b'  // Slate Gray
                    ],
                    borderWidth: 1.5,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 8,
                            padding: 10,
                            font: { size: 9, family: 'Inter' }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    } catch (err) {
        console.error(err);
    }
}

// --- Load & Render Paginated Logs ---
async function loadLogs() {
    const tableBody = document.getElementById('logs-table-body');
    const paginationStatus = document.getElementById('pagination-status');

    let url = `/api/dashboard/logs?page=${currentPage}&limit=${logLimit}`;
    if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
    if (currentCategory) url += `&category=${encodeURIComponent(currentCategory)}`;

    try {
        const res = await apiFetch(url);
        if (!res.ok) throw new Error('Failed to load activity logs');
        const responseData = await res.json();

        allLoadedLogs = responseData.data;

        // Perform sorting in client-side
        sortLogs(allLoadedLogs);

        renderLogsTable(allLoadedLogs);

        // Update pagination buttons
        document.getElementById('btn-prev').disabled = currentPage === 1;
        // If loaded count is less than page limit, disable next
        document.getElementById('btn-next').disabled = allLoadedLogs.length < logLimit;

        paginationStatus.textContent = `Showing page ${currentPage}`;
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-red-500 font-semibold">${err.message}</td></tr>`;
    }
}

function renderLogsTable(logs) {
    const tableBody = document.getElementById('logs-table-body');
    if (logs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-slate-400 font-semibold">No activity logs match the criteria</td></tr>`;
        return;
    }

    const typeIcons = {
        Logon: '🔑',
        Device: '💾',
        File: '📄',
        Email: '✉️',
        Web: '🌐'
    };

    const typeColors = {
        Logon: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        Device: 'text-amber-600 bg-amber-50 border-amber-100',
        File: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        Email: 'text-sky-600 bg-sky-50 border-sky-100',
        Web: 'text-slate-600 bg-slate-100 border-slate-200'
    };

    tableBody.innerHTML = logs.map(log => `
        <tr class="hover:bg-slate-50/50 border-b border-slate-100">
            <td class="py-3 px-4 font-mono font-medium text-slate-400">${new Date(log.timestamp).toLocaleString()}</td>
            <td class="py-3 px-4 font-semibold text-slate-800">EMP-${String(log.employee_id).padStart(4, '0')}</td>
            <td class="py-3 px-4 font-mono">${log.pc}</td>
            <td class="py-3 px-4">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${typeColors[log.type] || 'text-slate-600 bg-slate-50'}">
                    <span>${typeIcons[log.type] || '📝'}</span>
                    <span>${log.type}</span>
                </span>
            </td>
            <td class="py-3 px-4 font-semibold">${log.activity}</td>
            <td class="py-3 px-4 text-slate-500 max-w-xs truncate" title="${log.details}">${log.details}</td>
        </tr>
    `).join('');
}

// --- Category Filtering ---
function filterCategory(category) {
    currentCategory = category;
    currentPage = 1;

    // Toggle button active states
    const btnIds = ['btn-all', 'btn-logon', 'btn-device', 'btn-file', 'btn-email', 'btn-http'];
    const activeId = category ? `btn-${category}` : 'btn-all';

    btnIds.forEach(id => {
        const btn = document.getElementById(id);
        if (id === activeId) {
            btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white shadow-sm border border-indigo-600 transition-all";
        } else {
            btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all";
        }
    });

    loadLogs();
}

// --- Debounced Search ---
let searchDebounceTimeout = null;
function debounceSearch(val) {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
        currentSearch = val.trim();
        currentPage = 1;
        loadLogs();
    }, 300);
}

// --- Pagination ---
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadLogs();
    }
}

function nextPage() {
    currentPage++;
    loadLogs();
}

// --- Sorting ---
function sortTable(column) {
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'desc'; // Default to newest/highest first
    }

    // Update UI headers
    const cols = ['timestamp', 'employee_id', 'pc'];
    cols.forEach(col => {
        const el = document.getElementById(`sort-icon-${col}`);
        if (col === currentSortColumn) {
            el.textContent = currentSortDirection === 'asc' ? '▲' : '▼';
            el.className = 'text-indigo-600 font-bold ml-1';
        } else {
            el.textContent = '↕';
            el.className = 'text-slate-300 ml-1';
        }
    });

    sortLogs(allLoadedLogs);
    renderLogsTable(allLoadedLogs);
}

function sortLogs(logs) {
    logs.sort((a, b) => {
        let valA = a[currentSortColumn];
        let valB = b[currentSortColumn];

        if (currentSortColumn === 'timestamp') {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

// --- Export CSV & JSON ---
function exportData(format) {
    if (allLoadedLogs.length === 0) {
        showToast('No log data available to export.', 'error');
        return;
    }

    let fileContent = '';
    let mimeType = '';
    let fileName = `itbis_threat_logs_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
        const headers = ['Timestamp', 'Employee ID', 'Host PC', 'Event Type', 'Action', 'Details'];
        const csvRows = [headers.join(',')];

        allLoadedLogs.forEach(log => {
            const row = [
                `"${new Date(log.timestamp).toLocaleString()}"`,
                `"EMP-${log.employee_id}"`,
                `"${log.pc}"`,
                `"${log.type}"`,
                `"${log.activity}"`,
                `"${log.details.replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        fileContent = csvRows.join('\n');
        mimeType = 'text/csv;charset=utf-8;';
        fileName += '.csv';
    } else if (format === 'json') {
        fileContent = JSON.stringify(allLoadedLogs, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        fileName += '.json';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Logs successfully exported as ${format.toUpperCase()}`, 'success');
    }
}

// --- Week 3 & 4 Tab Navigation ---
function switchTab(tabName) {
    const tabs = ['overview', 'anomalies', 'baselines', 'reports'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        const pane = document.getElementById(`pane-${t}`);
        if (t === tabName) {
            btn.className = "px-5 py-3 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 transition-all flex items-center gap-2";
            pane.classList.remove('hidden');
        } else {
            btn.className = "px-5 py-3 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all flex items-center gap-2";
            pane.classList.add('hidden');
        }
    });

    if (tabName === 'anomalies') {
        anomalyPage = 1;
        loadAnomalies();
    } else if (tabName === 'reports') {
        loadReports();
    } else if (tabName === 'overview') {
        loadStats();
        loadCharts();
        loadLogs();
    }
}

// --- Anomaly Alerts pagination & search variables ---
let anomalyPage = 1;
let anomalyLimit = 15;
let currentAnomalySearch = '';
let baselineChartObj = null;

async function loadAnomalies() {
    const tableBody = document.getElementById('anomalies-table-body');
    const paginationStatus = document.getElementById('anomaly-pagination-status');
    const badgeAlertsCount = document.getElementById('badge-alerts-count');

    const severity = document.getElementById('filter-severity').value;
    const category = document.getElementById('filter-category').value;
    const status = document.getElementById('filter-status').value;

    let url = `/api/dashboard/anomalies?page=${anomalyPage}&limit=${anomalyLimit}`;
    if (severity) url += `&severity=${encodeURIComponent(severity)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (currentAnomalySearch) url += `&search=${encodeURIComponent(currentAnomalySearch)}`;

    try {
        const res = await apiFetch(url);
        if (!res.ok) throw new Error('Failed to load anomalies');
        const data = await res.json();

        // Update badge alert count
        badgeAlertsCount.textContent = data.total_records;

        if (data.data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400 font-medium">No behavioral anomalies match the criteria.</td></tr>`;
            return;
        }

        const severityColors = {
            Critical: 'bg-red-100 text-red-700 border-red-200',
            High: 'bg-orange-100 text-orange-700 border-orange-200',
            Medium: 'bg-amber-100 text-amber-700 border-amber-200',
            Low: 'bg-blue-100 text-blue-700 border-blue-200',
            Informational: 'bg-slate-100 text-slate-700 border-slate-200'
        };

        tableBody.innerHTML = data.data.map(anom => `
            <tr class="hover:bg-slate-50/50 border-b border-slate-100">
                <td class="py-3 px-4 font-mono font-medium text-slate-400">${new Date(anom.timestamp).toLocaleString()}</td>
                <td class="py-3 px-4 font-semibold text-slate-800">EMP-${anom.employee_id}</td>
                <td class="py-3 px-4 font-mono">${anom.pc || 'N/A'}</td>
                <td class="py-3 px-4 font-semibold">${anom.category}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${severityColors[anom.severity] || 'bg-slate-100 text-slate-700'}">
                        ${anom.severity}
                    </span>
                </td>
                <td class="py-3 px-4 font-medium text-slate-600">${anom.description}</td>
                <td class="py-3 px-4">
                    <select onchange="updateAnomalyStatus(${anom.id}, this.value)" class="px-2 py-1 text-[11px] border border-slate-200 rounded bg-white text-slate-600 font-semibold focus:outline-none">
                        <option value="Open" ${anom.status === 'Open' ? 'selected' : ''}>Open</option>
                        <option value="Under Investigation" ${anom.status === 'Under Investigation' ? 'selected' : ''}>Investigating</option>
                        <option value="Resolved" ${anom.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Dismissed" ${anom.status === 'Dismissed' ? 'selected' : ''}>Dismissed</option>
                    </select>
                </td>
            </tr>
        `).join('');

        document.getElementById('btn-anom-prev').disabled = anomalyPage === 1;
        document.getElementById('btn-anom-next').disabled = data.data.length < anomalyLimit;
        paginationStatus.textContent = `Showing page ${anomalyPage}`;
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-red-500 font-semibold">${err.message}</td></tr>`;
    }
}

async function updateAnomalyStatus(anomalyId, newStatus) {
    try {
        const res = await apiFetch(`/api/dashboard/anomalies/${anomalyId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error('Failed to update status');
        showToast('Alert status successfully updated', 'success');
        
        // Refresh alert counts
        const statsRes = await apiFetch('/api/dashboard/anomalies?limit=1');
        if (statsRes.ok) {
            const data = await statsRes.json();
            document.getElementById('badge-alerts-count').textContent = data.total_records;
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function prevAnomalyPage() {
    if (anomalyPage > 1) {
        anomalyPage--;
        loadAnomalies();
    }
}

function nextAnomalyPage() {
    anomalyPage++;
    loadAnomalies();
}

let anomalySearchDebounce = null;
function debounceAnomalySearch(val) {
    clearTimeout(anomalySearchDebounce);
    anomalySearchDebounce = setTimeout(() => {
        currentAnomalySearch = val.trim();
        anomalyPage = 1;
        loadAnomalies();
    }, 300);
}

// --- Behavioral Baselines Compare ---
async function fetchEmployeeBaseline() {
    const searchVal = document.getElementById('baseline-emp-search').value.trim();
    if (!searchVal) {
        showToast('Please enter an employee ID.', 'error');
        return;
    }
    const empId = searchVal.startsWith('EMP-') ? searchVal.substring(4) : searchVal;

    try {
        const res = await apiFetch(`/api/dashboard/baselines/${empId}`);
        if (!res.ok) throw new Error('Employee not found or profiling error');
        const data = await res.json();

        document.getElementById('baseline-profile-container').classList.remove('hidden');
        document.getElementById('baseline-name').textContent = data.name;
        document.getElementById('baseline-meta').textContent = `EMP-${data.employee_id} • Department: ${data.department || 'Research'}`;
        document.getElementById('baseline-risk').textContent = data.risk_score;

        // Populate table metrics
        const metricsBody = document.getElementById('baseline-metrics-body');
        const rows = [
            { label: 'Daily Logon Events', base: data.baseline.avg_daily_logons.toFixed(2), actual: data.actual.total_logons },
            { label: 'After-Hours Logon Ratio', base: (data.baseline.after_hours_logon_ratio * 100).toFixed(1) + '%', actual: '-' },
            { label: 'Weekend Logon Ratio', base: (data.baseline.weekend_logon_ratio * 100).toFixed(1) + '%', actual: '-' },
            { label: 'Daily USB Connections', base: data.baseline.avg_daily_usb_connects.toFixed(2), actual: data.actual.total_usb_connects },
            { label: 'Daily File Accesses', base: data.baseline.avg_daily_file_accesses.toFixed(2), actual: data.actual.total_file_accesses },
            { label: 'Daily Emails Sent', base: data.baseline.avg_daily_emails_sent.toFixed(2), actual: data.actual.total_emails_sent },
            { label: 'Daily Web Browses', base: data.baseline.avg_daily_web_browses.toFixed(2), actual: data.actual.total_web_browses }
        ];

        metricsBody.innerHTML = rows.map(r => `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="py-2.5 px-4 text-slate-800 font-semibold">${r.label}</td>
                <td class="py-2.5 px-4 text-center text-indigo-600 font-bold">${r.base}</td>
                <td class="py-2.5 px-4 text-center text-slate-900 font-bold">${r.actual}</td>
            </tr>
        `).join('');

        // Render comparative Chart
        const ctx = document.getElementById('baselineChart').getContext('2d');
        if (baselineChartObj) {
            baselineChartObj.destroy();
        }

        // We compare daily averages (baseline) with total activities (scaled to approximate daily values if needed, but simple bar plot works)
        baselineChartObj = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Logons', 'USB Connects', 'File Access', 'Emails Sent', 'Web Browses'],
                datasets: [
                    {
                        label: 'Baseline Rate (Daily Avg)',
                        data: [
                            data.baseline.avg_daily_logons,
                            data.baseline.avg_daily_usb_connects,
                            data.baseline.avg_daily_file_accesses,
                            data.baseline.avg_daily_emails_sent,
                            data.baseline.avg_daily_web_browses
                        ],
                        backgroundColor: 'rgba(99, 102, 241, 0.65)',
                        borderColor: '#6366f1',
                        borderWidth: 1.5
                    },
                    {
                        label: 'Actual Activity Count',
                        data: [
                            data.actual.total_logons,
                            data.actual.total_usb_connects,
                            data.actual.total_file_accesses,
                            data.actual.total_emails_sent,
                            data.actual.total_web_browses
                        ],
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        borderColor: '#0f172a',
                        borderWidth: 1.5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { font: { size: 9, family: 'Inter' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 9, family: 'Inter' } }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { font: { size: 9, family: 'Inter' } }
                    }
                }
            }
        });

    } catch (err) {
        showToast(err.message, 'error');
    }
}

// --- Executive Anomaly Reports ---
async function loadReports() {
    const tableBody = document.getElementById('reports-table-body');
    try {
        const res = await apiFetch('/api/dashboard/reports');
        if (!res.ok) throw new Error('Failed to load reports');
        const data = await res.json();

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-400">No reports generated yet. Run a threat scan to find anomalies.</td></tr>`;
            return;
        }

        tableBody.innerHTML = data.map(r => `
            <tr class="hover:bg-slate-50 border-b border-slate-100">
                <td class="py-3 px-3 font-semibold text-slate-800">${r.title}</td>
                <td class="py-3 px-3 text-slate-400">${new Date(r.created_at).toLocaleString()}</td>
                <td class="py-3 px-3 text-center font-bold">${r.total_anomalies_detected}</td>
                <td class="py-3 px-3 text-center text-red-600 font-bold">${r.critical_threat_count}</td>
                <td class="py-3 px-3 text-right">
                    <div class="flex justify-end gap-1.5">
                        <button onclick="downloadReport(${r.id})" class="px-2.5 py-1 bg-slate-100 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded text-[11px] font-semibold transition-all">
                            📥 JSON
                        </button>
                        <button onclick="downloadReportPDF(${r.id})" class="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 rounded text-[11px] font-bold transition-all">
                            📄 PDF
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-red-500 font-semibold">${err.message}</td></tr>`;
    }
}

async function downloadReport(reportId) {
    try {
        const res = await apiFetch(`/api/dashboard/reports/${reportId}`);
        if (!res.ok) throw new Error('Report download failed');
        const report = await res.json();

        const fileContent = JSON.stringify(report, null, 2);
        const blob = new Blob([fileContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const fileName = `itbis_threat_report_id_${reportId}.json`;
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Threat report successfully downloaded!', 'success');
        }
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function downloadReportPDF(reportId) {
    try {
        const res = await apiFetch(`/api/dashboard/reports/${reportId}`);
        if (!res.ok) throw new Error('Report download failed');
        const report = await res.json();
        
        let reportData = {};
        if (typeof report.data === 'string') {
            reportData = JSON.parse(report.data);
        } else {
            reportData = report.data || {};
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 1. Header Banner
        doc.setFillColor(79, 70, 229); // Indigo background
        doc.rect(0, 0, 210, 38, 'F');

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text("ITBIS EXECUTIVE THREAT REPORT", 14, 24);

        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(224, 231, 255); // Indigo-100
        doc.text("Insider Threat Behavioral Intelligence System", 14, 31);

        // 2. Report Details
        let currentY = 48;
        doc.setFontSize(10);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text("Report Title:", 14, currentY);
        doc.setFont("Helvetica", "normal");
        doc.text(report.title || "Executive Report", 45, currentY);

        currentY += 6;
        doc.setFont("Helvetica", "bold");
        doc.text("Generated At:", 14, currentY);
        doc.setFont("Helvetica", "normal");
        doc.text(new Date(report.created_at).toLocaleString(), 45, currentY);

        currentY += 6;
        doc.setFont("Helvetica", "bold");
        doc.text("Total Anomalies:", 14, currentY);
        doc.setFont("Helvetica", "normal");
        doc.text(String(report.total_anomalies_detected), 45, currentY);

        currentY += 8;
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.line(14, currentY, 196, currentY);
        currentY += 8;

        // 3. Executive Summary
        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Executive Summary", 14, currentY);
        currentY += 6;

        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(51, 65, 85); // slate-700
        const splitSummary = doc.splitTextToSize(report.summary || "No summary statistics generated.", 182);
        doc.text(splitSummary, 14, currentY);
        currentY += (splitSummary.length * 5) + 10;

        // 4. Severity Breakdown Table
        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Threat Severity Breakdown", 14, currentY);
        currentY += 4;

        const sevData = reportData.severity_breakdown || {};
        doc.autoTable({
            startY: currentY,
            head: [['Severity Level', 'Anomaly Count']],
            body: [
                ['Critical', sevData.Critical || 0],
                ['High', sevData.High || 0],
                ['Medium', sevData.Medium || 0],
                ['Low', sevData.Low || 0]
            ],
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] },
            margin: { left: 14, right: 14 }
        });
        currentY = doc.lastAutoTable.finalY + 12;

        // 5. Top Suspects Table
        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Top Risk Suspects Profile", 14, currentY);
        currentY += 4;

        const riskUsers = reportData.top_risk_users || [];
        if (riskUsers.length === 0) {
            doc.setFontSize(10);
            doc.setFont("Helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text("No high risk suspects identified in this logging duration.", 14, currentY);
            currentY += 10;
        } else {
            doc.autoTable({
                startY: currentY,
                head: [['Employee ID', 'Name', 'Department', 'Anomalies Count', 'Calculated Risk Score']],
                body: riskUsers.map(u => [
                    `EMP-${u.employee_id}`,
                    u.name,
                    u.department,
                    u.anomaly_count,
                    u.calculated_risk
                ]),
                theme: 'striped',
                headStyles: { fillColor: [15, 23, 42] },
                margin: { left: 14, right: 14 }
            });
            currentY = doc.lastAutoTable.finalY + 12;
        }

        // 6. Category Breakdown Table
        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text("Anomaly Category Distribution", 14, currentY);
        currentY += 4;

        const catData = reportData.category_breakdown || {};
        const catRows = Object.entries(catData).map(([cat, count]) => [cat, count]);
        if (catRows.length === 0) {
            doc.setFontSize(10);
            doc.setFont("Helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text("No specific anomaly categories registered.", 14, currentY);
        } else {
            doc.autoTable({
                startY: currentY,
                head: [['Category Pattern', 'Events Flagged']],
                body: catRows,
                theme: 'striped',
                headStyles: { fillColor: [99, 102, 241] },
                margin: { left: 14, right: 14 }
            });
        }

        doc.save(`itbis_threat_report_${reportId}.pdf`);
        showToast('PDF report downloaded successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function triggerDetectionScan() {
    const btn = document.getElementById('btn-trigger-scan');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Scanning and computing baselines...`;

    try {
        const res = await apiFetch('/api/dashboard/run-detection', { method: 'POST' });
        if (!res.ok) throw new Error('Threat scan failed');
        const result = await res.json();

        showToast(`Scan complete! Calculated ${result.baselines_computed} baselines and detected ${result.anomalies_detected} behavioral anomalies.`, 'success');
        
        // Refresh alert badge
        const badgeAlertsCount = document.getElementById('badge-alerts-count');
        if (badgeAlertsCount) {
            badgeAlertsCount.textContent = result.anomalies_detected;
        }

        // Re-load current tab
        loadReports();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

