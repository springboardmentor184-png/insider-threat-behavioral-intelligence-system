import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#080c14', color: '#f8fafc' }}>
        <h3>Decrypting Session Telemetry...</h3>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role.name)) {
    return (
      <div style={{ padding: '3rem', maxWidth: '600px', margin: '100px auto', textAlign: 'center', background: '#0f1624', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h2 style={{ color: '#ef4444', fontFamily: 'Space Grotesk' }}>ACCESS DENIED</h2>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>
          Your security role <strong>{user.role.name}</strong> is not authorized to access this intelligence scope.
        </p>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
