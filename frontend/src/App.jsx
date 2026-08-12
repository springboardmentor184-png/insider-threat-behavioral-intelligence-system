import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import EmployeeManager from './components/EmployeeManager';
import AssetAssociator from './components/AssetAssociator';
import ActivityMonitor from './components/ActivityMonitor';
import AnomalyConsole from './components/AnomalyConsole';
import RiskDashboard from './components/RiskDashboard';
import ThreatTimeline from './components/ThreatTimeline';
import IncidentManager from './components/IncidentManager';
import { AdminDashboard, AnalystDashboard, SOCDashboard, ManagerDashboard } from './components/RoleDashboards';
import ExecutiveReports from './components/ExecutiveReports';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, directory, audit, risk, timeline, incidents
  const [selectedInvestigateEmployeeId, setSelectedInvestigateEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/clear-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // Sync token to localStorage
  const handleAuthSuccess = (newToken) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken('');
    setCurrentUser(null);
    setSelectedEmployee(null);
  };

  // Fetch current user details
  const fetchCurrentUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      } else {
        // Token expired or invalid
        handleLogout();
      }
    } catch (err) {
      console.error("Error verifying login session:", err);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error("Error fetching system audit trail:", err);
    }
  };

  // Refresh selected employee details to update devices/assets
  const refreshSelectedEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      const res = await fetch(`/api/employees/${selectedEmployee.employee_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedEmployee(data);
      }
    } catch (err) {
      console.error("Error refreshing selected profile details:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchAuditLogs();
      fetchNotifications();
      // Start background interval polling for system alerts (6s)
      const interval = setInterval(fetchNotifications, 6000);
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  // If not logged in, show Login view
  if (!token || !currentUser) {
    return <Login onAuthSuccess={handleAuthSuccess} />;
  }

  // Render Role Badges in header
  const renderRoleBadge = (role) => {
    const roleClass = 
      role === 'Administrator' ? 'badge-admin' :
      role === 'Security Analyst' ? 'badge-analyst' :
      role === 'SOC Engineer' ? 'badge-soc' : 'badge-manager';
    return <span className={`badge ${roleClass}`}>{role}</span>;
  };

  return (
    <div style={styles.appContainer}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.brandBlock}>
          <span style={styles.logoIcon}>🛡️</span>
          <div>
            <h1 style={styles.brandName}>Insider Threat</h1>
            <p style={styles.brandSubtitle}>Behavioral Intelligence</p>
          </div>
        </div>

        <nav style={styles.sidebarNav}>
          {/* All roles have access to their System Dashboard */}
          <button 
            style={{
              ...styles.sidebarBtn, 
              background: activeTab === 'dashboard' ? 'rgba(0, 242, 254, 0.05)' : 'none',
              color: activeTab === 'dashboard' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderLeft: activeTab === 'dashboard' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
              paddingLeft: activeTab === 'dashboard' ? '12px' : '8px',
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            🖥️ System Dashboard
          </button>

          {/* Identity & Profiles (Administrator only) */}
          {currentUser && currentUser.role === 'Administrator' && (
            <button 
              style={{
                ...styles.sidebarBtn, 
                background: activeTab === 'directory' ? 'rgba(0, 242, 254, 0.05)' : 'none',
                color: activeTab === 'directory' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderLeft: activeTab === 'directory' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                paddingLeft: activeTab === 'directory' ? '12px' : '8px',
              }}
              onClick={() => setActiveTab('directory')}
            >
              📂 Identity & Profiles
            </button>
          )}

          {/* Activity Monitor (All roles) */}
          {currentUser && ['Administrator', 'Security Analyst', 'Security Manager', 'SOC Engineer'].includes(currentUser.role) && (
            <button 
              style={{
                ...styles.sidebarBtn, 
                background: activeTab === 'logs' ? 'rgba(0, 242, 254, 0.05)' : 'none',
                color: activeTab === 'logs' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderLeft: activeTab === 'logs' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                paddingLeft: activeTab === 'logs' ? '12px' : '8px',
              }}
              onClick={() => setActiveTab('logs')}
            >
              📊 Activity Monitor
            </button>
          )}

          {/* Alerts Console (All roles) */}
          {currentUser && ['Administrator', 'Security Analyst', 'Security Manager', 'SOC Engineer'].includes(currentUser.role) && (
            <button 
              style={{
                ...styles.sidebarBtn, 
                background: activeTab === 'anomalies' ? 'rgba(0, 242, 254, 0.05)' : 'none',
                color: activeTab === 'anomalies' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderLeft: activeTab === 'anomalies' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                paddingLeft: activeTab === 'anomalies' ? '12px' : '8px',
              }}
              onClick={() => setActiveTab('anomalies')}
            >
              🧬 Alerts Console
            </button>
          )}

          {/* Risk Dashboard (Admin, Analyst, Manager only) */}
          {currentUser && ['Administrator', 'Security Analyst', 'Security Manager'].includes(currentUser.role) && (
            <button 
              style={{
                ...styles.sidebarBtn, 
                background: activeTab === 'risk' ? 'rgba(0, 242, 254, 0.05)' : 'none',
                color: activeTab === 'risk' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderLeft: activeTab === 'risk' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                paddingLeft: activeTab === 'risk' ? '12px' : '8px',
              }}
              onClick={() => setActiveTab('risk')}
            >
              📈 Risk Dashboard
            </button>
          )}

          {/* Threat Timeline (Admin, Analyst, SOC only) */}
          {currentUser && ['Administrator', 'Security Analyst', 'SOC Engineer'].includes(currentUser.role) && (
            <button 
              style={{
                ...styles.sidebarBtn, 
                background: activeTab === 'timeline' ? 'rgba(0, 242, 254, 0.05)' : 'none',
                color: activeTab === 'timeline' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderLeft: activeTab === 'timeline' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                paddingLeft: activeTab === 'timeline' ? '12px' : '8px',
              }}
              onClick={() => setActiveTab('timeline')}
            >
              🕵️ Threat Timeline
            </button>
          )}

          {/* Incident Manager (All roles) */}
          {currentUser && ['Administrator', 'Security Analyst', 'Security Manager', 'SOC Engineer'].includes(currentUser.role) && (
            <button 
              style={{
                ...styles.sidebarBtn, 
                background: activeTab === 'incidents' ? 'rgba(0, 242, 254, 0.05)' : 'none',
                color: activeTab === 'incidents' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderLeft: activeTab === 'incidents' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                paddingLeft: activeTab === 'incidents' ? '12px' : '8px',
              }}
              onClick={() => setActiveTab('incidents')}
            >
              🚨 Incident Manager
            </button>
          )}

          {/* Executive Reports (Admin, Manager only) */}
          {currentUser && ['Administrator', 'Security Manager'].includes(currentUser.role) && (
            <button 
              style={{
                ...styles.sidebarBtn, 
                background: activeTab === 'reports' ? 'rgba(0, 242, 254, 0.05)' : 'none',
                color: activeTab === 'reports' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderLeft: activeTab === 'reports' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                paddingLeft: activeTab === 'reports' ? '12px' : '8px',
              }}
              onClick={() => setActiveTab('reports')}
            >
              💼 Executive Reports
            </button>
          )}

          {/* Security Audit Logs (Administrator only) */}
          {currentUser && currentUser.role === 'Administrator' && (
            <button 
              style={{
                ...styles.sidebarBtn, 
                background: activeTab === 'audit' ? 'rgba(0, 242, 254, 0.05)' : 'none',
                color: activeTab === 'audit' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                borderLeft: activeTab === 'audit' ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                paddingLeft: activeTab === 'audit' ? '12px' : '8px',
              }}
              onClick={() => setActiveTab('audit')}
            >
              📜 Security Audit Logs
            </button>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div style={styles.contentLayout}>
        <header style={styles.topBar}>
          {/* Notification Center Bell */}
          <div style={styles.bellWrapper}>
            <button 
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              style={styles.bellBtn}
              title="System Notifications Center"
            >
              🔔
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span style={styles.bellBadge}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="glass-panel" style={styles.notifDropdown}>
                <div style={styles.notifHeader}>
                  <span style={styles.notifTitle}>System Notifications</span>
                  <button 
                    style={styles.clearBtn} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAllNotifications();
                    }}
                  >
                    Clear All
                  </button>
                </div>
                <div style={styles.notifBody}>
                  {notifications.length === 0 ? (
                    <div style={styles.noNotifs}>No notifications.</div>
                  ) : (
                    notifications.map(notif => {
                      let severityColor = '#60a5fa';
                      if (notif.severity === 'CRITICAL') severityColor = '#f87171';
                      else if (notif.severity === 'HIGH') severityColor = '#fb923c';
                      else if (notif.severity === 'MEDIUM') severityColor = '#facc15';
                      return (
                        <div 
                          key={notif._id} 
                          style={{
                            ...styles.notifItem,
                            background: notif.is_read ? 'transparent' : 'rgba(255,255,255,0.02)',
                            borderLeft: `3px solid ${severityColor}`
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif._id);
                          }}
                          title="Click to mark as read"
                        >
                          <div style={styles.notifItemHeader}>
                            <strong style={{color: severityColor}}>{notif.title}</strong>
                            <span style={styles.notifTime}>{new Date(notif.created_at).toLocaleTimeString()}</span>
                          </div>
                          <p style={styles.notifMsg}>{notif.message}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={styles.userBlock}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{currentUser.full_name}</span>
              {renderRoleBadge(currentUser.role)}
            </div>
            <button className="btn btn-secondary" style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main style={styles.mainContent}>
        {activeTab === 'dashboard' && currentUser && (
          <div>
            {currentUser.role === 'Administrator' && <AdminDashboard token={token} />}
            {currentUser.role === 'Security Analyst' && (
              <AnalystDashboard 
                token={token} 
                onInvestigate={(empId) => {
                  setSelectedInvestigateEmployeeId(empId);
                  setActiveTab('timeline');
                }} 
              />
            )}
            {currentUser.role === 'SOC Engineer' && <SOCDashboard token={token} />}
            {currentUser.role === 'Security Manager' && <ManagerDashboard token={token} />}
          </div>
        )}

        {activeTab === 'directory' && (
          <div style={styles.dashboardGrid}>
            <div style={styles.leftCol}>
              <EmployeeManager 
                token={token} 
                currentUser={currentUser} 
                onSelectEmployee={(emp) => setSelectedEmployee(emp)} 
                selectedEmployeeId={selectedEmployee ? selectedEmployee.employee_id : null}
              />
            </div>
            <div style={styles.rightCol}>
              <AssetAssociator 
                token={token} 
                currentUser={currentUser} 
                employee={selectedEmployee} 
                onRefreshEmployee={refreshSelectedEmployee}
              />
            </div>
          </div>
        )}
        
        {activeTab === 'logs' && (
          <ActivityMonitor token={token} />
        )}
        
        {activeTab === 'anomalies' && (
          <AnomalyConsole token={token} currentUser={currentUser} />
        )}

        {activeTab === 'risk' && (
          <RiskDashboard 
            token={token} 
            onInvestigateEmployee={(empId) => {
              setSelectedInvestigateEmployeeId(empId);
              setActiveTab('timeline');
            }} 
          />
        )}

        {activeTab === 'timeline' && (
          <ThreatTimeline 
            token={token} 
            targetEmployeeId={selectedInvestigateEmployeeId} 
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentManager 
            token={token} 
            currentUser={currentUser} 
          />
        )}
        
        {activeTab === 'audit' && (
          <div className="glass-panel fade-in" style={styles.auditPanel}>
            <div style={styles.auditHeader}>
              <h3 style={styles.auditTitle}>Real-time Security Audit Log Ledger</h3>
              <button className="btn btn-secondary" onClick={fetchAuditLogs} style={styles.refreshBtn}>
                🔄 Refresh Logs
              </button>
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Timestamp (UTC)</th>
                    <th style={styles.th}>Security User</th>
                    <th style={styles.th}>Action Performed</th>
                    <th style={styles.th}>Operation Status</th>
                    <th style={styles.th}>Source IP</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={styles.noLogs}>No security logs registered in current session.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} style={styles.tr}>
                        <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={styles.td}>👤 {log.user_email}</td>
                        <td style={styles.td}><code>{log.action}</code></td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            color: log.status.includes('SUCCESS') ? 'var(--color-success)' : 'var(--color-danger)',
                            background: log.status.includes('SUCCESS') ? 'rgba(52, 211, 153, 0.08)' : 'rgba(248, 113, 113, 0.08)'
                          }}>
                            {log.status}
                          </span>
                        </td>
                        <td style={styles.td}>{log.ip_address || '127.0.0.1'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <ExecutiveReports token={token} />
        )}
        </main>

        <footer style={styles.footer}>
          <p>© 2026 Insider Threat Behavioral Intelligence System. Setup Completed: Milestone 3 Completed.</p>
          <p style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
            Primary: PostgreSQL | Secondary: MongoDB | Active Session: JWT (Bearer Auth)
          </p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row',
    background: '#04060a',
  },
  sidebar: {
    width: '260px',
    flexShrink: 0,
    background: '#070a13',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    gap: '30px',
  },
  brandBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  logoIcon: {
    fontSize: '28px',
  },
  brandName: {
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1.2',
    color: '#fff',
  },
  brandSubtitle: {
    fontSize: '10px',
    color: 'var(--accent-cyan)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '2px',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sidebarBtn: {
    background: 'none',
    border: 'none',
    padding: '10px 8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'left',
    borderRadius: '4px',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  contentLayout: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    background: 'rgba(7, 10, 19, 0.2)',
  },
  bellWrapper: {
    position: 'relative',
    marginRight: 'auto',
  },
  bellBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    position: 'relative',
    padding: '4px',
  },
  bellBadge: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    background: 'var(--color-danger)',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '700',
    borderRadius: '10px',
    padding: '1px 5px',
    boxShadow: '0 0 8px var(--color-danger)',
  },
  notifDropdown: {
    position: 'absolute',
    top: '40px',
    left: '0',
    width: '320px',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 999,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  notifHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '8px',
  },
  notifTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent-cyan)',
    fontSize: '10px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  notifBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  noNotifs: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '20px 0',
  },
  notifItem: {
    padding: '8px 10px',
    borderRadius: '4px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    transition: 'background 0.2s',
  },
  notifItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
  },
  notifTime: {
    color: 'var(--text-muted)',
    fontSize: '9px',
  },
  notifMsg: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    lineHeight: '1.3',
  },
  userBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
  },
  logoutBtn: {
    padding: '5px 12px',
    fontSize: '11px',
    fontWeight: '600',
  },
  mainContent: {
    flexGrow: 1,
    padding: '32px',
    overflowY: 'auto',
  },
  dashboardGrid: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '1 1 600px',
    minWidth: '0',
  },
  rightCol: {
    flex: '1 1 400px',
    minWidth: '0',
  },
  auditPanel: {
    padding: '24px',
  },
  auditHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  auditTitle: {
    fontSize: '18px',
    color: '#fff',
    fontWeight: '600',
  },
  refreshBtn: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    color: 'var(--text-secondary)',
    padding: '12px',
    borderBottom: '1px solid var(--panel-border)',
    fontWeight: '600',
  },
  td: {
    padding: '12px',
    color: 'var(--text-primary)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
  },
  tr: {
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.01)',
    }
  },
  noLogs: {
    textAlign: 'center',
    padding: '40px 0',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  footer: {
    borderTop: '1px solid var(--panel-border)',
    padding: '20px 0',
    textAlign: 'center',
    background: 'rgba(7, 10, 19, 0.6)',
    color: 'var(--text-secondary)',
    fontSize: '12px',
  },
};
