import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Shield, AlertCircle } from 'lucide-react'
import api from '../services/api'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Google OAuth Simulation state
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [customGoogleEmail, setCustomGoogleEmail] = useState('')
  const [customGoogleName, setCustomGoogleName] = useState('')

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const triggerGoogleAuth = async (name, email) => {
    setError('')
    setLoading(true)
    setShowGoogleModal(false)
    try {
      const payload = { credential: `${name}:${email}` }
      const res = await api.post('/auth/google', payload)
      localStorage.setItem('token', res.data.access_token)
      // Refresh browser to synchronize AuthContext profile state
      window.location.href = '/'
    } catch (err) {
      setError('Google Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-layout">
      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'Space Grotesk' }}>SYSTEM ACCESS</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Behavioral Intelligence Control Panel
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="Enter operator username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Authorizing Session...' : 'Authenticate'}
          </button>
        </form>

        {/* Divider line */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'Space Grotesk' }}>OR</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
        </div>

        {/* Google Authentication Trigger Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          style={styles.googleBtn}
        >
          <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 15 1 12 1 7.35 1 3.4 3.67 1.48 7.56l3.89 3.02c.9-2.73 3.47-4.54 6.63-4.54z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-1.99 3.43-4.91 3.43-8.56z"
            />
            <path
              fill="#FBBC05"
              d="M5.37 10.58a7.16 7.16 0 0 1 0-4.41L1.48 3.15a11.96 11.96 0 0 0 0 10.45l3.89-3.02z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.34 1.1-4.26 1.1-3.16 0-5.73-1.81-6.63-4.54L1.48 16.8A11.96 11.96 0 0 0 12 23z"
            />
          </svg>
          Sign in with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          New analyst or operator? <Link to="/register" style={{ fontWeight: '500' }}>Request Access</Link>
        </p>
      </div>

      {/* Simulated Google OAuth Dialog Modal */}
      {showGoogleModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '0.5rem', color: '#f8fafc' }}>
              Google Account Selector
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Simulating Google OAuth2 authorization payload exchange.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => triggerGoogleAuth('venkat', 'venkatsainama995@gmail.com')}
                style={styles.accountOption}
              >
                <strong>venkat</strong> (venkatsainama995@gmail.com)
              </button>
              <button
                type="button"
                onClick={() => triggerGoogleAuth('admin_operator', 'admin.corp@company.com')}
                style={styles.accountOption}
              >
                <strong>admin_operator</strong> (admin.corp@company.com)
              </button>
              <button
                type="button"
                onClick={() => triggerGoogleAuth('sec_analyst', 'analyst.team@company.com')}
                style={styles.accountOption}
              >
                <strong>sec_analyst</strong> (analyst.team@company.com)
              </button>
            </div>

            {/* Custom Google login option */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
              <span style={{ color: '#f8fafc', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                Use another Google Account:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Username"
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.5rem' }}
                disabled={!customGoogleName || !customGoogleEmail}
                onClick={() => triggerGoogleAuth(customGoogleName, customGoogleEmail)}
              >
                Authorize Custom Account
              </button>
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.5rem' }}
              onClick={() => setShowGoogleModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    width: '100%',
    maxSpace: '450px',
    maxWidth: '450px',
    backgroundColor: '#0f1624',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
  },
  accountOption: {
    width: '100%',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    background: '#162035',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    color: '#94a3b8',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
}

export default Login
