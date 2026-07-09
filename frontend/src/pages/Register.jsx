import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Shield, AlertCircle, CheckCircle, Check, X, Eye, EyeOff, Loader2 } from 'lucide-react'

const Register = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [roleName, setRoleName] = useState('Security Analyst')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Google OAuth Simulation state
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [customGoogleEmail, setCustomGoogleEmail] = useState('')
  const [customGoogleName, setCustomGoogleName] = useState('')

  const { registerUser, loginWithGoogle } = useContext(AuthContext)
  const navigate = useNavigate()

  // Live password validation checklist state
  const [checks, setChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
    spaces: true,
    weak: true
  })

  // Password Strength Meter calculations
  const [strengthScore, setStrengthScore] = useState(0)
  const [strengthLevel, setStrengthLevel] = useState({ text: 'Weak', color: '#ef4444' })

  useEffect(() => {
    const weakList = ["password", "password123", "12345678", "qwerty", "admin", "welcome", "letmein"]
    const checkLength = password.length >= 8 && password.length <= 64
    const checkUpper = /[A-Z]/.test(password)
    const checkLower = /[a-z]/.test(password)
    const checkNumber = /[0-9]/.test(password)
    const checkSpecial = /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?`~]/.test(password)
    const checkSpaces = !/\s/.test(password)
    const checkWeak = !weakList.includes(password.toLowerCase())

    setChecks({
      length: checkLength,
      upper: checkUpper,
      lower: checkLower,
      number: checkNumber,
      special: checkSpecial,
      spaces: checkSpaces,
      weak: checkWeak
    })

    // Calculate score
    let score = 0
    if (checkLength) score += 1
    if (checkUpper) score += 1
    if (checkLower) score += 1
    if (checkNumber) score += 1
    if (checkSpecial) score += 1
    if (checkSpaces && password.length > 0) score += 1
    if (checkWeak && password.length > 0) score += 1

    setStrengthScore(score)

    // Map score to levels
    if (password.length === 0) {
      setStrengthLevel({ text: 'None', color: 'rgba(255,255,255,0.08)' })
    } else if (score <= 3) {
      setStrengthLevel({ text: 'Weak', color: '#ef4444' })
    } else if (score === 4) {
      setStrengthLevel({ text: 'Fair', color: '#f97316' })
    } else if (score === 5) {
      setStrengthLevel({ text: 'Medium', color: '#eab308' })
    } else if (score === 6) {
      setStrengthLevel({ text: 'Strong', color: '#22c55e' })
    } else {
      setStrengthLevel({ text: 'Very Strong', color: '#15803d' })
    }
  }, [password])

  const isValid = Object.values(checks).every(val => val === true)
  const isMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Front-end validations
    if (!fullName || fullName.length < 3 || fullName.length > 100) {
      setError('Full Name must be between 3 and 100 characters.')
      return
    }
    if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      setError('Full Name can only contain alphabet characters and spaces.')
      return
    }
    if (username && (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username))) {
      setError('Username must be 3-30 characters containing only letters, numbers, and underscores.')
      return
    }
    
    // Block disposable email domains
    const disposableDomains = ["mailinator.com", "tempmail.com", "yopmail.com", "sharklasers.com", "guerrillamail.com"]
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (disposableDomains.includes(emailDomain)) {
      setError('Registration using disposable email addresses is restricted.')
      return
    }

    if (!isValid) {
      setError('Please satisfy all password complexity requirements.')
      return
    }
    if (!isMatch) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await registerUser(fullName, email, username, password, confirmPassword, roleName)
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
      // Give a few seconds to let them read the notice about the verification link in server console
      setTimeout(() => {
        navigate('/login')
      }, 5000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check inputs.')
    } finally {
      setLoading(false)
    }
  }

  const triggerGoogleAuth = async (name, email) => {
    setError('')
    setLoading(true)
    setShowGoogleModal(false)
    try {
      const googleId = `g-${name.toLowerCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`
      const picUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`
      await loginWithGoogle(name, email, googleId, picUrl)
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (err) {
      setError('Google Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-layout">
      <div className="glass-card auth-card" style={{ maxWidth: '500px', marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Shield size={48} style={{ color: '#06b6d4', marginBottom: '0.75rem' }} />
          <h2 style={{ fontFamily: 'Space Grotesk' }}>CLEARANCE REQUEST</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Register security operator session account
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>Account created! A simulated verification link has been printed to the backend terminal console. Please verify to log in.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="operator_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Corporate Email</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="operator@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username (Optional)</label>
            <input
              type="text"
              className="form-control"
              placeholder="operator_codename"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Security Password</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '2.4rem',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password Validation Checklist */}
          {password.length > 0 && (
            <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#94a3b8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: checks.length ? '#10b981' : '#ef4444' }}>
                {checks.length ? <Check size={12} /> : <X size={12} />} 8-64 Characters
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: checks.upper ? '#10b981' : '#ef4444' }}>
                {checks.upper ? <Check size={12} /> : <X size={12} />} Uppercase Letter
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: checks.lower ? '#10b981' : '#ef4444' }}>
                {checks.lower ? <Check size={12} /> : <X size={12} />} Lowercase Letter
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: checks.number ? '#10b981' : '#ef4444' }}>
                {checks.number ? <Check size={12} /> : <X size={12} />} One Number
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: checks.special ? '#10b981' : '#ef4444' }}>
                {checks.special ? <Check size={12} /> : <X size={12} />} Special Char
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: checks.spaces ? '#10b981' : '#ef4444' }}>
                {checks.spaces ? <Check size={12} /> : <X size={12} />} No Spaces
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: checks.weak ? '#10b981' : '#ef4444', gridColumn: 'span 2' }}>
                {checks.weak ? <Check size={12} /> : <X size={12} />} Strong & Uncommon
              </div>
            </div>
          )}

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#94a3b8' }}>
                <span>Password Strength:</span>
                <span style={{ color: strengthLevel.color, fontWeight: 'bold' }}>{strengthLevel.text}</span>
              </div>
              <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(strengthScore / 7) * 100}%`,
                  backgroundColor: strengthLevel.color,
                  transition: 'all 0.3s ease'
                }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Confirm Security Password</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || success}
            />
            {confirmPassword.length > 0 && (
              <span style={{ fontSize: '0.75rem', marginTop: '0.25rem', display: 'block', color: isMatch ? '#10b981' : '#ef4444' }}>
                {isMatch ? '✓ Passwords Match' : '✗ Passwords Do Not Match'}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Request Clearance Level</label>
            <select
              className="form-control"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={loading || success}
              style={{ backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <option value="Administrator">Administrator</option>
              <option value="Security Manager">Security Manager</option>
              <option value="SOC Engineer">SOC Engineer</option>
              <option value="Security Analyst">Security Analyst</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || success || !isValid || !isMatch}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Loader2 size={16} className="spinner" /> Provisioning Clearance...
              </span>
            ) : 'Request Clearance'}
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
          disabled={loading || success}
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
          Continue with Google
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          Already registered? <Link to="/login" style={{ fontWeight: '500' }}>Login Terminal</Link>
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
                onClick={() => triggerGoogleAuth('Venkat Sainama', 'venkatsainama995@gmail.com')}
                style={styles.accountOption}
              >
                <strong>Venkat Sainama</strong> (venkatsainama995@gmail.com)
              </button>
              <button
                type="button"
                onClick={() => triggerGoogleAuth('Sarah Connor', 'sconnor@company.com')}
                style={styles.accountOption}
              >
                <strong>Sarah Connor</strong> (sconnor@company.com)
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
                  placeholder="Full Name"
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

export default Register
