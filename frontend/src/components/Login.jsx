import React, { useState, useEffect, useRef } from 'react';

export default function Login({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Security Analyst');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const googleBtnRef = useRef(null);
  const [googleClientId, setGoogleClientId] = useState('');
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false);

  const stateRef = useRef({ isRegister, role });
  
  // Track register status and role selections to prevent stale closures in Google API callback
  useEffect(() => {
    stateRef.current = { isRegister, role };
  }, [isRegister, role]);

  // Fetch Google Client ID from the backend settings
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const res = await fetch('/api/auth/google-client-id');
        if (res.ok) {
          const data = await res.json();
          const cid = data.client_id;
          if (cid && cid !== 'your-copied-client-id-here.apps.googleusercontent.com' && cid.trim() !== '') {
            setGoogleClientId(cid);
            setIsGoogleConfigured(true);
          }
        }
      } catch (err) {
        console.error("Failed to load Google client ID from backend:", err);
      }
    };
    fetchClientId();
  }, []);

  // Initialize and mount Google Identity Services button once Client ID is fetched
  useEffect(() => {
    if (isGoogleConfigured && googleClientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 380,
          text: 'continue_with',
          logo_alignment: 'left',
        });
      } catch (err) {
        console.error("Error rendering Google Identity Services button:", err);
      }
    }
  }, [isGoogleConfigured, googleClientId]);

  const handleGoogleCallback = async (googleResponse) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    const { isRegister: regMode, role: selectedRole } = stateRef.current;
    const endpoint = regMode ? '/api/auth/google-register' : '/api/auth/google';
    const payload = regMode 
      ? { credential: googleResponse.credential, role: selectedRole }
      : { credential: googleResponse.credential };
      
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Google authentication failed');
      
      if (regMode) {
        setSuccessMsg(`Google account registered successfully with role: ${selectedRole}! Logging you in...`);
        setTimeout(() => {
          onAuthSuccess(data.access_token);
        }, 1500);
      } else {
        onAuthSuccess(data.access_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isRegister) {
        // Register API Call
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: fullName, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Registration failed');
        
        setSuccessMsg('Account created successfully! Please log in.');
        setIsRegister(false);
        setPassword('');
      } else {
        // Login API Call (using JSON endpoint for frontend simplicity)
        const res = await fetch('/api/auth/login-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Login failed');
        
        onAuthSuccess(data.access_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Removed handleOAuthMock endpoint simulator

  return (
    <div style={styles.container} className="fade-in">
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.shieldIcon}>🛡️</div>
          <h2 style={styles.title}>Insider Threat System</h2>
          <p style={styles.subtitle}>Behavioral Intelligence & Risk Analytics Portal</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {successMsg && <div style={styles.successAlert}>{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Corporate Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Assign Security Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Security Analyst">Security Analyst</option>
                <option value="SOC Engineer">SOC Engineer</option>
                <option value="Security Manager">Security Manager</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Processing Security Keys...' : isRegister ? 'Register Platform User' : 'Sign In'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or federated access</span>
        </div>

        {isGoogleConfigured ? (
          <div style={styles.googleBtnContainer}>
            <div ref={googleBtnRef} style={styles.googleBtn}></div>
          </div>
        ) : (
          <div style={styles.googleWarning}>
            <p style={{ fontWeight: '600', fontSize: '12px', color: 'var(--color-warning)' }}>
              ⚠️ Google Sign-In Not Active
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
              To enable "Continue with Google" on your laptop, create an OAuth client credential in the Google Cloud Console and paste it in <code>backend/.env</code>.
            </p>
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            {isRegister ? 'Already registered?' : 'Need system credentials?'}
            <button
              type="button"
              style={styles.toggleBtn}
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccessMsg('');
              }}
            >
              {isRegister ? 'Log In here' : 'Register here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '85vh',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '460px',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  shieldIcon: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  submitBtn: {
    width: '100%',
    marginTop: '10px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  dividerText: {
    flexGrow: 0,
    padding: '0 12px',
    color: 'var(--text-muted)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
  },
  googleBtnContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginTop: '10px',
  },
  googleBtn: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  googleWarning: {
    background: 'rgba(251, 191, 36, 0.05)',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  errorAlert: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    borderRadius: '8px',
    color: 'var(--color-danger)',
    padding: '12px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  successAlert: {
    background: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.3)',
    borderRadius: '8px',
    color: 'var(--color-success)',
    padding: '12px',
    fontSize: '13px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-blue)',
    cursor: 'pointer',
    fontFamily: 'var(--font-heading)',
    fontWeight: '600',
    marginLeft: '6px',
    textDecoration: 'underline',
  },
};
