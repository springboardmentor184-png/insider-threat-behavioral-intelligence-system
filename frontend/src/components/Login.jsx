import React, { useState } from 'react';
import { Shield, Lock, Mail, Users } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('manager@insiderai.com');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('Security Manager');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate authentication check
    setTimeout(() => {
      if (email === 'manager@insiderai.com' && password === 'admin123') {
        onLogin({ email, role, name: 'Security Manager' });
      } else {
        setError('Invalid credentials. Use manager@insiderai.com and admin123');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#0f172a',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(30, 58, 138, 0.3) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(15, 23, 42, 0.5) 0%, transparent 50%)',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div className="section-card" style={{
        width: '420px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: '#dbeafe',
            color: '#2563eb',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Shield size={32} fill="#2563eb" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>Insider AI</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Threat Behavioral Intelligence System</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#ef4444',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Manager Email</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 14px',
              backgroundColor: 'white',
              gap: '10px'
            }}>
              <Mail size={16} style={{ color: '#94a3b8' }} />
              <input
                type="email"
                required
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#0f172a' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Password</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 14px',
              backgroundColor: 'white',
              gap: '10px'
            }}>
              <Lock size={16} style={{ color: '#94a3b8' }} />
              <input
                type="password"
                required
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#0f172a' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Role select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>System Access Role</label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '10px 14px',
              backgroundColor: 'white',
              gap: '10px'
            }}>
              <Users size={16} style={{ color: '#94a3b8' }} />
              <select
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', color: '#0f172a', backgroundColor: 'transparent' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Security Manager">Security Manager</option>
                <option value="SOC Engineer">SOC Engineer</option>
                <option value="Administrator">System Administrator</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#1e3a8a',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              marginTop: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {loading ? 'Authenticating...' : 'Secure Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
          Insider Threat SOC Portal • Local Sandbox Environment
        </div>
      </div>
    </div>
  );
}
