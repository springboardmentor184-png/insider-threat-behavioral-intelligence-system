import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Shield, Users, ClipboardList, LogOut, PlusCircle, User } from 'lucide-react'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()

  if (!isAuthenticated) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdminOrManager = ['Administrator', 'Security Manager'].includes(user.role.name)

  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => navigate('/')}>
        <Shield size={24} style={styles.logoIcon} />
        <span style={styles.brandText}>InsiderThreat.AI</span>
      </div>
      
      <div style={styles.links}>
        <Link to="/" style={styles.link}><Shield size={16} /> Dashboard</Link>
        <Link to="/employees" style={styles.link}><Users size={16} /> Employees</Link>
        {isAdminOrManager && (
          <Link to="/employees/add" style={styles.link}><PlusCircle size={16} /> Add Employee</Link>
        )}
        <Link to="/activities" style={styles.link}><ClipboardList size={16} /> Activity Logs</Link>
      </div>

      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <User size={13} style={{ color: '#94a3b8' }} />
            <span style={styles.userName}>{user.username}</span>
          </div>
          <span style={styles.userRole}>{user.role.name}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 2rem',
    background: '#0f1624',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    fontFamily: 'Outfit, sans-serif'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer'
  },
  logoIcon: {
    color: '#3b82f6'
  },
  brandText: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: '700',
    fontSize: '1.25rem',
    color: '#f8fafc',
    letterSpacing: '-0.02em'
  },
  links: {
    display: 'flex',
    gap: '1.5rem'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    color: '#94a3b8',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    paddingRight: '1rem'
  },
  userName: {
    color: '#f8fafc',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  userRole: {
    color: '#06b6d4',
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '0.1rem'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: '500',
    transition: 'all 0.2s'
  }
}

export default Navbar
