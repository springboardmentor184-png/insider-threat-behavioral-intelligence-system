/**
 * ITBIS Authentication Module
 * Handles login, registration, Google OAuth2, cookie-based sessions,
 * and automatic JWT token refresh via fetch interception.
 */

const API_BASE = '';

// --- Session State Flag ---
// Since JWT is stored in HttpOnly cookies, JS uses this flag to check if a session exists.
function isAuthenticated() {
    return localStorage.getItem('itbis_logged_in') === 'true';
}

function setAuthenticatedFlag(status) {
    if (status) {
        localStorage.setItem('itbis_logged_in', 'true');
    } else {
        localStorage.removeItem('itbis_logged_in');
    }
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '✓', error: '✗', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// --- Intercepted Fetch Wrapper for Token Refresh ---
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed() {
    refreshSubscribers.map(cb => cb());
    refreshSubscribers = [];
}

async function apiFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (!(options.body instanceof FormData)) {
        options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    }
    // Include cookies in request
    options.credentials = 'same-origin';

    try {
        let response = await fetch(url, options);

        // If unauthorized, attempt token refresh
        if (response.status === 401 && isAuthenticated()) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
                        method: 'POST',
                        credentials: 'same-origin',
                    });

                    if (refreshRes.ok) {
                        isRefreshing = false;
                        onRefreshed();
                    } else {
                        // Refresh token expired / invalid
                        isRefreshing = false;
                        setAuthenticatedFlag(false);
                        window.location.href = '/login';
                        return response;
                    }
                } catch (err) {
                    isRefreshing = false;
                    setAuthenticatedFlag(false);
                    window.location.href = '/login';
                    return response;
                }
            }

            // Queue requests until refresh completes
            return new Promise((resolve) => {
                subscribeTokenRefresh(() => {
                    resolve(fetch(url, options));
                });
            });
        }

        return response;
    } catch (err) {
        console.error('Fetch error:', err);
        throw err;
    }
}

// --- Auth Headers (Legacy Compatibility) ---
function authHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}

// --- Login ---
async function login(email, password, rememberMe = false) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        if (data.status === 'mfa_required') {
            showToast('Google Authenticator code required', 'info');
            setTimeout(() => window.location.href = `/verify-2fa?email=${encodeURIComponent(data.email)}`, 500);
            return;
        }

        setAuthenticatedFlag(true);
        // Save remember state in session or local storage
        if (rememberMe) {
            localStorage.setItem('itbis_remember', 'true');
        } else {
            localStorage.removeItem('itbis_remember');
        }

        showToast('Login successful!', 'success');
        setTimeout(() => window.location.href = '/dashboard', 500);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// --- Register ---
async function register(formData) {
    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || 'Registration failed');
        }

        showToast('Account created! Please login.', 'success');
        setTimeout(() => window.location.href = '/login', 1000);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// --- Google OAuth2 ---
function googleLogin() {
    // Set logged-in flag optimistically (it will be validated on callback)
    setAuthenticatedFlag(true);
    window.location.href = `${API_BASE}/api/auth/oauth2/google`;
}

// --- Logout ---
async function logout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            credentials: 'same-origin'
        });
    } catch (err) {
        console.error('Logout error:', err);
    }
    setAuthenticatedFlag(false);
    window.location.href = '/login';
}

// --- Auth Guard ---
function requireAuth() {
    // If returning from Google OAuth, cookies are already set. Ensure local flag is true.
    const urlParams = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/dashboard' || window.location.pathname === '/profile') {
        // If we just loaded the page and there's a token, set active flag (OAuth callback fallback)
        const token = urlParams.get('token');
        if (token) {
            setAuthenticatedFlag(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    if (!isAuthenticated()) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// --- Redirect if already authenticated ---
function redirectIfAuth() {
    if (isAuthenticated()) {
        window.location.href = '/dashboard';
    }
}
