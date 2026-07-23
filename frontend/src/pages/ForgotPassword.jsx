import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, AlertCircle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react'
import api from '../services/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resetLink, setResetLink] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setResetLink('')
    setLoading(true)

    try {
      const res = await api.post('/auth/forgot-password', { email })
      setSuccess(true)
      if (res.data.reset_link) {
        setResetLink(res.data.reset_link)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-layout">
      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Shield size={48} style={{ color: '#06b6d4', marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'Space Grotesk' }}>RESET ACCESS</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Request secure password reset links
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>Password reset token successfully generated for {email}!</span>
            </div>

            {resetLink && (
              <div style={{ textAlign: 'center' }}>
                <Link 
                  to={resetLink} 
                  className="btn btn-primary" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem', 
                    width: '100%', 
                    padding: '0.75rem',
                    textDecoration: 'none'
                  }}
                >
                  <KeyRound size={18} /> Proceed to Reset Password
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Corporate Email Address</label>
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
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading || success}>
            {loading ? 'Dispatched Request...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
