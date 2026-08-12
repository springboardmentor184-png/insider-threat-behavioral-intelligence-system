import React, { useState, useEffect } from 'react';

export default function ThreatTimeline({ token, targetEmployeeId }) {
  const [employeeId, setEmployeeId] = useState(targetEmployeeId || '');
  const [timeline, setTimeline] = useState([]);
  const [ueba, setUeba] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Escalation Modal state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState('HIGH');
  const [escalating, setEscalating] = useState(false);

  const fetchTimelineData = async (empId) => {
    if (!empId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // 1. Fetch chronological timeline
      const timelineRes = await fetch(`/api/investigations/timeline/${empId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!timelineRes.ok) throw new Error("Failed to load timeline events.");
      const timelineData = await timelineRes.json();
      setTimeline(timelineData);

      // 2. Fetch UEBA peer comparison
      const uebaRes = await fetch(`/api/investigations/ueba/peer-comparison/${empId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (uebaRes.ok) {
        const uebaData = await uebaRes.json();
        setUeba(uebaData);
      }

      // 3. Fetch risk trends
      const trendsRes = await fetch(`/api/investigations/risk-scores/trends/${empId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTrends(trendsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetEmployeeId) {
      setEmployeeId(targetEmployeeId);
      fetchTimelineData(targetEmployeeId);
    }
  }, [targetEmployeeId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (employeeId.trim()) {
      fetchTimelineData(employeeId.trim());
    }
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!incidentTitle.trim()) {
      setError("Please specify a case title.");
      return;
    }

    setEscalating(true);
    setError('');
    setSuccess('');

    // Compile evidence alert/log IDs
    const suspiciousLogIds = timeline.filter(l => l.is_suspicious).map(l => l._id);

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee_id: employeeId.trim(),
          title: incidentTitle.trim(),
          description: incidentDesc.trim(),
          severity: incidentSeverity,
          evidence_logs: suspiciousLogIds
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to escalate case.");
      
      setSuccess(`Success: Incident case file ${data.incident_id} generated!`);
      setShowEscalateModal(false);
      setIncidentTitle('');
      setIncidentDesc('');
    } catch (err) {
      setError(err.message);
    } finally {
      setEscalating(false);
    }
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
          <h2 style={styles.title}>Threat Investigation & Forensic Timeline</h2>
          <p style={styles.subtitle}>Chronological audit of digital footprints, exfiltration events, and UEBA peer comparisons</p>
        </div>
        {timeline.length > 0 && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowEscalateModal(true)}
            style={{background: 'var(--color-danger)', borderColor: 'var(--color-danger)'}}
          >
            🚨 Escalate to Incident Case File
          </button>
        )}
      </div>

      {/* Target Search form */}
      <div className="glass-panel" style={styles.searchPanel}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Enter Target Employee ID (e.g. EMP-1002)" 
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" className="btn btn-primary" style={styles.searchBtn}>
            Launch Forensic Audit
          </button>
        </form>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}
      {success && <div style={styles.successAlert}>{success}</div>}

      {/* Peer Comparison and Trend graphs */}
      {ueba && (
        <div style={styles.uebaGrid}>
          {/* Peer Comparison Cards */}
          <div className="glass-panel" style={styles.uebaPanel}>
            <h3 style={styles.panelTitle}>UEBA Peer Activity Comparison</h3>
            <p style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px'}}>
              Comparing daily averages for **{employeeId}** vs. the **{ueba.department}** department baseline averages:
            </p>
            <div style={styles.comparisonList}>
              {Object.keys(ueba.user_metrics).map(key => {
                const userVal = ueba.user_metrics[key];
                const peerVal = ueba.peer_metrics[key];
                const ratio = peerVal > 0 ? (userVal / peerVal).toFixed(1) : userVal;
                const isAnomaly = ratio > 3.0; // 3x average triggers flag
                return (
                  <div key={key} style={styles.comparisonRow}>
                    <div style={styles.comparisonMeta}>
                      <span style={styles.metricName}>{key.toUpperCase()} count/day</span>
                      <div style={styles.metricValues}>
                        <span style={styles.userVal}>{userVal}</span>
                        <span style={styles.divider}>/</span>
                        <span style={styles.peerVal}>{peerVal} (Avg)</span>
                      </div>
                    </div>
                    <div style={styles.comparisonTrackBg}>
                      <div style={{
                        ...styles.comparisonTrackFill,
                        width: `${Math.min(100, (userVal / Math.max(1, userVal + peerVal)) * 100)}%`,
                        background: isAnomaly ? 'var(--color-danger)' : 'var(--accent-cyan)'
                      }}></div>
                    </div>
                    {isAnomaly && (
                      <span style={styles.anomAlert}>⚠️ {ratio}x Peer Average Deviation!</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Trends history */}
          {trends.length > 0 && (
            <div className="glass-panel" style={styles.uebaPanel}>
              <h3 style={styles.panelTitle}>Risk Score History Trend</h3>
              <div style={styles.trendsList}>
                {trends.map(t => {
                  let barColor = '#34d399';
                  if (t.category === 'CRITICAL') barColor = '#f87171';
                  else if (t.category === 'HIGH') barColor = '#fb923c';
                  else if (t.category === 'MEDIUM') barColor = '#facc15';
                  return (
                    <div key={t.date} style={styles.trendRow}>
                      <span style={styles.trendDate}>{t.date}</span>
                      <div style={styles.trendBarBg}>
                        <div style={{
                          ...styles.trendBarFill,
                          width: `${t.score}%`,
                          background: barColor
                        }}></div>
                      </div>
                      <span style={{...styles.trendScore, color: barColor}}>{t.score} ({t.category})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Forensic Timeline Stream */}
      {timeline.length > 0 && (
        <div className="glass-panel" style={styles.timelinePanel}>
          <h3 style={styles.panelTitle}>Forensic Event Timeline Stream</h3>
          <div style={styles.timelineStream}>
            {timeline.map((log, idx) => (
              <div 
                key={log._id} 
                style={{
                  ...styles.timelineNode,
                  borderColor: log.is_suspicious ? 'var(--color-danger)' : 'rgba(255,255,255,0.05)',
                  background: log.is_suspicious ? 'rgba(248, 113, 113, 0.03)' : 'transparent'
                }}
              >
                <div style={styles.nodeHeader}>
                  <span style={styles.nodeTime}>⏳ {new Date(log.timestamp).toLocaleString()}</span>
                  <span style={{
                    ...styles.nodeType,
                    color: log.is_suspicious ? 'var(--color-danger)' : 'var(--accent-cyan)'
                  }}>
                    {getLogIcon(log.activity_type)} {log.activity_type}
                  </span>
                </div>
                <div style={styles.nodeBody}>
                  <div style={styles.nodeDetail}>
                    <strong>Action:</strong> <code>{log.action}</code> | <strong>Device:</strong> {log.device_name} ({log.ip_address})
                  </div>
                  <div style={styles.nodeTarget}>
                    <strong>Asset:</strong> {log.target_asset}
                  </div>
                  {log.is_suspicious && (
                    <div style={styles.nodeWarning}>
                      ⚠️ Suspicious Pattern: {log.additional_metadata?.details || 'Anomalous event sequence matched.'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Escalate Case Modal */}
      {showEscalateModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel" style={styles.modal}>
            <h3 style={styles.modalTitle}>🚨 Escalate to Incident Case File</h3>
            <p style={styles.modalDesc}>
              This will create an official INC-XXXX case file tracking Employee **{employeeId}**'s behavior, and link all flagged logs as forensic evidence.
            </p>
            <form onSubmit={handleEscalateSubmit} style={styles.modalForm}>
              <div className="form-group" style={{width: '100%'}}>
                <label className="form-label">Case Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Unexplained off-hours file copying and Tor use"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  style={{width: '100%'}}
                />
              </div>

              <div className="form-group" style={{width: '100%', marginTop: '12px'}}>
                <label className="form-label">Description / Analyst Assessment</label>
                <textarea 
                  className="form-input" 
                  placeholder="Add details, notes, or immediate concerns..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  rows="4"
                  style={{width: '100%', resize: 'none'}}
                />
              </div>

              <div className="form-group" style={{width: '100%', marginTop: '12px'}}>
                <label className="form-label">Threat Severity Level</label>
                <select 
                  className="form-select"
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value)}
                  style={{width: '100%'}}
                >
                  <option value="CRITICAL">🔴 Critical Threat</option>
                  <option value="HIGH">🟠 High Threat</option>
                  <option value="MEDIUM">🟡 Medium Severity</option>
                  <option value="LOW">🔵 Low Severity</option>
                </select>
              </div>

              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEscalateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={escalating}
                  style={{background: 'var(--color-danger)', borderColor: 'var(--color-danger)'}}
                >
                  {escalating ? 'Generating case file...' : 'Generate Case file'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%'
  },
  headerBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#fff'
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px'
  },
  searchPanel: {
    padding: '16px'
  },
  searchForm: {
    display: 'flex',
    gap: '12px'
  },
  searchInput: {
    flexGrow: 1,
    padding: '10px 14px',
    fontSize: '13px'
  },
  searchBtn: {
    padding: '10px 24px',
    fontWeight: '600'
  },
  uebaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px'
  },
  uebaPanel: {
    padding: '24px'
  },
  panelTitle: {
    fontSize: '15px',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '12px'
  },
  comparisonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  comparisonRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  comparisonMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px'
  },
  metricName: {
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  metricValues: {
    color: '#fff'
  },
  userVal: {
    fontWeight: '700',
    color: 'var(--accent-cyan)'
  },
  divider: {
    margin: '0 4px',
    color: 'var(--text-muted)'
  },
  peerVal: {
    color: 'var(--text-secondary)'
  },
  comparisonTrackBg: {
    width: '100%',
    height: '6px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  comparisonTrackFill: {
    height: '100%',
    borderRadius: '3px'
  },
  anomAlert: {
    fontSize: '10px',
    color: 'var(--color-danger)',
    fontWeight: '700',
    marginTop: '2px'
  },
  trendsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  trendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '12px'
  },
  trendDate: {
    width: '85px',
    color: 'var(--text-secondary)'
  },
  trendBarBg: {
    flexGrow: 1,
    height: '6px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  trendBarFill: {
    height: '100%',
    borderRadius: '3px'
  },
  trendScore: {
    width: '90px',
    textAlign: 'right',
    fontWeight: '700'
  },
  timelinePanel: {
    padding: '24px'
  },
  timelineStream: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderLeft: '2px solid rgba(255,255,255,0.05)',
    paddingLeft: '20px',
    marginLeft: '10px',
    maxHeight: '600px',
    overflowY: 'auto'
  },
  timelineNode: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative'
  },
  nodeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px'
  },
  nodeTime: {
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  nodeType: {
    fontWeight: '700'
  },
  nodeBody: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  nodeDetail: {
    lineHeight: '1.4'
  },
  nodeTarget: {
    color: 'var(--text-secondary)'
  },
  nodeWarning: {
    color: 'var(--color-danger)',
    fontWeight: '700',
    fontSize: '11px',
    background: 'rgba(248, 113, 113, 0.05)',
    padding: '4px 8px',
    borderRadius: '4px',
    marginTop: '4px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(7, 10, 19, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: '20px'
  },
  modal: {
    maxWidth: '500px',
    width: '100%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  modalTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff'
  },
  modalDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '20px'
  },
  errorAlert: {
    background: 'rgba(248, 113, 113, 0.1)',
    border: '1px solid rgba(248, 113, 113, 0.3)',
    borderRadius: '8px',
    color: 'var(--color-danger)',
    padding: '12px',
    fontSize: '13px',
    textAlign: 'center'
  },
  successAlert: {
    background: 'rgba(52, 211, 153, 0.1)',
    border: '1px solid rgba(52, 211, 153, 0.3)',
    borderRadius: '8px',
    color: 'var(--color-success)',
    padding: '12px',
    fontSize: '13px',
    textAlign: 'center'
  }
};
