import React, { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Shield, AlertCircle, CheckCircle2, Loader2, ArrowLeft, KeyRound, Mail } from 'lucide-react'

const Login = () => {
  const [step, setStep] = useState('request') // 'request' | 'verify'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [infoMsg, setInfoMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Google OAuth Simulation state
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [customGoogleEmail, setCustomGoogleEmail] = useState('')
  const [customGoogleName, setCustomGoogleName] = useState('')

  const { sendOtp, verifyOtp, resendOtp, loginWithGoogle } = useContext(AuthContext)
  const navigate = useNavigate()

  // Cooldown countdown timer effect
  useEffect(() => {
    let timer = null
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [cooldown])

  // Step 1: Send OTP to User's Email / Username
  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setInfoMsg('')

    if (!email.trim()) {
      setError('Please enter your registered corporate email address or username.')
      return
    }

    setLoading(true)
    try {
      const res = await sendOtp(email.trim())
      setInfoMsg(res.message || 'If an account exists with this information, an OTP has been sent.')
      setStep('verify')
      setCooldown(60) // Start 60-second cooldown timer
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response.data.detail || 'Rate limit exceeded. Please wait before requesting another OTP.')
      } else {
        setError(err.response?.data?.detail || 'Failed to dispatch OTP verification code. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify 6-Digit OTP & Create Session
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setInfoMsg('')

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code.')
      return
    }

    setLoading(true)
    try {
      await verifyOtp(email.trim(), otp.trim(), rememberMe)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP code. Please check your inbox or request a new code.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return
    setError('')
    setInfoMsg('')
    setLoading(true)
    try {
      const res = await resendOtp(email.trim())
      setInfoMsg(res.message || 'A new 6-digit OTP code has been sent to your email.')
      setCooldown(60)
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response.data.detail)
      } else {
        setError(err.response?.data?.detail || 'Failed to resend OTP code.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth trigger handler
  const triggerGoogleAuth = async (name, emailAddr) => {
    setError('')
    setLoading(true)
    setShowGoogleModal(false)
    try {
      const googleId = `g-${name.toLowerCase().replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`
      const picUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`
      await loginWithGoogle(name, emailAddr, googleId, picUrl)
      navigate('/')
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
          <Shield size={48} style={{ color: '#06b6d4', marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'Space Grotesk' }}>SYSTEM ACCESS</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Behavioral Intelligence Control Panel • OTP Authentication
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {infoMsg && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#10b981' }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {step === 'request' ? (
          /* STEP 1: Enter Email / Username */
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Corporate Email or Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="operator@company.com or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '0.85rem', color: '#64748b' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Loader2 size={16} className="spinner" /> Sending OTP Verification Code...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <KeyRound size={16} /> Send OTP Verification Code
                </span>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: Enter 6-Digit OTP */
          <form onSubmit={handleVerifyOtp}>
            <div style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ color: '#06b6d4', fontWeight: '600' }}>OTP Sent to Account</div>
              <div style={{ color: '#94a3b8', marginTop: '0.15rem' }}>
                Enter the 6-digit code sent to your registered email for <strong>{email}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">6-Digit Verification Code (OTP)</label>
              <input
                type="text"
                required
                maxLength={6}
                className="form-control"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={loading}
                style={{
                  fontFamily: 'Space Grotesk, monospace',
                  fontSize: '1.4rem',
                  letterSpacing: '0.4em',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#06b6d4'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  style={{ accentColor: '#06b6d4' }}
                />
                Remember Me (7 days)
              </label>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: cooldown > 0 ? '#64748b' : '#06b6d4',
                  fontWeight: '600',
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {cooldown > 0 ? `Resend OTP (${cooldown}s)` : 'Resend OTP'}
              </button>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Loader2 size={16} className="spinner" /> Authorizing Session...
                </span>
              ) : 'Verify OTP & Authorize Session'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('request'); setError(''); setInfoMsg(''); setOtp(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                width: '100%',
                marginTop: '1rem',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} /> Change Email / Username
            </button>
          </form>
        )}

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
          disabled={loading}
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
          Need security clearance? <Link to="/register" style={{ fontWeight: '500' }}>Register Now</Link>
        </p>
      </div>

      {/* Simulated Google OAuth Dialog Modal */}
      {showGoogleModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Google Account Selector
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
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
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
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
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-card)',
    transition: 'all 0.2s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  accountOption: {
    width: '100%',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
}

export default Login
