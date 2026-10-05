import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { 
  Shield, Users, Laptop, Activity, AlertTriangle, ArrowRight,
  Server, Cpu, CheckCircle2, FileText, Lock, Network, 
  Eye, AlertOctagon, Terminal, Sun, Moon, Edit3, UserX, Save, X, AlertCircle, KeyRound, Download
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { generateExecutiveAuditPDF } from '../utils/pdfGenerator'

const Dashboard = () => {
  const { user, theme, toggleTheme, updateProfile, deleteAccount } = useContext(AuthContext)
  const [employees, setEmployees] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editRoleName, setEditRoleName] = useState('Security Analyst')
  const [editPicUrl, setEditPicUrl] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editConfirmPassword, setEditConfirmPassword] = useState('')
  const [modalError, setModalError] = useState('')
  const [modalSuccess, setModalSuccess] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const presetAvatars = [
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username || 'shankar'}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'shankar'}`,
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.username || 'shankar'}`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user?.username || 'shankar'}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'shankar'}`
  ]

  const handleOpenEditModal = () => {
    setEditFullName(user?.full_name || '')
    setEditEmail(user?.email || '')
    setEditUsername(user?.username || '')
    setEditRoleName(user?.role?.name || 'Security Analyst')
    setEditPicUrl(user?.profile_picture || '')
    setEditPassword('')
    setEditConfirmPassword('')
    setModalError('')
    setModalSuccess('')
    setShowDeleteConfirm(false)
    setShowEditModal(true)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setModalError('')
    setModalSuccess('')

    if (editPassword && editPassword !== editConfirmPassword) {
      setModalError('Passwords do not match.')
      return
    }

    setSaveLoading(true)
    try {
      await updateProfile({
        full_name: editFullName.trim() || null,
        email: editEmail.trim().toLowerCase() || null,
        username: editUsername.trim() || null,
        role_name: editRoleName,
        profile_picture: editPicUrl.trim() || null,
        password: editPassword || null,
        confirm_password: editConfirmPassword || null
      })
      setModalSuccess('Profile updated successfully!')
      setTimeout(() => {
        setShowEditModal(false)
      }, 1200)
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to update profile details.')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDeleteAccountConfirm = async () => {
    setSaveLoading(true)
    try {
      await deleteAccount()
      setShowEditModal(false)
      navigate('/login')
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to delete account.')
      setSaveLoading(false)
    }
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [empRes, actRes] = await Promise.all([
          api.get('/employees'),
          api.get('/activities')
        ])
        setEmployees(empRes.data)
        setActivities(actRes.data)
      } catch (err) {
        console.error("Failed to load dashboard data", err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  const handleDownloadReport = () => {
    generateExecutiveAuditPDF(user, employees, activities)
  };

  if (loading) {
    return (
      <div style={{ color: '#94a3b8', padding: '3rem', textAlign: 'center' }}>
        <h2>Syncing Security Telemetry Data...</h2>
      </div>
    )
  }

  // --- 1. ADMINISTRATOR DASHBOARD ---
  const AdminDashboard = () => {

    return (
      <div>
        <div className="dashboard-grid">
          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">System Health</span>
              <div className="stat-value" style={{ color: '#10b981' }}>99.9%</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Server size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Memory Allocation</span>
              <div className="stat-value">342 MB</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Cpu size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Active Operators</span>
              <div className="stat-value">3 Sessions</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <Users size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Database Status</span>
              <div className="stat-value" style={{ color: '#10b981' }}>ONLINE</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} /> System Audit Logs
            </h3>
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Operator</th>
                    <th>Action</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{new Date().toLocaleTimeString()}</td>
                    <td>admin_operator</td>
                    <td>Accessed Settings Configuration Panel</td>
                    <td><span className="badge badge-low">Success</span></td>
                  </tr>
                  <tr>
                    <td>{new Date(Date.now() - 50000).toLocaleTimeString()}</td>
                    <td>sec_analyst</td>
                    <td>Generated Security Dossier Report</td>
                    <td><span className="badge badge-low">Success</span></td>
                  </tr>
                  <tr>
                    <td>{new Date(Date.now() - 120000).toLocaleTimeString()}</td>
                    <td>soc_engineer</td>
                    <td>Triggered Activity Logs Ingestion Mock</td>
                    <td><span className="badge badge-low">Success</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1rem' }}>Operator Quick Controls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={handleDownloadReport} 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', backgroundColor: '#06b6d4', borderColor: '#06b6d4' }}
              >
                <Download size={16} /> Download Executive Audit (PDF)
              </button>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                Provision New Clearance
              </Link>
              <Link to="/employees" className="btn btn-secondary" style={{ width: '100%' }}>
                System Personnel Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- 2. SECURITY MANAGER DASHBOARD ---
  const SecurityManagerDashboard = () => {
    return (
      <div>
        <div className="dashboard-grid">
          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Org Risk Posture</span>
              <div className="stat-value" style={{ color: '#10b981' }}>LOW</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Shield size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Compliance Index</span>
              <div className="stat-value">98.4%</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
              <FileText size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Active Policies</span>
              <div className="stat-value">12 Enforced</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <Lock size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Active Investigations</span>
              <div className="stat-value" style={{ color: '#f59e0b' }}>2 Open</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: '#06b6d4' }}>
              Organizational Risk & Policy Audits
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Compliance Scope</th>
                    <th>Standard</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Corporate Database Access Controls</td>
                    <td>ISO 27001</td>
                    <td><span className="badge badge-low">Compliant</span></td>
                  </tr>
                  <tr>
                    <td>USB Storage Removable Media Policies</td>
                    <td>SOC 2 Type II</td>
                    <td><span className="badge badge-medium">Warning</span></td>
                  </tr>
                  <tr>
                    <td>Employee Offboarding Asset Disclaimers</td>
                    <td>GDPR Sec 4</td>
                    <td><span className="badge badge-low">Compliant</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1rem' }}>Executive Reports</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={handleDownloadReport}>
                Download Monthly Risk Audit
              </button>
              <button className="btn btn-secondary" onClick={() => alert("Policy overview loaded.")}>
                Configure Security Policies
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- 3. SOC ENGINEER DASHBOARD ---
  const SocDashboard = () => {
    const totalLogs = activities.length
    const uniqueDevices = new Set(employees.flatMap(emp => emp.devices || []).map(d => d.device_id)).size

    return (
      <div>
        <div className="dashboard-grid">
          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Ingested Telemetry</span>
              <div className="stat-value">{totalLogs} events</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <Activity size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Active Sensors</span>
              <div className="stat-value">{uniqueDevices} endpoints</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
              <Laptop size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Active Anomalies</span>
              <div className="stat-value" style={{ color: '#ef4444' }}>4 detected</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Log Ingestion Status</span>
              <div className="stat-value" style={{ color: '#10b981' }}>STABLE</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Network size={24} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '2rem' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'Space Grotesk' }}>Real-time Telemetry Ingestion Queue</h3>
              <Link to="/activities" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Go to Logs Explorer <ArrowRight size={14} />
              </Link>
            </div>
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Sensor Endpoint</th>
                    <th>Telemetry Source</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.slice(0, 4).map(act => (
                    <tr key={act.id}>
                      <td>{new Date(act.timestamp).toLocaleTimeString()}</td>
                      <td>{act.device ? act.device.device_name : 'External Node'}</td>
                      <td>{act.event_type}</td>
                      <td><span className={`badge badge-${act.severity.toLowerCase()}`}>{act.severity}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1rem' }}>Ingestion Config</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/activities" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
                Launch Telemetry Cockpit
              </Link>
              <button className="btn btn-secondary" onClick={() => alert("Sensor agents re-pinged.")}>
                Pings Tracking Sensors
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- 4. SECURITY ANALYST DASHBOARD ---
  const SecurityAnalystDashboard = () => {
    const criticalThreats = activities.filter(a => a.severity === 'Critical' || a.severity === 'High')

    return (
      <div>
        <div className="dashboard-grid">
          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Investigation Queue</span>
              <div className="stat-value" style={{ color: '#ef4444' }}>{criticalThreats.length} Open</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertOctagon size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Threats Triaged</span>
              <div className="stat-value">14 Cases</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Avg Responding Time</span>
              <div className="stat-value">4.2 min</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
              <Activity size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Surveilled Profiles</span>
              <div className="stat-value">{employees.length} Staff</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: '#ef4444' }}>
              Critical Alerts Requiring Triage
            </h3>
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Target Personnel</th>
                    <th>Trigger Event</th>
                    <th>Alert Severity</th>
                    <th>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalThreats.map(threat => (
                    <tr key={threat.id}>
                      <td style={{ fontWeight: '600' }}>{threat.employee ? threat.employee.name : 'Unknown User'}</td>
                      <td>{threat.event_type}</td>
                      <td><span className={`badge badge-${threat.severity.toLowerCase()}`}>{threat.severity}</span></td>
                      <td>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => navigate(`/employees/${threat.employee_id}`)}
                        >
                          <Eye size={12} /> Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk' }}>Analyst Actions</h3>
            <Link to="/employees" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none' }}>
              Review Personnel Risks
            </Link>
            <Link to="/activities" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none' }}>
              Investigate Log Telemetry
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Selector choosing which Dashboard component to render based on User Role
  const renderDashboardByRole = () => {
    switch (user.role.name) {
      case 'Administrator':
        return <AdminDashboard />
      case 'Security Manager':
        return <SecurityManagerDashboard />
      case 'SOC Engineer':
        return <SocDashboard />
      case 'Security Analyst':
      default:
        return <SecurityAnalystDashboard />
    }
  }
  return (
    <div className="main-content">
      {/* Operator Session Info Card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', padding: '1.25rem 1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img 
            src={user.profile_picture || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.username || 'user'}`} 
            alt="Operator Profile" 
            style={{ width: '54px', height: '54px', borderRadius: '50%', border: '2px solid var(--accent-blue)', backgroundColor: 'var(--bg-tertiary)', objectFit: 'cover' }}
          />
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              {user.full_name || 'System Operator'}
            </h2>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>Email: <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong></span>
              <span>Username: <strong style={{ color: 'var(--text-primary)' }}>{user.username || 'N/A'}</strong></span>
              <span>Role: <strong style={{ color: 'var(--accent-blue)' }}>{user.role.name}</strong></span>
              <span>Provider: <span style={{ textTransform: 'capitalize', color: 'var(--accent-blue)' }}><strong>{user.auth_provider}</strong></span></span>
              <span>Registered: <strong style={{ color: 'var(--text-primary)' }}>{new Date(user.created_at).toLocaleDateString()}</strong></span>
              {user.last_login && <span>Last Login: <strong style={{ color: 'var(--text-primary)' }}>{new Date(user.last_login).toLocaleString()}</strong></span>}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={handleDownloadReport} 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#06b6d4', borderColor: '#06b6d4' }}
          >
            <Download size={15} /> Download PDF Audit Report
          </button>

          <button 
            onClick={handleOpenEditModal} 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Edit3 size={15} /> Edit Profile
          </button>

          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'Space Grotesk', marginBottom: '0.5rem' }}>
            {user.role.name.toUpperCase()} CONTROL PANEL
          </h1>
          <p style={{ color: '#94a3b8' }}>
            System views custom-tailored to authorization clearance: <strong>{user.role.name}</strong>
          </p>
        </div>
      </div>

      {renderDashboardByRole()}
      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} style={{ color: 'var(--accent-blue)' }} />
                <h3 style={{ fontFamily: 'Space Grotesk', margin: 0, color: 'var(--text-primary)' }}>Edit Profile & Credentials</h3>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <CheckCircle2 size={16} />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              {/* Profile Avatar Selection */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Profile Picture / Avatar</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                  {presetAvatars.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url}
                      alt="Preset Avatar"
                      onClick={() => setEditPicUrl(url)}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: editPicUrl === url ? '3px solid #06b6d4' : '1px solid var(--border-color)',
                        opacity: editPicUrl === url ? 1 : 0.75,
                        backgroundColor: 'var(--bg-tertiary)'
                      }}
                    />
                  ))}
                </div>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Custom Avatar Image URL (e.g. https://...)" 
                  value={editPicUrl} 
                  onChange={(e) => setEditPicUrl(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control" 
                    value={editFullName} 
                    onChange={(e) => setEditFullName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editUsername} 
                    onChange={(e) => setEditUsername(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Corporate Email</label>
                  <input 
                    type="email" 
                    required 
                    className="form-control" 
                    value={editEmail} 
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Clearance Role</label>
                  <select 
                    className="form-control" 
                    value={editRoleName} 
                    onChange={(e) => setEditRoleName(e.target.value)}
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Security Manager">Security Manager</option>
                    <option value="SOC Engineer">SOC Engineer</option>
                    <option value="Security Analyst">Security Analyst</option>
                  </select>
                </div>
              </div>

              {/* Password Change Fields */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  <KeyRound size={15} style={{ color: 'var(--accent-blue)' }} /> Update Password (Optional)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Leave blank to keep unchanged" 
                      value={editPassword} 
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Confirm new password" 
                      value={editConfirmPassword} 
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons & Delete Account */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                {!showDeleteConfirm ? (
                  <button 
                    type="button" 
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <UserX size={15} /> Delete Account
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>Confirm Permanent Delete?</span>
                    <button 
                      type="button" 
                      onClick={handleDeleteAccountConfirm}
                      className="btn btn-danger"
                      style={{ backgroundColor: '#ef4444', color: '#fff', padding: '0.35rem 0.65rem', fontSize: '0.8rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      disabled={saveLoading}
                    >
                      Yes, Delete
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowEditModal(false)}
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    disabled={saveLoading}
                  >
                    <Save size={15} /> Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.75rem',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
    maxHeight: '90vh',
    overflowY: 'auto'
  }
}

export default Dashboard
