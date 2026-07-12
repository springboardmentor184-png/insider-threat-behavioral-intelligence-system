import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import EmployeeManager from './components/EmployeeManager';
import AssetAssociator from './components/AssetAssociator';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('directory'); // directory, audit
  const [loading, setLoading] = useState(false);

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
      <header className="header">
        <div className="container" style={styles.headerFlex}>
          <div style={styles.brandBlock}>
            <span style={styles.logoIcon}>🛡️</span>
            <div>
              <h1 style={styles.brandName}>Insider Threat</h1>
              <p style={styles.brandSubtitle}>Behavioral Intelligence System</p>
            </div>
          </div>

          <nav style={styles.tabNav}>
            <button 
              style={{
                ...styles.navBtn, 
                borderBottom: activeTab === 'directory' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                color: activeTab === 'directory' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('directory')}
            >
              Identity & Profiles
            </button>
            <button 
              style={{
                ...styles.navBtn, 
                borderBottom: activeTab === 'audit' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                color: activeTab === 'audit' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
              }}
              onClick={() => setActiveTab('audit')}
            >
              Security Audit Logs
            </button>
          </nav>

          <div style={styles.userBlock}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{currentUser.full_name}</span>
              {renderRoleBadge(currentUser.role)}
            </div>
            <button className="btn btn-secondary" style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={styles.mainContent}>
        {activeTab === 'directory' ? (
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
        ) : (
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
      </main>

      <footer style={styles.footer}>
        <p>© 2026 Insider Threat Behavioral Intelligence System. Setup Completed: Milestone 1, Day 1 Tasks.</p>
        <p style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
          Primary: PostgreSQL | Secondary: MongoDB | Active Session: JWT (Bearer Auth)
        </p>
      </footer>
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  headerFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  brandBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '32px',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '1.2',
    color: '#fff',
  },
  brandSubtitle: {
    fontSize: '11px',
    color: 'var(--accent-cyan)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  tabNav: {
    display: 'flex',
    gap: '24px',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    padding: '8px 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'var(--font-heading)',
    transition: 'color 0.2s',
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
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
  },
  logoutBtn: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  mainContent: {
    flexGrow: 1,
    paddingTop: '32px',
    paddingBottom: '40px',
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
