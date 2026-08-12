import React, { useState, useEffect } from 'react';

export default function RiskDashboard({ token, onInvestigateEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Stats Counters
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: 0
  });

  const fetchRiskScores = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/investigations/risk-scores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to retrieve employee risk scoring ledger.");
      const data = await res.json();
      setEmployees(data);

      // Compute statistics distribution
      let crit = 0, h = 0, m = 0, l = 0;
      data.forEach(emp => {
        if (emp.category === 'CRITICAL') crit++;
        else if (emp.category === 'HIGH') h++;
        else if (emp.category === 'MEDIUM') m++;
        else l++;
      });
      
      setStats({
        critical: crit,
        high: h,
        medium: m,
        low: l,
        total: data.length
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/investigations/risk-scores/recalculate', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Risk scores calculation failed.");
      setSuccess(data.message);
      fetchRiskScores();
    } catch (err) {
      setError(err.message);
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRiskScores();
    }
  }, [token]);

  const getScoreBadgeStyle = (category) => {
    switch (category) {
      case 'CRITICAL': return { color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: '1px solid rgba(248, 113, 113, 0.4)' };
      case 'HIGH': return { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)', border: '1px solid rgba(251, 146, 60, 0.4)' };
      case 'MEDIUM': return { color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)', border: '1px solid rgba(250, 204, 21, 0.4)' };
      default: return { color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)' };
    }
  };

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.headerBlock}>
        <div>
          <h2 style={styles.title}>Insider Risk Scoring & Directory Posture</h2>
          <p style={styles.subtitle}>Real-time org threat indices, privilege evaluations, and multi-dimensional risk monitoring</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleRecalculate} 
          disabled={recalculating || loading}
          style={styles.recalcBtn}
        >
          {recalculating ? '🔄 Recalculating scores...' : '⚡ Run Risk Posture Recalculation'}
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}
      {success && <div style={styles.successAlert}>{success}</div>}

      {/* Risk Categories Distribution */}
      <div style={styles.statsGrid}>
        <div className="glass-panel" style={{...styles.statCard, borderColor: 'rgba(248, 113, 113, 0.3)'}}>
          <span style={styles.statLabel}>Critical Risk Accounts</span>
          <span style={{...styles.statVal, color: '#f87171', textShadow: '0 0 10px rgba(248, 113, 113, 0.3)'}}>{stats.critical}</span>
          <div style={styles.statSubText}>Require containment actions</div>
        </div>
        <div className="glass-panel" style={{...styles.statCard, borderColor: 'rgba(251, 146, 60, 0.3)'}}>
          <span style={styles.statLabel}>High Risk Accounts</span>
          <span style={{...styles.statVal, color: '#fb923c', textShadow: '0 0 10px rgba(251, 146, 60, 0.3)'}}>{stats.high}</span>
          <div style={styles.statSubText}>Require active surveillance</div>
        </div>
        <div className="glass-panel" style={styles.statCard}>
          <span style={styles.statLabel}>Medium Risk</span>
          <span style={{...styles.statVal, color: '#facc15'}}>{stats.medium}</span>
          <div style={styles.statSubText}>Minor deviations detected</div>
        </div>
        <div className="glass-panel" style={styles.statCard}>
          <span style={styles.statLabel}>Monitored Directory</span>
          <span style={styles.statVal}>{stats.total}</span>
          <div style={styles.statSubText}>Total active profiles</div>
        </div>
      </div>

      {/* Risk Ledger Table */}
      <div className="glass-panel" style={styles.tablePanel}>
        <h3 style={styles.panelTitle}>Employee Risk Registry</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee ID</th>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Risk Score</th>
                <th style={styles.th}>Risk Category</th>
                <th style={styles.th}>Score Breakdown (Behav / Priv / Data / Access / Hist)</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="8" style={styles.loadingCell}>Loading risk scores posture matrix...</td>
                </tr>
              )}
              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan="8" style={styles.noDataCell}>No employees directory registered. Ingest a dataset folder first.</td>
                </tr>
              )}
              {!loading && employees.map((emp) => {
                const badge = getScoreBadgeStyle(emp.category);
                return (
                  <tr key={emp.employee_id} style={styles.tr}>
                    <td style={styles.td}><strong>{emp.employee_id}</strong></td>
                    <td style={styles.td}>{emp.full_name}</td>
                    <td style={styles.td}>{emp.department}</td>
                    <td style={{ ...styles.td, color: 'var(--text-secondary)' }}>{emp.designation}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.scoreBadge,
                        color: badge.color,
                        background: badge.bg,
                        border: badge.border
                      }}>
                        {emp.score} / 100
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong style={{color: badge.color}}>{emp.category}</strong>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.breakdownGrid}>
                        <span title="Behavioral Anomalies (35%)" style={styles.breakdownItem}>
                          🤖 {emp.breakdown.behavioral_anomalies || 0}%
                        </span>
                        <span title="Privilege Misuse (25%)" style={styles.breakdownItem}>
                          👑 {emp.breakdown.privilege_misuse || 0}%
                        </span>
                        <span title="Data Access Violations (20%)" style={styles.breakdownItem}>
                          💾 {emp.breakdown.data_access_violations || 0}%
                        </span>
                        <span title="Access Pattern Deviations (10%)" style={styles.breakdownItem}>
                          🌐 {emp.breakdown.access_pattern_deviations || 0}%
                        </span>
                        <span title="Historical Events (10%)" style={styles.breakdownItem}>
                          📜 {emp.breakdown.historical_security_events || 0}%
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => onInvestigateEmployee(emp.employee_id)}
                        style={styles.actionBtn}
                      >
                        🔍 Forensic Audit
                      </button>
                    </td>
                  </tr>
                );
              })}
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
  recalcBtn: {
    padding: '10px 20px',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  statCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  statLabel: {
    fontSize: '12px',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  statVal: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#fff'
  },
  statSubText: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginTop: 'auto'
  },
  tablePanel: {
    padding: '24px'
  },
  panelTitle: {
    fontSize: '16px',
    color: '#fff',
    fontWeight: '600',
    marginBottom: '20px'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px'
  },
  th: {
    textAlign: 'left',
    color: 'var(--text-secondary)',
    padding: '12px',
    borderBottom: '1px solid var(--panel-border)',
    fontWeight: '600',
    background: 'rgba(7, 10, 19, 0.4)'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    color: 'var(--text-primary)',
    verticalAlign: 'middle'
  },
  tr: {
    transition: 'background 0.2s',
    cursor: 'default'
  },
  scoreBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '12px',
    display: 'inline-block'
  },
  breakdownGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 12px'
  },
  breakdownItem: {
    fontSize: '11px',
    background: 'rgba(255,255,255,0.02)',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.05)',
    cursor: 'help'
  },
  actionBtn: {
    padding: '6px 12px',
    fontSize: '12px'
  },
  loadingCell: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--accent-cyan)'
  },
  noDataCell: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--text-muted)',
    fontStyle: 'italic'
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
