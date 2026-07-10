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
