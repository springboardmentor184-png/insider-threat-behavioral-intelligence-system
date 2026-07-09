import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Shield, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import api from '../services/api'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const triggerVerification = async () => {
      if (!token) {
        setStatus('error')
        setErrorMsg('Email verification token is missing in the query link.')
        return
      }

      try {
        await api.post('/auth/verify-email', { token })
        setStatus('success')
        setTimeout(() => {
          navigate('/login')
        }, 4000)
      } catch (err) {
        setStatus('error')
        setErrorMsg(err.response?.data?.detail || 'Verification failed. The link may have expired or is invalid.')
      }
    }

    triggerVerification()
  }, [token, navigate])

  return (
    <div className="login-layout">
      <div className="glass-card auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Shield size={48} style={{ color: '#06b6d4', marginBottom: '1.5rem', display: 'inline-block' }} />

        {status === 'verifying' && (
          <div>
            <Loader2 size={32} className="spinner" style={{ color: '#06b6d4', margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontFamily: 'Space Grotesk' }}>VERIFYING CREDENTIALS</h3>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
              Confirming security clearance and activating account...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle size={40} style={{ color: '#10b981', margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontFamily: 'Space Grotesk', color: '#10b981' }}>CLEARANCE APPROVED</h3>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
              Your email has been verified. Redirecting you to the system login terminal...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertCircle size={40} style={{ color: '#ef4444', margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontFamily: 'Space Grotesk', color: '#ef4444' }}>VERIFICATION FAILED</h3>
            <p style={{ color: '#94a3b8', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              {errorMsg}
            </p>
            <Link to="/login" className="btn btn-secondary" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Back to Login Terminal
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
