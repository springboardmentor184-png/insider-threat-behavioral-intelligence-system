import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, AlertCircle, CheckCircle, Check, X, Eye, EyeOff } from 'lucide-react'
import api from '../services/api'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Live password validation state
  const [checks, setChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
    spaces: true,
    weak: true
  })

  useEffect(() => {
    const weakList = ["password", "password123", "12345678", "qwerty", "admin", "welcome", "letmein"]
    setChecks({
      length: password.length >= 8 && password.length <= 64,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?`~]/.test(password),
      spaces: !/\s/.test(password),
      weak: !weakList.includes(password.toLowerCase())
    })
  }, [password])

  const isValid = Object.values(checks).every(val => val === true)
  const isMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('Missing password reset token.')
      return
    }
    if (!isValid) {
      setError('Please satisfy all password criteria.')
      return
    }
    if (!isMatch) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        password,
        confirm_password: confirmPassword
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. Token might be expired or invalid.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-layout">
      <div className="glass-card auth-card" style={{ maxWidth: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Shield size={48} style={{ color: '#06b6d4', marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'Space Grotesk' }}>CHOOSE NEW PASSWORD</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Update security clearance credentials
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
            <span>Credentials updated! Redirecting to login terminal...</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">New Password</label>
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
            <div style={{ marginBottom: '1.25rem', fontSize: '0.8rem', color: '#94a3b8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
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

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || success || !isValid || !isMatch}>
            {loading ? 'Updating Credentials...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
