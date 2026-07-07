import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { 
  Shield, Users, Laptop, Activity, AlertTriangle, ArrowRight,
  Server, Cpu, CheckCircle2, FileText, Lock, Network, 
  Eye, AlertOctagon, Terminal
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useContext(AuthContext)
  const [employees, setEmployees] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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
              <button className="btn btn-secondary" onClick={() => alert("Report generation triggered.")}>
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
    </div>
  )
}

export default Dashboard
