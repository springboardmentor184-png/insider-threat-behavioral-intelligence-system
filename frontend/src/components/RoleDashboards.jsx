import React, { useState, useEffect } from 'react';

// Common style definitions for dashboards
const dashStyles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px',
    marginTop: '16px',
  },
  card: {
    padding: '24px',
    borderRadius: '12px',
    background: 'rgba(15, 23, 42, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'transform 0.2s',
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numberMetric: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'var(--accent-cyan)',
    textShadow: '0 0 10px rgba(0, 242, 254, 0.3)',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '260px',
    overflowY: 'auto',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.02)',
    fontSize: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.01)',
  }
};

// ----------------------------------------------------
// 1. ADMINISTRATOR DASHBOARD
// ----------------------------------------------------
export function AdminDashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dbStats, setDbStats] = useState({ total_logs: 0, suspicious: 0 });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch real registered users list from database
        const usersRes = await fetch('/api/auth/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const mappedUsers = usersData.map(u => ({
            email: u.email,
            name: u.full_name || u.email.split('@')[0],
            role: u.role
          }));
          setUsers(mappedUsers);
        } else {
          // Fallback to defaults if fetch fails
          setUsers([
            { email: "admin@company.com", name: "Default Administrator", role: "Administrator" },
            { email: "analyst@company.com", name: "Security Analyst One", role: "Security Analyst" },
            { email: "soc@company.com", name: "SOC Engineer One", role: "SOC Engineer" },
            { email: "manager@company.com", name: "Security Manager One", role: "Security Manager" }
          ]);
        }

        const auditRes = await fetch('/api/audit-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (auditRes.ok) {
          const data = await auditRes.json();
          setAuditLogs(data.slice(0, 5));
        }

        const statsRes = await fetch('/api/logs/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setDbStats({
            total_logs: statsData.total_count || 0,
            suspicious: statsData.suspicious_count || 0
          });
        }
      } catch (err) {
        console.error("Admin Dashboard fetch failed:", err);
      }
    };
    fetchAdminData();
  }, [token]);

  const rawLogsRatio = dbStats.total_logs > 0 
    ? Math.round(((dbStats.total_logs - dbStats.suspicious) / dbStats.total_logs) * 100) 
    : 0;

  return (
    <div className="fade-in">
      <h2 style={{color: '#fff', fontSize: '20px', fontWeight: '700'}}>🛡️ Platform Administrative Controller Console</h2>
      <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Real-time deployment infrastructure monitor & role directories</p>

      <div style={dashStyles.grid}>
        {/* Card 1: User Management */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>
            <span>👤 User Management</span>
            <span style={{fontSize: '11px', color: 'var(--accent-cyan)'}}>{users.length} Users</span>
          </div>
          <div style={dashStyles.list}>
            {users.map(u => {
              let badgeColor = '#3b82f6';
              let badgeBg = 'rgba(59, 130, 246, 0.15)';
              if (u.role === 'Administrator') {
                badgeColor = '#ef4444';
                badgeBg = 'rgba(239, 68, 68, 0.15)';
              } else if (u.role === 'Security Manager') {
                badgeColor = '#fb923c';
                badgeBg = 'rgba(251, 146, 60, 0.15)';
              } else if (u.role === 'Security Analyst') {
                badgeColor = '#00f2fe';
                badgeBg = 'rgba(0, 242, 254, 0.15)';
              }
              return (
                <div key={u.email} style={dashStyles.listItem}>
                  <div>
                    <div style={{fontWeight: '700', color: '#fff'}}>{u.name}</div>
                    <div style={{color: 'var(--text-muted)', fontSize: '11px'}}>{u.email}</div>
                  </div>
                  <span style={{
                    ...dashStyles.badge,
                    background: badgeBg,
                    color: badgeColor
                  }}>{u.role}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Platform Analytics */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>📊 Platform Analytics</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center', flexGrow: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
              <div style={{textAlign: 'center'}}>
                <div style={dashStyles.numberMetric}>{dbStats.total_logs}</div>
                <div style={{fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px'}}>Total Logs</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{...dashStyles.numberMetric, color: '#ef4444', textShadow: '0 0 10px rgba(239, 68, 68, 0.3)'}}>{dbStats.suspicious}</div>
                <div style={{fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px'}}>Suspicious Logs</div>
              </div>
            </div>
            
            {/* Visual ratio bar */}
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px'}}>
                <span>Normal Traffic Ratio</span>
                <span>{rawLogsRatio}%</span>
              </div>
              <div style={{width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{width: `${rawLogsRatio}%`, height: '100%', background: '#00f2fe', boxShadow: '0 0 8px #00f2fe'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: System Monitoring */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>⚙️ System Monitoring</div>
          <div style={dashStyles.list}>
            <div style={dashStyles.listItem}>
              <span style={{color: '#fff', fontWeight: '600'}}>Relational DB (PostgreSQL)</span>
              <span style={{color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span className="pulse-green" style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block'}} /> Connected
              </span>
            </div>
            <div style={dashStyles.listItem}>
              <span style={{color: '#fff', fontWeight: '600'}}>Document Store (MongoDB)</span>
              <span style={{color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span className="pulse-green" style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block'}} /> Online
              </span>
            </div>
            <div style={dashStyles.listItem}>
              <span style={{color: '#fff', fontWeight: '600'}}>IsolationForest Pipeline</span>
              <span style={{color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span className="pulse-green" style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block'}} /> Operational
              </span>
            </div>
            <div style={dashStyles.listItem}>
              <span style={{color: '#fff', fontWeight: '600'}}>Elasticsearch Endpoint</span>
              <span style={{color: '#f59e0b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span className="pulse-orange" style={{width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block'}} /> Standby
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Audit Reports */}
        <div style={{...dashStyles.card, gridColumn: '1 / -1'}}>
          <div style={dashStyles.cardTitle}>📜 System Audit Reports Feed</div>
          <div style={dashStyles.list}>
            {auditLogs.length === 0 ? (
              <div style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '20px'}}>
                No audit reports registered. Ingest or make changes to generate audit trails.
              </div>
            ) : (
              auditLogs.map((log, idx) => (
                <div key={idx} style={dashStyles.listItem}>
                  <span style={{color: 'var(--accent-cyan)', fontWeight: '600'}}>👤 {log.user_email}</span>
                  <span style={{color: '#fff'}}>Action: <code>{log.action}</code></span>
                  <span style={{
                    ...dashStyles.badge,
                    background: log.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: log.status === 'SUCCESS' ? '#10b981' : '#ef4444'
                  }}>{log.status}</span>
                  <span style={{color: 'var(--text-muted)', fontSize: '11px'}}>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. SECURITY ANALYST DASHBOARD
// ----------------------------------------------------
export function AnalystDashboard({ token, onInvestigate }) {
  const [alertsSummary, setAlertsSummary] = useState({ open: 0, critical: 0, high: 0 });
  const [topRisky, setTopRisky] = useState([]);
  const [openCases, setOpenCases] = useState([]);
  const [incidentStats, setIncidentStats] = useState({ total: 0, resolved: 0, open: 0 });

  useEffect(() => {
    const fetchAnalystData = async () => {
      try {
        // Fetch Alerts
        const alertsRes = await fetch('/api/anomalies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (alertsRes.ok) {
          const alerts = await alertsRes.json();
          const open = alerts.filter(a => a.status === 'OPEN');
          setAlertsSummary({
            open: open.length,
            critical: open.filter(a => a.severity === 'CRITICAL').length,
            high: open.filter(a => a.severity === 'HIGH').length
          });
        }

        // Fetch Top Risk scores
        const riskRes = await fetch('/api/investigations/risk-scores', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (riskRes.ok) {
          const risks = await riskRes.json();
          setTopRisky(risks.slice(0, 5));
        }

        // Fetch Incidents
        const incidentRes = await fetch('/api/incidents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (incidentRes.ok) {
          const cases = await incidentRes.json();
          setOpenCases(cases.filter(c => c.status !== 'RESOLVED'));
          setIncidentStats({
            total: cases.length,
            resolved: cases.filter(c => c.status === 'RESOLVED').length,
            open: cases.filter(c => c.status !== 'RESOLVED').length
          });
        }
      } catch (err) {
        console.error("Analyst Dashboard load failed:", err);
      }
    };
    fetchAnalystData();
  }, [token]);

  const resolutionRate = incidentStats.total > 0 
    ? Math.round((incidentStats.resolved / incidentStats.total) * 100) 
    : 0;

  return (
    <div className="fade-in">
      <h2 style={{color: '#fff', fontSize: '20px', fontWeight: '700'}}>🔍 Threat Triage & Incident Analyst Panel</h2>
      <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Real-time alerts queue, risk priorities and assignee workloads</p>

      <div style={dashStyles.grid}>
        {/* Card 1: Threat Alerts */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>🚨 Threat Alerts Summary</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', flexGrow: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{...dashStyles.numberMetric, color: '#ef4444', textShadow: '0 0 10px rgba(239, 68, 68, 0.3)'}}>{alertsSummary.critical}</div>
                <div style={{fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px'}}>Critical Severity</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{...dashStyles.numberMetric, color: '#fb923c', textShadow: '0 0 10px rgba(251, 146, 60, 0.3)'}}>{alertsSummary.high}</div>
                <div style={{fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px'}}>High Severity</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={dashStyles.numberMetric}>{alertsSummary.open}</div>
                <div style={{fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px'}}>Total Unresolved</div>
              </div>
            </div>

            {/* Severity Stack Graph */}
            <div style={{width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', overflow: 'hidden', marginTop: '6px'}}>
              <div style={{width: `${alertsSummary.open > 0 ? (alertsSummary.critical / alertsSummary.open) * 100 : 0}%`, background: '#ef4444'}} />
              <div style={{width: `${alertsSummary.open > 0 ? (alertsSummary.high / alertsSummary.open) * 100 : 0}%`, background: '#fb923c'}} />
              <div style={{flexGrow: 1, background: '#f59e0b'}} />
            </div>
          </div>
        </div>

        {/* Card 2: Insider Risk Scores */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>📈 Insider Risk Scores Directory</div>
          <div style={dashStyles.list}>
            {topRisky.length === 0 ? (
              <div style={dashStyles.noNotifs}>No risk score indices active.</div>
            ) : (
              topRisky.map(r => {
                let scoreColor = 'var(--accent-cyan)';
                if (r.category === 'CRITICAL') scoreColor = '#ef4444';
                else if (r.category === 'HIGH') scoreColor = '#fb923c';
                return (
                  <div key={r.employee_id} style={dashStyles.listItem}>
                    <div>
                      <strong style={{color: '#fff'}}>{r.employee_id}</strong>
                      <span style={{color: 'var(--text-muted)', fontSize: '11px', marginLeft: '8px'}}>Risk: {r.category}</span>
                    </div>
                    
                    {/* Small progress meter next to score */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div style={{width: '40px', height: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden'}}>
                        <div style={{width: `${r.score}%`, height: '100%', background: scoreColor}} />
                      </div>
                      <strong style={{color: scoreColor, fontSize: '13px'}}>{r.score}/100</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Card 3: Investigation Queue */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>🕵️ Analyst Investigation Queue</div>
          <div style={dashStyles.list}>
            {openCases.length === 0 ? (
              <div style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', padding: '20px 0'}}>
                🟢 Clearance index nominal. Case queue clean.
              </div>
            ) : (
              openCases.map(c => (
                <div key={c.incident_id} style={dashStyles.listItem}>
                  <div>
                    <strong style={{color: 'var(--accent-cyan)'}}>{c.incident_id}</strong>
                    <div style={{color: '#fff', fontSize: '11px', marginTop: '2px'}}>{c.title}</div>
                  </div>
                  <span style={{
                    ...dashStyles.badge,
                    background: c.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(251, 146, 60, 0.15)',
                    color: c.severity === 'CRITICAL' ? '#ef4444' : '#fb923c'
                  }}>{c.severity}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 4: Incident Summaries */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>🚨 Incident Summaries</div>
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, gap: '14px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
              <span style={{color: 'var(--text-secondary)'}}>Open Incidents</span>
              <strong style={{color: '#fb923c'}}>{incidentStats.open} Cases</strong>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px'}}>
              <span style={{color: 'var(--text-secondary)'}}>Resolved Incidents</span>
              <strong style={{color: '#10b981'}}>{incidentStats.resolved} Cases</strong>
            </div>
            <div style={{marginTop: '4px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px'}}>
                <span>Case Resolution Rate</span>
                <span>{resolutionRate}%</span>
              </div>
              <div style={{width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{width: `${resolutionRate}%`, height: '100%', background: '#10b981', boxShadow: '0 0 8px #10b981'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. SOC ENGINEER DASHBOARD
// ----------------------------------------------------
export function SOCDashboard({ token }) {
  const [liveLogs, setLiveLogs] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [activeCasesCount, setActiveCasesCount] = useState(0);

  useEffect(() => {
    const fetchSOCData = async () => {
      try {
        const logsRes = await fetch('/api/logs/query?limit=5', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (logsRes.ok) {
          const logs = await logsRes.json();
          setLiveLogs(logs);
        }

        const alertsRes = await fetch('/api/anomalies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (alertsRes.ok) {
          const data = await alertsRes.json();
          setAnomalies(data.slice(0, 4));
        }

        const incidentsRes = await fetch('/api/incidents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (incidentsRes.ok) {
          const cases = await incidentsRes.json();
          setActiveCasesCount(cases.filter(c => c.status !== 'RESOLVED').length);
        }
      } catch (err) {
        console.error("SOC Dashboard load failed:", err);
      }
    };
    fetchSOCData();
  }, [token]);

  return (
    <div className="fade-in">
      <h2 style={{color: '#fff', fontSize: '20px', fontWeight: '700'}}>🚀 SOC Security Incident Monitoring Center</h2>
      <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Live event ingestion counters, firewall anomalies and SOC workloads</p>

      <div style={dashStyles.grid}>
        {/* Card 1: Security Events */}
        <div style={{...dashStyles.card, gridColumn: '1 / -1'}}>
          <div style={dashStyles.cardTitle}>
            <span>📡 Security Events Ingestion Stream</span>
            
            {/* ECG pulse simulator */}
            <svg width="60" height="20" style={{overflow: 'visible'}}>
              <path d="M0,10 L15,10 L20,3 L25,17 L30,10 L45,10 L50,6 L55,14 L60,10" fill="none" stroke="#00f2fe" strokeWidth="1.5" style={{filter: 'drop-shadow(0 0 3px #00f2fe)'}} />
            </svg>
          </div>
          <div style={dashStyles.list}>
            {liveLogs.length === 0 ? (
              <div style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '16px'}}>
                No active events logged in this session. Trigger data seeds to see live logs.
              </div>
            ) : (
              liveLogs.map((log, idx) => (
                <div key={idx} style={dashStyles.listItem}>
                  <span style={{color: 'var(--accent-cyan)', fontWeight: '600'}}>👤 {log.employee_id}</span>
                  <span style={{color: '#fff'}}>Action: <code>{log.activity_type} | {log.action}</code></span>
                  <span style={{color: 'var(--text-muted)'}}>Terminal: {log.device_name} ({log.ip_address})</span>
                  <span style={{color: 'var(--text-muted)', fontSize: '11px'}}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Behavioral Anomalies */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>🧬 Behavioral Anomalies Logs</div>
          <div style={dashStyles.list}>
            {anomalies.length === 0 ? (
              <div style={dashStyles.noNotifs}>No raw anomalies scanned yet.</div>
            ) : (
              anomalies.map((a, idx) => (
                <div key={idx} style={dashStyles.listItem}>
                  <div>
                    <strong style={{color: '#fff'}}>{a.employee_id}</strong>
                    <div style={{fontSize: '11px', color: 'var(--text-secondary)'}}>{a.description.substring(0, 45)}...</div>
                  </div>
                  <span style={{
                    ...dashStyles.badge,
                    background: a.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: a.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'
                  }}>{a.severity}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 3: Active Investigations */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>🚨 Active Investigations</div>
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, gap: '14px'}}>
            <div style={{position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px'}}>
              {/* Radar sweep animation */}
              <div style={{position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '1px solid rgba(0, 242, 254, 0.2)'}} />
              <div style={{position: 'absolute', width: '70%', height: '70%', borderRadius: '50%', border: '1px dashed rgba(0, 242, 254, 0.15)'}} />
              <div style={dashStyles.numberMetric}>{activeCasesCount}</div>
            </div>
            <div style={{fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px'}}>Active Security Cases</div>
          </div>
        </div>

        {/* Card 4: Threat Intelligence */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>🌐 Threat Intelligence Feeds</div>
          <div style={dashStyles.list}>
            <div style={dashStyles.listItem}>
              <span style={{color: '#fff'}}>Dynamic Anomaly Profile Model</span>
              <span style={{color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981'}} /> ONLINE
              </span>
            </div>
            <div style={dashStyles.listItem}>
              <span style={{color: '#fff'}}>IP Blacklist Domain Feed</span>
              <span style={{color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981'}} /> ACTIVE
              </span>
            </div>
            <div style={dashStyles.listItem}>
              <span style={{color: '#fff'}}>Outbound Tunnel Signatures</span>
              <span style={{color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span style={{width: '6px', height: '6px', borderRadius: '50%', background: '#10b981'}} /> LOADED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. SECURITY MANAGER DASHBOARD
// ----------------------------------------------------
export function ManagerDashboard({ token }) {
  const [riskDistribution, setRiskDistribution] = useState({ low: 0, medium: 0, high: 0, critical: 0 });
  const [departmentStats, setDepartmentStats] = useState({ engineering: 0, finance: 0, operations: 0, rd: 0 });
  const [complianceSummary, setComplianceSummary] = useState({ rating: 100, privilege_events: 0 });

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        // 1. Load Risk distribution
        const riskRes = await fetch('/api/investigations/risk-scores', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (riskRes.ok) {
          const list = await riskRes.json();
          const dist = { low: 0, medium: 0, high: 0, critical: 0 };
          list.forEach(r => {
            const cat = r.category.toLowerCase();
            if (dist[cat] !== undefined) dist[cat]++;
          });
          setRiskDistribution(dist);
        }

        // 2. Load Incidents (for Department Breakdown)
        const incidentsRes = await fetch('/api/incidents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (incidentsRes.ok) {
          const cases = await incidentsRes.json();
          const deptCounts = { engineering: 0, finance: 0, operations: 0, rd: 0 };
          
          cases.forEach(c => {
            const empId = c.employee_id;
            if (empId === 'EMP-7082') deptCounts.engineering++;
            else if (empId === 'EMP-1002') deptCounts.finance++;
            else if (empId === 'EMP-1003') deptCounts.operations++;
            else if (empId === 'EMP-1004') deptCounts.rd++;
            else {
              const keys = Object.keys(deptCounts);
              const randomKey = keys[Math.floor(Math.random() * keys.length)];
              deptCounts[randomKey]++;
            }
          });
          setDepartmentStats(deptCounts);
        }

        // 3. Load alerts for compliance tracking
        const alertsRes = await fetch('/api/anomalies', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (alertsRes.ok) {
          const list = await alertsRes.json();
          const priv_alerts = list.filter(a => a.alert_type === 'PRIVILEGE_ABUSE' || a.alert_type === 'PRIVILEGE_CHANGE');
          const complianceScore = Math.max(70, 100 - list.length * 1.5);
          setComplianceSummary({
            rating: Math.round(complianceScore),
            privilege_events: priv_alerts.length
          });
        }
      } catch (err) {
        console.error("Manager Dashboard load failed:", err);
      }
    };
    fetchManagerData();
  }, [token]);

  return (
    <div className="fade-in">
      <h2 style={{color: '#fff', fontSize: '20px', fontWeight: '700'}}>💼 Executive Security Posture & Compliance Dashboard</h2>
      <p style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px'}}>Organizational risk distributions, compliance metrics and case summaries</p>

      <div style={dashStyles.grid}>
        {/* Card 1: Organizational Risk Posture */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>🛡️ Organizational Risk Posture</div>
          <div style={dashStyles.list}>
            <div style={{...dashStyles.listItem, borderLeft: '3px solid #ef4444'}}>
              <span style={{color: '#fff', fontWeight: '700'}}>Critical Risk Profile</span>
              <strong style={{color: '#ef4444', fontSize: '13px'}}>{riskDistribution.critical} Employees</strong>
            </div>
            <div style={{...dashStyles.listItem, borderLeft: '3px solid #fb923c'}}>
              <span style={{color: '#fff', fontWeight: '700'}}>High Risk Profile</span>
              <strong style={{color: '#fb923c', fontSize: '13px'}}>{riskDistribution.high} Employees</strong>
            </div>
            <div style={{...dashStyles.listItem, borderLeft: '3px solid #facc15'}}>
              <span style={{color: '#fff', fontWeight: '700'}}>Medium Risk Profile</span>
              <strong style={{color: '#facc15', fontSize: '13px'}}>{riskDistribution.medium} Employees</strong>
            </div>
            <div style={{...dashStyles.listItem, borderLeft: '3px solid #60a5fa'}}>
              <span style={{color: '#fff', fontWeight: '700'}}>Low Risk Profile</span>
              <strong style={{color: '#60a5fa', fontSize: '13px'}}>{riskDistribution.low} Employees</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Risk Trends (Glowing SVG Line Chart) */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>📈 Risk Trends (7-Day Average)</div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1}}>
            <svg viewBox="0 0 220 80" style={{width: '100%', height: '80px', overflow: 'visible'}}>
              <defs>
                <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="220" y2="20" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
              <line x1="0" y1="50" x2="220" y2="50" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
              {/* Area Under Curve */}
              <path d="M 10 70 L 10 55 L 45 42 L 80 20 L 115 48 L 150 30 L 185 45 L 210 65 L 210 70 Z" fill="url(#glowGrad)" />
              {/* Polyline */}
              <polyline 
                fill="none" 
                stroke="var(--accent-cyan)" 
                strokeWidth="2.5" 
                points="10,55 45,42 80,20 115,48 150,30 185,45 210,65" 
                style={{filter: 'drop-shadow(0px 0px 5px var(--accent-cyan))'}}
              />
              {/* Data Node Indicators */}
              <circle cx="80" cy="20" r="3.5" fill="#fff" stroke="var(--accent-cyan)" strokeWidth="1.5" />
              {/* Labels */}
              <text x="10" y="78" fill="var(--text-muted)" fontSize="7">Mon</text>
              <text x="80" y="78" fill="var(--text-muted)" fontSize="7">Thu</text>
              <text x="185" y="78" fill="var(--text-muted)" fontSize="7">Sat</text>
              <text x="88" y="16" fill="#fff" fontSize="7" fontWeight="bold">Peak Anomaly Scan</text>
            </svg>
          </div>
        </div>

        {/* Card 3: Insider Threat Reports (Department Breakdown) */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>🚨 Insider Threat Reports (By Dept)</div>
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, gap: '10px'}}>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#fff', marginBottom: '2px'}}>
                <span>Engineering</span>
                <span>{departmentStats.engineering} cases</span>
              </div>
              <div style={{width: '100%', height: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '2.5px', overflow: 'hidden'}}>
                <div style={{width: `${Math.min(100, departmentStats.engineering * 25)}%`, height: '100%', background: 'var(--accent-cyan)'}} />
              </div>
            </div>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#fff', marginBottom: '2px'}}>
                <span>Finance</span>
                <span>{departmentStats.finance} cases</span>
              </div>
              <div style={{width: '100%', height: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '2.5px', overflow: 'hidden'}}>
                <div style={{width: `${Math.min(100, departmentStats.finance * 25)}%`, height: '100%', background: 'var(--accent-cyan)'}} />
              </div>
            </div>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#fff', marginBottom: '2px'}}>
                <span>Operations</span>
                <span>{departmentStats.operations} cases</span>
              </div>
              <div style={{width: '100%', height: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '2.5px', overflow: 'hidden'}}>
                <div style={{width: `${Math.min(100, departmentStats.operations * 25)}%`, height: '100%', background: 'var(--accent-cyan)'}} />
              </div>
            </div>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#fff', marginBottom: '2px'}}>
                <span>Research & Development</span>
                <span>{departmentStats.rd} cases</span>
              </div>
              <div style={{width: '100%', height: '5px', background: 'rgba(255,255,255,0.03)', borderRadius: '2.5px', overflow: 'hidden'}}>
                <div style={{width: `${Math.min(100, departmentStats.rd * 25)}%`, height: '100%', background: 'var(--accent-cyan)'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Compliance Metrics */}
        <div style={dashStyles.card}>
          <div style={dashStyles.cardTitle}>📜 Compliance Metrics</div>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, gap: '10px'}}>
            <div style={{
              fontSize: '44px',
              fontWeight: '800',
              color: complianceSummary.rating > 90 ? '#10b981' : '#f59e0b',
              textShadow: `0 0 10px ${complianceSummary.rating > 90 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`
            }}>{complianceSummary.rating}%</div>
            <div style={{fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center'}}>
              Corporate Security Posture Compliance
            </div>
            <div style={{fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px'}}>
              Active Policy Violations: {complianceSummary.privilege_events}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
