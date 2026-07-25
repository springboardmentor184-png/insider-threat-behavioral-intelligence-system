import React, { useState, useEffect, useRef } from 'react';

export default function ActivityMonitor({ token }) {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Local dataset ingestion states
  const [folderPath, setFolderPath] = useState('');
  const [ingestStatus, setIngestStatus] = useState({ status: 'IDLE', current_file: '', records_ingested: 0, error: '' });
  const pollingRef = useRef(null);

  // Filter States
  const [selectedType, setSelectedType] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [onlySuspicious, setOnlySuspicious] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/logs/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to load logs summary metrics:", err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    
    let url = '/api/logs/query?limit=50';
    if (selectedType) url += `&activity_type=${selectedType}`;
    if (searchEmployee) url += `&employee_id=${encodeURIComponent(searchEmployee)}`;
    if (onlySuspicious) url += `&is_suspicious=true`;

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to query activity logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkIngestionStatus = async () => {
    try {
      const res = await fetch('/api/logs/ingest-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIngestStatus(data);
        
        if (data.status === 'COMPLETED') {
          clearInterval(pollingRef.current);
          setSuccess("Dataset ingestion completed successfully!");
          fetchSummary();
          fetchLogs();
        } else if (data.status === 'FAILED') {
          clearInterval(pollingRef.current);
          setError(`Ingestion failed: ${data.error}`);
        }
      }
    } catch (err) {
      console.error("Error checking ingestion status:", err);
    }
  };

  const handleTriggerIngest = async (e) => {
    e.preventDefault();
    if (!folderPath.strip) {
      if (!folderPath.trim()) {
        setError("Please enter a valid dataset folder path.");
        return;
      }
    }
    
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/logs/ingest-dataset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder_path: folderPath.trim() })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to start ingestion");
      
      setSuccess("Ingestion started in the background. Monitoring progress...");
      setIngestStatus({ status: 'RUNNING', current_file: 'Starting', records_ingested: 0, error: '' });
      
      // Start polling status every 2 seconds
      if (pollingRef.current) clearInterval(pollingRef.current);
      pollingRef.current = setInterval(checkIngestionStatus, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Pre-seed mock data helper
  const handleSeedDemoData = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/logs/seed-cert', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to trigger seeder");
      
      setSuccess(data.message);
      fetchSummary();
      fetchLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSummary();
      fetchLogs();
      // Check initial status on mount in case an ingestion is already running
      checkIngestionStatus();
    }
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [token, selectedType, onlySuspicious]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'LOGIN': return '🔑';
      case 'FILE_ACCESS': return '📁';
      case 'USB_DEVICE': return '💾';
      case 'EMAIL': return '📧';
      case 'NETWORK': return '🌐';
      case 'APP_USAGE': return '💻';
      case 'PRIVILEGE_CHANGE': return '👑';
      case 'REMOTE_ACCESS': return '📡';
      default: return '📄';
    }
  };

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.headerBlock}>
        <div>
          <h2 style={styles.title}>CERT/LANL Activity Monitoring Console</h2>
          <p style={styles.subtitle}>Real-time user behavior analytics, digital footprints, and exfiltration logs</p>
        </div>
        
        {/* Seed Demo button for quick fallback */}
        <button className="btn btn-secondary" onClick={handleSeedDemoData} style={styles.demoBtn}>
          ⚡ Seed Deterministic Demo Logs (75 items)
        </button>
      </div>

      {/* Real Ingest Control panel */}
      <div className="glass-panel" style={styles.ingestPanel}>
        <h3 style={styles.ingestTitle}>Ingest Local CERT Dataset CSV Folder</h3>
        <p style={styles.ingestDesc}>
          Enter the absolute folder path containing `logon.csv`, `device.csv`, `file.csv`, and `email.csv` on your laptop. 
          The engine will parse and load all records in a background thread, synchronizing your PostgreSQL directory.
        </p>
        <form onSubmit={handleTriggerIngest} style={styles.ingestForm}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g. C:\Users\YourName\Downloads\r4.2" 
            value={folderPath} 
            onChange={(e) => setFolderPath(e.target.value)}
            disabled={ingestStatus.status === 'RUNNING'}
            style={styles.ingestInput}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={ingestStatus.status === 'RUNNING'}
            style={styles.ingestBtn}
          >
            {ingestStatus.status === 'RUNNING' ? 'Parsing Folder...' : 'Ingest Dataset Folder'}
          </button>
        </form>

        {/* Real-time progress bar wrapper */}
        {ingestStatus.status === 'RUNNING' && (
          <div style={styles.progressWrapper}>
            <div style={styles.progressHeader}>
              <span style={styles.progressFile}>📁 Reading: <strong>{ingestStatus.current_file}</strong></span>
              <span style={styles.progressCounts}>{ingestStatus.records_ingested.toLocaleString()} logs imported</span>
            </div>
            <div style={styles.progressBarBg}>
              <div style={styles.progressBarFill}></div>
            </div>
            <div style={styles.progressWarning}>
              ⚠️ Running in background task. Large CSVs may take a few minutes. You can browse other tabs while this imports.
            </div>
          </div>
        )}
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}
      {success && <div style={styles.successAlert}>{success}</div>}

      {/* Summary Stats Panels */}
      {summary && (
        <div style={styles.statsGrid}>
          <div className="glass-panel" style={styles.statCard}>
            <span style={styles.statLabel}>Total Ingested Events</span>
            <span style={styles.statVal}>{summary.total_count.toLocaleString()}</span>
            <div style={styles.statSubText}>MongoDB Logs Ledger</div>
          </div>
          <div className="glass-panel" style={{...styles.statCard, borderColor: 'rgba(248, 113, 113, 0.4)'}}>
            <span style={styles.statLabel} className="text-danger">Suspicious Anomalies</span>
            <span style={{...styles.statVal, color: 'var(--color-danger)', textShadow: '0 0 10px rgba(248, 113, 113, 0.4)'}}>
              {summary.suspicious_count.toLocaleString()}
            </span>
            <div style={styles.statSubText}>Flags requiring audit</div>
          </div>
          <div className="glass-panel" style={styles.statCard}>
            <span style={styles.statLabel}>Tracked Identities</span>
            <span style={styles.statVal}>{summary.unique_employees.toLocaleString()}</span>
            <div style={styles.statSubText}>Monitored profiles in PostgreSQL</div>
          </div>
          <div className="glass-panel" style={styles.statCard}>
            <span style={styles.statLabel}>Total Network Volume</span>
            <span style={styles.statVal}>{formatBytes(summary.total_bytes_transferred)}</span>
            <div style={styles.statSubText}>Exfiltrated / Transferred</div>
          </div>
        </div>
      )}

      {/* Filter and Query Section */}
      <div className="glass-panel" style={styles.filterBar}>
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search Employee ID (e.g. EMP-7082)" 
            value={searchEmployee} 
            onChange={(e) => setSearchEmployee(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" className="btn btn-secondary" style={styles.searchBtn}>
            Search
          </button>
        </form>

        <div style={styles.categoryFilters}>
          <select 
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={styles.selectFilter}
          >
            <option value="">All Activity Types</option>
            <option value="LOGIN">🔑 Logins & Authentications</option>
            <option value="FILE_ACCESS">📁 File Read/Write Operations</option>
            <option value="USB_DEVICE">💾 USB Mass Storage Connects</option>
            <option value="EMAIL">📧 Email Sent Records</option>
            <option value="NETWORK">🌐 Network Transfers</option>
            <option value="APP_USAGE">💻 Application Usage Tracking</option>
            <option value="PRIVILEGE_CHANGE">👑 Privilege Change Events</option>
            <option value="REMOTE_ACCESS">📡 Remote Access Sessions</option>
          </select>

          <label style={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={onlySuspicious} 
              onChange={(e) => setOnlySuspicious(e.target.checked)}
              style={styles.checkbox}
            />
            Show Suspicious Only
          </label>
        </div>
      </div>

      {/* Live Logs Stream */}
      <div className="glass-panel" style={styles.logsPanel}>
        <div style={styles.logsHeader}>
          <h3 style={styles.logsTitle}>Live Ingestion Log Stream</h3>
          <button className="btn btn-secondary" onClick={fetchLogs} style={styles.refreshBtn} disabled={loading}>
            Refresh Grid
          </button>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Timestamp (UTC)</th>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>Source IP/Device</th>
                <th style={styles.th}>Target Asset</th>
                <th style={styles.th}>Details / Warnings</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="7" style={styles.loadingCell}>Querying MongoDB activity logs database...</td>
                </tr>
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan="7" style={styles.noLogs}>No matching activity log footprints registered. Ingest your dataset folder above.</td>
                </tr>
              )}
              {!loading && logs.map((log) => (
                <tr 
                  key={log._id} 
                  style={{
                    ...styles.tr,
                    background: log.is_suspicious ? 'rgba(248, 113, 113, 0.04)' : 'transparent',
                    borderLeft: log.is_suspicious ? '3px solid var(--color-danger)' : '3px solid transparent'
                  }}
                >
                  <td style={styles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={styles.td}><strong>{log.employee_id}</strong></td>
                  <td style={styles.td}>
                    <span style={styles.typeWrapper}>
                      {getLogIcon(log.activity_type)} {log.activity_type}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <code style={styles.code}>{log.action}</code>
                  </td>
                  <td style={styles.td}>
                    <span style={{fontSize: '12px'}}>{log.device_name}</span>
                    <div style={styles.ipText}>{log.ip_address}</div>
                  </td>
                  <td style={styles.td}>{log.target_asset}</td>
                  <td style={styles.td}>
                    {log.is_suspicious ? (
                      <span style={styles.threatBadge}>
                        ⚠️ {log.additional_metadata?.details || 'Suspicious Activity Detected'}
                      </span>
                    ) : (
                      <span style={{color: 'var(--text-muted)'}}>Normal activity log</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  demoBtn: {
    padding: '8px 16px',
    fontSize: '12px',
  },
  ingestPanel: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  ingestTitle: {
    fontSize: '16px',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  ingestDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  },
  ingestForm: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  ingestInput: {
    flexGrow: 1,
    padding: '10px 14px',
    fontSize: '13px',
    background: 'rgba(15, 23, 42, 0.6)',
  },
  ingestBtn: {
    padding: '10px 24px',
    fontWeight: '600',
  },
  progressWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '16px',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.4)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#fff',
  },
  progressFile: {
    color: 'var(--accent-cyan)',
  },
  progressCounts: {
    fontWeight: '600',
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '60%', // Simulated mock fill, keeps shifting/spinning
    height: '100%',
    background: 'var(--accent-cyan)',
    animation: 'loadingProgress 2s infinite ease-in-out',
  },
  progressWarning: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: '4px',
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
  filterBar: {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  searchForm: {
    display: 'flex',
    gap: '8px',
    flex: '1 1 300px',
  },
  searchInput: {
    flexGrow: 1,
    padding: '8px 12px',
    fontSize: '13px',
  },
  searchBtn: {
    padding: '8px 16px',
    fontSize: '13px',
  },
  categoryFilters: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  selectFilter: {
    padding: '8px 12px',
    fontSize: '13px',
    minWidth: '200px',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    cursor: 'pointer',
  },
  logsPanel: {
    padding: '24px',
  },
  logsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  logsTitle: {
    fontSize: '16px',
    color: '#fff',
    fontWeight: '600',
  },
  refreshBtn: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  tableWrapper: {
    overflowX: 'auto',
    maxHeight: '600px',
    overflowY: 'auto',
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
    background: 'rgba(7, 10, 19, 0.4)',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    color: 'var(--text-primary)',
  },
  tr: {
    transition: 'background 0.2s',
  },
  typeWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '500',
  },
  code: {
    fontFamily: 'monospace',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: 'var(--accent-cyan)',
    fontSize: '11px',
  },
  ipText: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  threatBadge: {
    color: 'var(--color-danger)',
    fontWeight: '600',
    fontSize: '12px',
    textShadow: '0 0 10px rgba(248, 113, 113, 0.2)',
  },
  loadingCell: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--accent-cyan)',
  },
  noLogs: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-secondary)',
    fontStyle: 'italic',
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
