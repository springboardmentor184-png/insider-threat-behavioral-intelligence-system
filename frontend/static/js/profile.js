/**
 * ITBIS Profile Module
 * Queries backend endpoint to fetch current profile details and submits updates.
 */

let currentSetupSecret = '';

async function initProfile() {
    if (!requireAuth()) return;

    try {
        const res = await apiFetch('/api/users/me');
        if (!res.ok) { logout(); return; }

        const user = await res.json();
        renderSidebar(user);
        renderProfileInfo(user);
    } catch (err) {
        showToast('Error loading profile: ' + err.message, 'error');
    }
}

function renderProfileInfo(user) {
    // 1. Sidebar details
    document.getElementById('sidebar-user-name').textContent = user.full_name;
    document.getElementById('sidebar-user-role').textContent = ROLE_LABELS[user.role] || user.role;

    // 2. Large header details
    document.getElementById('profile-full-name').textContent = user.full_name;
    document.getElementById('profile-role-badge').textContent = ROLE_LABELS[user.role] || user.role;

    const initials = user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const avatarLarge = document.getElementById('profile-avatar-large');
    const avatarSidebar = document.getElementById('sidebar-avatar');

    if (user.profile_image) {
        avatarLarge.innerHTML = `<img src="${user.profile_image}" alt="${user.full_name}" class="w-full h-full object-cover">`;
        avatarSidebar.innerHTML = `<img src="${user.profile_image}" alt="${user.full_name}" class="w-full h-full object-cover">`;
    } else {
        avatarLarge.textContent = initials;
        avatarSidebar.textContent = initials;
    }

    // 3. Form fields
    document.getElementById('email').value = user.email;
    document.getElementById('username').value = user.username;
    document.getElementById('full_name').value = user.full_name;
    document.getElementById('department').value = user.department || '';
    document.getElementById('designation').value = user.designation || '';
    document.getElementById('manager').value = user.manager || '';
    document.getElementById('profile_image').value = user.profile_image || '';

    // 4. Metadata Details
    document.getElementById('status-text').textContent = user.is_active ? 'Active' : 'Inactive';
    document.getElementById('status-text').className = user.is_active ? 'mt-1 font-bold text-emerald-600' : 'mt-1 font-bold text-red-500';
    document.getElementById('provider-text').textContent = user.oauth_provider ? 'Google Identity' : 'Local credentials';
    document.getElementById('created-text').textContent = new Date(user.created_at).toLocaleDateString();
    document.getElementById('updated-text').textContent = new Date(user.updated_at).toLocaleDateString();

    // 5. Render Multi-Factor Authentication details
    renderMFAState(user);

    // Bind form submit listener
    const form = document.getElementById('profile-update-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await saveProfileChanges();
    };
}

async function saveProfileChanges() {
    const data = {
        full_name: document.getElementById('full_name').value.trim(),
        department: document.getElementById('department').value.trim() || null,
        designation: document.getElementById('designation').value.trim() || null,
        manager: document.getElementById('manager').value.trim() || null,
        profile_image: document.getElementById('profile_image').value.trim() || null,
    };

    try {
        const res = await apiFetch('/api/users/me', {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to update profile');
        }

        showToast('Profile changes saved successfully!', 'success');
        const updatedUser = await res.json();
        renderProfileInfo(updatedUser);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// --- Multi-Factor Authentication Helpers ---

function renderMFAState(user) {
    const badge = document.getElementById('mfa-status-badge');
    const disabledSec = document.getElementById('mfa-disabled-section');
    const enabledSec = document.getElementById('mfa-enabled-section');
    const setupSec = document.getElementById('mfa-setup-section');

    setupSec.classList.add('hidden');

    if (user.is_mfa_enabled) {
        badge.textContent = 'Active';
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
        disabledSec.classList.add('hidden');
        enabledSec.classList.remove('hidden');
    } else {
        badge.textContent = 'Disabled';
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200';
        disabledSec.classList.remove('hidden');
        enabledSec.classList.add('hidden');
    }
}

async function startMFASetup() {
    try {
        const res = await apiFetch('/api/auth/2fa/setup', { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to start MFA setup');
        }

        const data = await res.json();
        currentSetupSecret = data.secret;

        document.getElementById('mfa-secret-text').textContent = data.secret;
        document.getElementById('mfa-qr-container').innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data.provisioning_uri)}" 
                 alt="MFA QR Code" class="w-[180px] h-[180px] block rounded shadow-sm">
        `;

        document.getElementById('mfa-disabled-section').classList.add('hidden');
        document.getElementById('mfa-setup-section').classList.remove('hidden');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function confirmMFASetup() {
    const code = document.getElementById('mfa-setup-code').value.trim();
    if (code.length !== 6 || isNaN(code)) {
        showToast('Please enter a valid 6-digit verification code', 'error');
        return;
    }

    try {
        const res = await apiFetch('/api/auth/2fa/enable', {
            method: 'POST',
            body: JSON.stringify({ secret: currentSetupSecret, code })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to verify MFA setup code');
        }

        showToast('Google Authenticator MFA enabled successfully!', 'success');
        // Refresh the profile data
        await initProfile();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function disableMFA() {
    if (!confirm('Are you sure you want to disable Google Authenticator MFA?')) return;

    try {
        const res = await apiFetch('/api/auth/2fa/disable', { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Failed to disable MFA');
        }

        showToast('MFA has been disabled.', 'success');
        await initProfile();
    } catch (err) {
        showToast(err.message, 'error');
    }
}
