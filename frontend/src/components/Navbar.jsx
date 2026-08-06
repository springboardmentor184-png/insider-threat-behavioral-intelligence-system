import React, { useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Shield, Users, ClipboardList, LogOut, PlusCircle, User, Activity, Sun, Moon, Bell } from 'lucide-react'

const Navbar = () => {
  const { user, logout, isAuthenticated, theme, toggleTheme } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  if (!isAuthenticated) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdminOrManager = ['Administrator', 'Security Manager'].includes(user.role.name)

  const isActive = (path) => location.pathname === path

  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => navigate('/')}>
        <div style={styles.logoBadge}>
          <Shield size={20} style={{ color: '#4f46e5' }} />
        </div>
        <span style={styles.brandText}>InsiderThreat.AI</span>
      </div>
      
      <div style={styles.links}>
        <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.activeLink : {}) }}>
          <Shield size={16} /> Dashboard
        </Link>
        <Link to="/risk-analytics" style={{ ...styles.link, ...(isActive('/risk-analytics') ? styles.activeLink : {}) }}>
          <Activity size={16} /> Risk Analytics & UEBA
        </Link>
        <Link to="/investigations" style={{ ...styles.link, ...(isActive('/investigations') ? styles.activeLink : {}) }}>
          <PlusCircle size={16} /> Threat Investigations
        </Link>
        <Link to="/analytics" style={{ ...styles.link, ...(isActive('/analytics') ? styles.activeLink : {}) }}>
          <Activity size={16} /> Anomaly Cockpit
        </Link>
        <Link to="/employees" style={{ ...styles.link, ...(isActive('/employees') ? styles.activeLink : {}) }}>
          <Users size={16} /> Employees
        </Link>
        <Link to="/activities" style={{ ...styles.link, ...(isActive('/activities') ? styles.activeLink : {}) }}>
          <ClipboardList size={16} /> Activity Logs
        </Link>
      </div>

      <div style={styles.userSection}>
        <button onClick={toggleTheme} style={styles.themeBtn} title="Toggle Light/Dark Theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div style={styles.userInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <User size={14} style={{ color: 'var(--accent-blue)' }} />
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
    padding: '0.85rem 2.5rem',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-card)',
    fontFamily: 'Outfit, sans-serif',
    sticky: 'top'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    cursor: 'pointer'
  },
  logoBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    background: 'rgba(79, 70, 229, 0.08)',
    border: '1px solid rgba(79, 70, 229, 0.15)'
  },
  brandText: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: '700',
    fontSize: '1.2rem',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em'
  },
  links: {
    display: 'flex',
    gap: '0.5rem'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    padding: '0.5rem 0.9rem',
    borderRadius: '7px',
    transition: 'all 0.2s ease'
  },
  activeLink: {
    color: 'var(--accent-blue)',
    background: 'rgba(79, 70, 229, 0.08)',
    fontWeight: '600'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem'
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    borderRight: '1px solid var(--border-color)',
    paddingRight: '1.25rem'
  },
  userName: {
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  userRole: {
    color: 'var(--accent-cyan)',
    fontSize: '0.725rem',
    fontWeight: '700',
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
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: '600',
    transition: 'all 0.2s'
  }
}

export default Navbar
