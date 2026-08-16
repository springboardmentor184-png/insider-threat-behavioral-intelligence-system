import React, { useState } from 'react';
import { Search, AlertTriangle, AlertOctagon, HelpCircle, RefreshCw } from 'lucide-react';

export default function Alerts({ alerts, loading, onRefresh, onViewIncident }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p style={{ color: '#475569', fontWeight: 600 }}>Syncing active threat log...</p>
      </div>
    );
  }

  // Count severities
  const totalAlerts = alerts.length;
  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const highCount = alerts.filter(a => a.severity === 'High').length;
  const mediumCount = alerts.filter(a => a.severity === 'Medium').length;

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.threat_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSeverity = selectedSeverity === 'All' || alert.severity === selectedSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Security Alerts</h2>
        <p className="page-subtitle">Monitor Critical, High, and Medium insider threat alerts</p>
      </div>

      {/* Mini Cards Row */}
      <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-info">
            <span className="metric-label" style={{ fontSize: '11px' }}>Total Alerts</span>
            <span className="metric-value" style={{ fontSize: '22px' }}>{totalAlerts}</span>
          </div>
          <div className="metric-icon-box total-alerts" style={{ width: '40px', height: '40px' }}>
            <HelpCircle size={18} />
          </div>
        </div>

        <div className="metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-info">
            <span className="metric-label" style={{ fontSize: '11px' }}>Critical</span>
            <span className="metric-value" style={{ fontSize: '22px', color: criticalCount > 0 ? '#ef4444' : '#0f172a' }}>{criticalCount}</span>
          </div>
          <div className="metric-icon-box critical-incidents" style={{ width: '40px', height: '40px' }}>
            <AlertOctagon size={18} />
          </div>
        </div>

        <div className="metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-info">
            <span className="metric-label" style={{ fontSize: '11px' }}>High</span>
            <span className="metric-value" style={{ fontSize: '22px' }}>{highCount}</span>
          </div>
          <div className="metric-icon-box high-risk-users" style={{ width: '40px', height: '40px' }}>
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="metric-card" style={{ padding: '16px 20px' }}>
          <div className="metric-info">
            <span className="metric-label" style={{ fontSize: '11px' }}>Medium</span>
            <span className="metric-value" style={{ fontSize: '22px' }}>{mediumCount}</span>
          </div>
          <div className="metric-icon-box medium-alerts" style={{ width: '40px', height: '40px' }}>
            <AlertTriangle size={18} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="section-card">
        <div className="filter-bar">
          <div className="filter-left">
            <input 
              type="text" 
              className="filter-input" 
              placeholder="Search alerts by employee name, id, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="filter-select"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
          <button className="refresh-btn" onClick={onRefresh}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alert</th>
                <th>Employee</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Risk Score</th>
                <th>Anomaly Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => {
                  let alertTitle = `${alert.severity} Insider Threat Risk`;
                  let anomalyScore = (alert.risk_score / 100).toFixed(4);
                  
                  return (
                    <tr key={alert.id}>
                      <td style={{ maxWidth: '400px' }}>
                        <div className="table-alert-title">{alertTitle}</div>
                        <div className="table-alert-desc">{alert.reason}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{alert.employee_name}</span>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{alert.employee_id}</div>
                      </td>
                      <td>{alert.threat_type}</td>
                      <td>
                        <span className={`badge ${alert.severity.toLowerCase()}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{alert.risk_score.toFixed(2)}</td>
                      <td style={{ fontFamily: 'monospace', color: '#475569' }}>{anomalyScore}</td>
                      <td>
                        <button 
                          className="view-link" 
                          onClick={() => onViewIncident(alert.id)}
                          style={{ background: 'none', border: 'none', padding: 0, font: 'inherit' }}
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                    No alerts found matching current filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
