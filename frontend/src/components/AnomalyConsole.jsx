import React, { useState, useEffect } from 'react';

export default function AnomalyConsole({ token, currentUser }) {
  const [alerts, setAlerts] = useState([]);
  const [report, setReport] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Baseline inspection state
  const [targetEmployee, setTargetEmployee] = useState('');
  const [baseline, setBaseline] = useState(null);
  const [baselineLoading, setBaselineLoading] = useState(false);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('OPEN'); // Default open alerts

  const fetchReport = async () => {
    try {
      const res = await fetch('/api/anomalies/report', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error("Failed to load anomalies report:", err);
    }
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    let url = `/api/anomalies/?limit=100`;
    if (selectedSeverity) url += `&severity=${selectedSeverity}`;
    if (selectedStatus) url += `&status=${selectedStatus}`;

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load anomalies database");
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSecurityScan = async () => {
    setScanning(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/anomalies/detect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Security scan failed");
      
      setSuccess(data.message);
      fetchReport();
      fetchAlerts();
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const updateAlertStatus = async (alertId, newStatus) => {
    try {
      const res = await fetch(`/api/anomalies/${alertId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update alert");
      
      setSuccess(`Alert marked as ${newStatus.toLowerCase()}`);
      fetchReport();
      fetchAlerts();
    } catch (err) {
      setError(err.message);
    }
  };

  const inspectEmployeeBaseline = async (e) => {
    e.preventDefault();
    if (!targetEmployee) return;
    setBaselineLoading(true);
    setBaseline(null);
    try {
      const res = await fetch(`/api/anomalies/baselines/${targetEmployee}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Baseline not found for user ID");
      const data = await res.json();
      setBaseline(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBaselineLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (alerts.length === 0) {
      setError("No alerts available to export.");
      return;
    }
    const headers = ["Timestamp", "Employee ID", "Alert Type", "Severity", "Description", "Status"];
    const rows = alerts.map(alert => [
      new Date(alert.timestamp).toISOString(),
      alert.employee_id,
      alert.alert_type,
      alert.severity,
      `"${alert.description.replace(/"/g, '""')}"`,
      alert.status
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `insider_threat_alerts_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess("Anomaly report exported successfully!");
  };

  useEffect(() => {
    if (token) {
      fetchReport();
      fetchAlerts();
    }
  }, [token, selectedSeverity, selectedStatus]);

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'CRITICAL': return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', border: 'rgba(248, 113, 113, 0.3)' };
      case 'HIGH': return { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.3)' };
      case 'MEDIUM': return { color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', border: 'rgba(250, 204, 21, 0.3)' };
      default: return { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.3)' };
    }
  };

  // Convert float hour (e.g. 9.25) to human readable string (9:15 AM)
  const formatHour = (hr) => {
    if (hr === null || hr === undefined) return 'N/A';
    const hours = Math.floor(hr);
    const minutes = Math.round((hr - hours) * 60);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <div className="fade-in" style={styles.container}>
      {/* Top Banner Control Block */}
      <div style={styles.headerBlock}>
        <div>
          <h2 style={styles.title}>AI Anomaly Detection & Behavioral Analytics</h2>
          <p style={styles.subtitle}>Unsupervised ML Isolation Forest models & statistical Z-Score baseline profilers</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={triggerSecurityScan} 
          disabled={scanning || loading}
          style={{
            ...styles.scanBtn,
            boxShadow: scanning ? '0 0 20px var(--color-danger)' : 'none'
          }}
        >
          {scanning ? '🧬 Analyzing logs...' : '⚡ Trigger Anomaly Scan'}
        </button>
      </div>

      {scanning && (
        <div style={styles.radarWrapper}>
          <div style={styles.radarPulse}></div>
          <div style={styles.radarLabel}>Scanning logs using Isolation Forest...</div>
        </div>
      )}

      {error && <div style={styles.errorAlert}>{error}</div>}
      {success && <div style={styles.successAlert}>{success}</div>}

      {/* Reports Dashboard */}
      {report && (
        <div style={styles.statsGrid}>
          <div className="glass-panel" style={styles.statCard}>
            <span style={styles.statLabel}>Total Flagged Anomalies</span>
            <span style={styles.statVal}>{report.total_anomalies}</span>
            <div style={styles.statSubText}>Total recorded risk incidents</div>
          </div>
          <div className="glass-panel" style={{...styles.statCard, borderColor: 'rgba(248, 113, 113, 0.4)'}}>
            <span style={styles.statLabel} className="text-danger">Critical Alerts</span>
            <span style={{...styles.statVal, color: 'var(--color-danger)'}}>{report.critical_count}</span>
            <div style={styles.statSubText}>Require immediate containment</div>
          </div>
          <div className="glass-panel" style={{...styles.statCard, borderColor: 'rgba(251, 146, 60, 0.4)'}}>
            <span style={styles.statLabel} style={{color: '#fb923c'}}>High Risk</span>
            <span style={{...styles.statVal, color: '#fb923c'}}>{report.high_count}</span>
            <div style={styles.statSubText}>Unusual multi-dimensional shifts</div>
          </div>
          <div className="glass-panel" style={styles.statCard}>
            <span style={styles.statLabel}>Open Cases</span>
            <span style={styles.statVal}>{report.total_anomalies - report.resolved_count}</span>
            <div style={styles.statSubText}>Awaiting analyst audit</div>
          </div>
        </div>
      )}

      {/* Main Grid: Alerts List & Baseline Inspector */}
      <div style={styles.gridContainer}>
        {/* Left Side: Alerts List */}
        <div className="glass-panel" style={styles.leftCol}>
          <div style={styles.tableHeader}>
            <h3 style={styles.panelTitle}>Behavioral Alert Feed</h3>
            
            {/* Filter controls */}
            <div style={styles.filterGroup}>
              <select 
                className="form-select" 
                value={selectedSeverity} 
                onChange={(e) => setSelectedSeverity(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">🔴 Critical Alerts</option>
                <option value="HIGH">🟠 High Alerts</option>
                <option value="MEDIUM">🟡 Medium Alerts</option>
                <option value="LOW">🔵 Low Alerts</option>
              </select>

              <select 
                className="form-select" 
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="OPEN">⚠️ Open Alerts</option>
                <option value="INVESTIGATING">🔍 Investigating</option>
                <option value="RESOLVED">✅ Resolved</option>
              </select>
              
              <button 
                className="btn btn-secondary" 
                onClick={handleExportCSV}
                style={styles.exportBtn}
                title="Download alerts list as CSV spreadsheet"
              >
                📥 Export CSV
              </button>
            </div>
          </div>

          <div style={styles.alertList}>
            {loading && <div style={styles.loadingCell}>Running analysis check...</div>}
            {!loading && alerts.length === 0 && (
              <div style={styles.noAlerts}>
                No security alerts registered. Try running a new anomaly scan or seeder pipeline.
              </div>
            )}
            {!loading && alerts.map((alert) => {
              const sevStyle = getSeverityColor(alert.severity);
              return (
                <div 
                  key={alert._id} 
                  style={{
                    ...styles.alertCard,
                    borderColor: sevStyle.border,
                    background: `linear-gradient(135deg, ${sevStyle.bg} 0%, rgba(10, 15, 30, 0.4) 100%)`
                  }}
                >
                  <div style={styles.alertHeaderRow}>
                    <span style={{...styles.sevBadge, color: sevStyle.color, border: `1px solid ${sevStyle.border}`}}>
                      {alert.severity}
                    </span>
                    <span style={styles.alertTime}>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <div style={styles.alertMeta}>
                    <strong>Employee:</strong> {alert.employee_id} | <strong>Type:</strong> <code>{alert.alert_type}</code>
                  </div>
                  
                  <p style={styles.alertDesc}>{alert.description}</p>
                  
                  <div style={styles.alertActions}>
                    {alert.status !== 'RESOLVED' ? (
                      <>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => updateAlertStatus(alert._id, 'INVESTIGATING')}
                          disabled={alert.status === 'INVESTIGATING'}
                          style={styles.actionBtn}
                        >
                          🔍 Investigate
                        </button>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => updateAlertStatus(alert._id, 'RESOLVED')}
                          style={{...styles.actionBtn, color: 'var(--color-success)'}}
                        >
                          ✅ Resolve Alert
                        </button>
                      </>
                    ) : (
                      <span style={{color: 'var(--text-muted)', fontSize: '11px'}}>✓ Case closed & containment verified</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Baseline Inspector Card */}
        <div className="glass-panel" style={styles.rightCol}>
          <h3 style={styles.panelTitle}>Identity Baseline Inspector</h3>
          <p style={styles.inspectorSubtitle}>Search employee to extract their calculated normal behavioral profiles</p>
          
          <form onSubmit={inspectEmployeeBaseline} style={styles.inspectorForm}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter Employee ID (e.g. EMP-7082)" 
              value={targetEmployee}
              onChange={(e) => setTargetEmployee(e.target.value.toUpperCase())}
              style={styles.inspectorInput}
            />
            <button type="submit" className="btn btn-secondary" style={styles.inspectorBtn}>
              Analyze
            </button>
          </form>

          {baselineLoading && <div style={styles.baselineLoading}>Compiling behavioral matrix...</div>}
          
          {baseline && (
            <div style={styles.baselineResult} className="fade-in">
              <div style={styles.baselineHeader}>
                <div style={styles.userTitle}>{baseline.employee_id}</div>
                <div style={styles.totalEvents}>Logs Analyzed: {baseline.total_events_analyzed}</div>
              </div>

              <div style={styles.baselineGrid}>
                {/* Login hour baseline */}
                <div style={styles.baselineCard}>
                  <span style={styles.cardIcon}>🔑</span>
                  <div>
                    <div style={styles.cardTitle}>Login Hours</div>
                    <div style={styles.cardVal}>{formatHour(baseline.login_hours.mean)}</div>
                    <div style={styles.cardSub}>Std Deviation: {baseline.login_hours.std} hrs</div>
                  </div>
                </div>

                {/* USB connects daily */}
                <div style={styles.baselineCard}>
                  <span style={styles.cardIcon}>💾</span>
                  <div>
                    <div style={styles.cardTitle}>USB Connections</div>
                    <div style={styles.cardVal}>{baseline.usb_device.mean} / day</div>
                    <div style={styles.cardSub}>Total registered: {baseline.usb_device.count}</div>
                  </div>
                </div>

                {/* File writes daily */}
                <div style={styles.baselineCard}>
                  <span style={styles.cardIcon}>📁</span>
                  <div>
                    <div style={styles.cardTitle}>File Transfers</div>
                    <div style={styles.cardVal}>{baseline.file_access.mean} / day</div>
                    <div style={styles.cardSub}>Total writes: {baseline.file_access.count}</div>
                  </div>
                </div>

                {/* Avg network size */}
                <div style={styles.baselineCard}>
                  <span style={styles.cardIcon}>🌐</span>
                  <div>
                    <div style={styles.cardTitle}>Avg Upload Size</div>
                    <div style={styles.cardVal}>{Math.round(baseline.network_bytes.mean / 1024)} KB</div>
                    <div style={styles.cardSub}>Std Dev: {Math.round(baseline.network_bytes.std / 1024)} KB</div>
                  </div>
                </div>
              </div>

              {/* App usages list */}
              <div style={styles.topListsSection}>
                <div style={styles.listCol}>
                  <h4 style={styles.listTitle}>Top Applications Used</h4>
                  {baseline.top_apps.length === 0 ? (
                    <div style={styles.noListText}>No applications logged</div>
                  ) : (
                    <ul style={styles.listUl}>
                      {baseline.top_apps.map((app, i) => (
                        <li key={i} style={styles.listLi}>
                          <span>💻 {app.app}</span>
                          <span style={styles.listCount}>{app.count} runs</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={styles.listCol}>
                  <h4 style={styles.listTitle}>Frequent Email Targets</h4>
                  {baseline.top_email_recipients.length === 0 ? (
                    <div style={styles.noListText}>No emails logged</div>
                  ) : (
                    <ul style={styles.listUl}>
                      {baseline.top_email_recipients.map((em, i) => (
                        <li key={i} style={styles.listLi}>
                          <span>📧 {em.recipient}</span>
                          <span style={styles.listCount}>{em.count} sent</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
  },
  headerBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  scanBtn: {
    padding: '12px 24px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  radarWrapper: {
    padding: '20px',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px dashed rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  radarPulse: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--color-danger)',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  radarLabel: {
    fontSize: '14px',
    color: '#fff',
    fontWeight: '600',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  statLabel: {
    fontSize: '12px',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  statVal: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#fff',
  },
  statSubText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: 'auto',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftCol: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightCol: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  panelTitle: {
    fontSize: '16px',
    color: '#fff',
    fontWeight: '600',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  filterGroup: {
    display: 'flex',
    gap: '10px',
  },
  filterSelect: {
    padding: '6px 12px',
    fontSize: '12px',
    minWidth: '130px',
  },
  exportBtn: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    maxHeight: '700px',
    overflowY: 'auto',
    paddingRight: '6px',
  },
  alertCard: {
    border: '1px solid',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  alertHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sevBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  alertTime: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  alertMeta: {
    fontSize: '12px',
    color: '#fff',
  },
  alertDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  },
  alertActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '6px',
  },
  actionBtn: {
    padding: '4px 10px',
    fontSize: '11px',
  },
  noAlerts: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
    fontSize: '13px',
  },
  loadingCell: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--accent-cyan)',
    fontSize: '13px',
  },
  inspectorSubtitle: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  inspectorForm: {
    display: 'flex',
    gap: '8px',
  },
  inspectorInput: {
    flexGrow: 1,
    padding: '8px 12px',
    fontSize: '13px',
  },
  inspectorBtn: {
    padding: '8px 16px',
    fontSize: '13px',
  },
  baselineLoading: {
    textAlign: 'center',
    padding: '20px',
    color: 'var(--accent-cyan)',
    fontSize: '12px',
  },
  baselineResult: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: 'rgba(255, 255, 255, 0.01)',
    borderRadius: '10px',
    padding: '16px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  baselineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '10px',
  },
  userTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--accent-cyan)',
  },
  totalEvents: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  baselineGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  baselineCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardIcon: {
    fontSize: '20px',
  },
  cardTitle: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  cardVal: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#fff',
    marginTop: '2px',
  },
  cardSub: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  topListsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '16px',
  },
  listCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listTitle: {
    fontSize: '12px',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  noListText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  listUl: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  listLi: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    background: 'rgba(255,255,255,0.01)',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  listCount: {
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  errorAlert: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    borderRadius: '8px',
    color: 'var(--color-danger)',
    padding: '12px',
    fontSize: '13px',
    textAlign: 'center',
  },
  successAlert: {
    background: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.3)',
    borderRadius: '8px',
    color: 'var(--color-success)',
    padding: '12px',
    fontSize: '13px',
    textAlign: 'center',
  },
};
