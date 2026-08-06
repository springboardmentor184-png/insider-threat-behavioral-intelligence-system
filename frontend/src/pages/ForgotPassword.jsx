import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, AlertCircle, CheckCircle, ArrowLeft, KeyRound, Mail, ExternalLink, ShieldCheck } from 'lucide-react'
import api from '../services/api'

const ForgotPassword = () => {
  const [step, setStep] = useState(1) // Step 1: Email, Step 2: OTP Verification
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [dispatchedOtp, setDispatchedOtp] = useState('')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await api.post('/auth/send-otp', { email })
      if (res.data.status === 'success') {
        setStep(2)
        setSuccess(true)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'No registered operator account found with this email address.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/verify-otp', { email, otp })
      if (res.data.reset_link) {
        navigate(res.data.reset_link)
      } else {
        setError('Verification succeeded, but reset link could not be generated.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid 6-digit OTP code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-layout">
      <div className="glass-card auth-card" style={{ maxWidth: '480px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--accent-blue)' }}>
            {step === 1 ? <KeyRound size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.75rem', color: 'var(--text-primary)' }}>
            {step === 1 ? 'FORGOT PASSWORD' : 'ENTER 6-DIGIT OTP'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {step === 1 ? 'Request 6-digit OTP verification codes' : `Verify identity code sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Enter Email & Request OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Registered Corporate Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="operator@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Dispatching OTP Code...' : 'Request 6-Digit OTP Code'}
            </button>
          </form>
        )}

        {/* STEP 2: Enter & Verify 6-Digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>A 6-digit OTP verification code has been dispatched to <strong>{email}</strong>. Please check your email inbox.</span>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Enter 6-Digit OTP Code</label>
              <input
                type="text"
                required
                maxLength="6"
                className="form-control"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
                style={{ textAlign: 'center', fontSize: '1.5rem', fontFamily: 'Space Grotesk, monospace', letterSpacing: '0.2em' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Verifying Code...' : 'Verify OTP & Reset Password'}
            </button>

            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="btn btn-secondary" 
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem', fontSize: '0.85rem' }}
            >
              Request Different OTP / Re-enter Email
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ fontWeight: '600', color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Return to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
