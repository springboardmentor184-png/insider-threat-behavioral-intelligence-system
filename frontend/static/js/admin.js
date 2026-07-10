/**
 * ITBIS Admin Module
 * Manages system platform users, processes registration approvals, and controls access roles.
 */

let activeTab = 'all';
let allUsersList = [];

async function initAdmin() {
    if (!requireAuth()) return;

    // Verify administrator role from JWT claims
    const payload = getTokenPayload();
    if (payload?.role !== 'administrator') {
        showToast('Access denied. Administrator privileges required.', 'error');
        setTimeout(() => window.location.href = '/dashboard', 1000);
        return;
    }

    try {
        const res = await apiFetch('/api/users/me');
        if (!res.ok) { logout(); return; }

        const user = await res.json();
        renderSidebar(user);
        renderAdminHeader();
        await loadUsers();
    } catch (err) {
        showToast('Error initializing admin panel: ' + err.message, 'error');
    }
}

function renderAdminHeader() {
    const titleEl = document.getElementById('header-title');
    const subtitleEl = document.getElementById('header-subtitle');
    titleEl.textContent = 'User Management';
    subtitleEl.textContent = 'Configure administrator access, user activation, and security analysis permissions';
}

async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    try {
        const res = await apiFetch('/api/users/');
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to load user directories');
        }

        allUsersList = await res.json();
        updatePendingBadge();
        renderUsersTable();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="py-4 text-center text-red-500 font-semibold">${err.message}</td></tr>`;
    }
}

function updatePendingBadge() {
    const pendingCount = allUsersList.filter(u => u.approval_status === 'pending').length;
    const badge = document.getElementById('pending-badge');
    if (badge) {
        if (pendingCount > 0) {
            badge.textContent = pendingCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function renderTableHeader() {
    const headerRow = document.querySelector('thead tr');
    if (!headerRow) return;

    if (activeTab === 'pending') {
        headerRow.innerHTML = `
            <th class="py-3 px-4">User ID</th>
            <th class="py-3 px-4">Name & Email</th>
            <th class="py-3 px-4">Requested Access Role</th>
            <th class="py-3 px-4">Created Date</th>
            <th class="py-3 px-4 text-right">Actions</th>
        `;
    } else {
        headerRow.innerHTML = `
            <th class="py-3 px-4">User ID</th>
            <th class="py-3 px-4">Name & Email</th>
            <th class="py-3 px-4">Department</th>
            <th class="py-3 px-4">System Role</th>
            <th class="py-3 px-4">Account Status</th>
            <th class="py-3 px-4">Created Date</th>
            <th class="py-3 px-4 text-right">Actions</th>
        `;
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    renderTableHeader();

    // Filter list based on active tab
    const filteredUsers = allUsersList.filter(user => {
        if (activeTab === 'pending') {
            return user.approval_status === 'pending';
        } else {
            // Exclude pending from standard list
            return user.approval_status !== 'pending';
        }
    });

    if (filteredUsers.length === 0) {
        const colSpan = activeTab === 'pending' ? 5 : 7;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="py-8 text-center text-slate-400">No requests found in this view</td></tr>`;
        
        // Update total counter
        const countEl = document.getElementById('users-count');
        if (countEl) countEl.textContent = `0 users`;
        return;
    }

    // Update total counter
    const countEl = document.getElementById('users-count');
    if (countEl) {
        if (activeTab === 'pending') {
            countEl.textContent = `${filteredUsers.length} pending`;
        } else {
            countEl.textContent = `${filteredUsers.length} users`;
        }
    }

    tbody.innerHTML = filteredUsers.map(user => {
        const initials = user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const dateStr = new Date(user.created_at).toLocaleDateString();

        if (activeTab === 'pending') {
            return `
                <tr class="hover:bg-slate-50 border-b border-slate-100 align-middle">
                    <td class="py-3 px-4 font-mono font-semibold text-slate-800">EMP-${String(user.id).padStart(4, '0')}</td>
                    <td class="py-3 px-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                                ${user.profile_image ? `<img src="${user.profile_image}" class="w-full h-full object-cover">` : initials}
                            </div>
                            <div>
                                <div class="font-bold text-slate-900 text-xs">${user.full_name}</div>
                                <div class="text-[10px] text-slate-400 font-medium">${user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px]">
                            ${ROLE_LABELS[user.role] || user.role}
                        </span>
                    </td>
                    <td class="py-3 px-4 font-mono font-medium text-slate-400">${dateStr}</td>
                    <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-1.5">
                            <button onclick="approveUser(${user.id})" class="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all">
                                ✓ Approve
                            </button>
                            <button onclick="rejectUser(${user.id})" class="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all">
                                ✕ Deny
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        // Standard user row
        return `
            <tr class="hover:bg-slate-50 border-b border-slate-100 align-middle">
                <td class="py-3 px-4 font-mono font-semibold text-slate-800">EMP-${String(user.id).padStart(4, '0')}</td>
                <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                            ${user.profile_image ? `<img src="${user.profile_image}" class="w-full h-full object-cover">` : initials}
                        </div>
                        <div>
                            <div class="font-bold text-slate-900 text-xs">${user.full_name}</div>
                            <div class="text-[10px] text-slate-400 font-medium">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-4 font-medium text-slate-500">${user.department || 'Security Operations'}</td>
                <td class="py-3 px-4">
                    <select class="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/10 cursor-pointer" onchange="changeRole(${user.id}, this.value)">
                        <option value="security_analyst" ${user.role === 'security_analyst' ? 'selected' : ''}>Security Analyst</option>
                        <option value="soc_engineer" ${user.role === 'soc_engineer' ? 'selected' : ''}>SOC Engineer</option>
                        <option value="security_manager" ${user.role === 'security_manager' ? 'selected' : ''}>Security Manager</option>
                        <option value="administrator" ${user.role === 'administrator' ? 'selected' : ''}>Administrator</option>
                    </select>
                </td>
                <td class="py-3 px-4">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${user.is_active ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-red-50 border border-red-100 text-red-600'}">
                        <span class="w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}"></span>
                        <span>${user.is_active ? 'Active' : 'Inactive'}</span>
                    </span>
                </td>
                <td class="py-3 px-4 font-mono font-medium text-slate-400">${dateStr}</td>
                <td class="py-3 px-4 text-right">
                    <button onclick="toggleUserStatus(${user.id})" class="px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${user.is_active ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}">
                        ${user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function switchTab(tab) {
    activeTab = tab;
    const tabAll = document.getElementById('tab-all');
    const tabPending = document.getElementById('tab-pending');

    if (tab === 'all') {
        tabAll.className = 'px-5 py-2.5 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 transition-all focus:outline-none';
        tabPending.className = 'px-5 py-2.5 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all focus:outline-none flex items-center gap-1.5';
    } else {
        tabPending.className = 'px-5 py-2.5 text-xs font-bold border-b-2 border-indigo-600 text-indigo-600 transition-all focus:outline-none flex items-center gap-1.5';
        tabAll.className = 'px-5 py-2.5 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 transition-all focus:outline-none';
    }

    renderUsersTable();
}

async function approveUser(userId) {
    try {
        const res = await apiFetch(`/api/users/${userId}/approve`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to approve user registration');
        }

        showToast('Registration request approved successfully!', 'success');
        await loadUsers();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function rejectUser(userId) {
    if (!confirm('Are you sure you want to deny this access request?')) return;

    try {
        const res = await apiFetch(`/api/users/${userId}/reject`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to deny registration request');
        }

        showToast('Registration request has been denied.', 'success');
        await loadUsers();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function changeRole(userId, newRole) {
    try {
        const res = await apiFetch(`/api/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role: newRole })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to update system access role');
        }

        showToast('Role updated successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
        await loadUsers(); // Reset state
    }
}

async function toggleUserStatus(userId) {
    try {
        const res = await apiFetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to toggle account activation status');
        }

        showToast('Account status updated!', 'success');
        await loadUsers();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// --- Add User Modal Handlers ---

function openAddUserModal() {
    document.getElementById('add-user-modal').classList.remove('hidden');
    document.getElementById('new-email').focus();
}

function closeAddUserModal() {
    document.getElementById('add-user-modal').classList.add('hidden');
    document.getElementById('add-user-form').reset();
}

// Bind form submission handler directly
const addUserForm = document.getElementById('add-user-form');
if (addUserForm) {
    addUserForm.onsubmit = async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('new-email').value.trim();
        const username = document.getElementById('new-username').value.trim();
        const full_name = document.getElementById('new-fullname').value.trim();
        const password = document.getElementById('new-password').value;
        const role = document.getElementById('new-role').value;

        try {
            const res = await apiFetch('/api/users/', {
                method: 'POST',
                body: JSON.stringify({ email, username, full_name, password, role })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to create user');
            }

            showToast('System user created successfully!', 'success');
            closeAddUserModal();
            await loadUsers(); // Refresh table listing
        } catch (err) {
            showToast(err.message, 'error');
        }
    };
}
