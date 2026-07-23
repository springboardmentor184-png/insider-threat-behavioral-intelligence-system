import React, { useState, useEffect } from 'react'
import { 
  Activity, AlertTriangle, RefreshCw, CheckCircle, ShieldAlert, 
  Cpu, Users, Filter, ArrowUpRight, Search, Eye
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const AnalyticsCockpit = () => {
  const [anomalies, setAnomalies] = useState([])
  const [baselines, setBaselines] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [scanMessage, setScanMessage] = useState('')
  const navigate = useNavigate()

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const [anomRes, baseRes, sumRes] = await Promise.all([
        api.get('/analytics/anomalies', { params: { status_filter: statusFilter, severity_filter: severityFilter } }),
        api.get('/analytics/baselines'),
        api.get('/analytics/summary')
      ])
      setAnomalies(anomRes.data)
      setBaselines(baseRes.data)
      setSummary(sumRes.data)
    } catch (err) {
      console.error("Failed to load analytics data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [statusFilter, severityFilter])

  const handleRunScan = async () => {
    setScanning(true)
    setScanMessage('')
    try {
      const res = await api.post('/analytics/recalculate')
      setScanMessage(`Scan complete: ${res.data.metrics.baselines_updated} baselines calculated, ${res.data.metrics.anomalies_created} new anomalies flagged.`)
      await fetchAnalyticsData()
    } catch (err) {
      setScanMessage("Failed to execute behavioral scan.")
    } finally {
      setScanning(false)
    }
  }

  const handleUpdateStatus = async (anomalyId, newStatus) => {
    try {
      await api.put(`/analytics/anomalies/${anomalyId}/status`, { status: newStatus })
      fetchAnalyticsData()
    } catch (err) {
      alert("Failed to update status")
    }
  }

  if (loading && !anomalies.length) {
    return (
      <div style={{ color: '#94a3b8', padding: '3rem', textAlign: 'center' }}>
        <h2>Loading Behavioral Analytics Engine...</h2>
      </div>
    )
  }

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'Space Grotesk', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity style={{ color: '#06b6d4' }} /> BEHAVIORAL ANALYTICS & ANOMALY COCKPIT
          </h1>
          <p style={{ color: '#94a3b8' }}>
            Scikit-Learn IsolationForest outlier detection & time-series behavioral baselines
          </p>
        </div>

        <button 
          onClick={handleRunScan} 
          className="btn btn-primary" 
          disabled={scanning}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
        >
          <RefreshCw size={18} className={scanning ? 'spinner' : ''} />
          {scanning ? 'Running ML Anomaly Scan...' : 'Trigger ML Behavioral Scan'}
        </button>
      </div>

      {scanMessage && (
        <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
          {scanMessage}
        </div>
      )}

      {/* Summary Metric Cards */}
      {summary && (
        <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Total Flagged Anomalies</span>
              <div className="stat-value" style={{ color: '#ef4444' }}>{summary.total_anomalies}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <AlertTriangle size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">Open Triage Queue</span>
              <div className="stat-value" style={{ color: '#f59e0b' }}>{summary.open_anomalies}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <ShieldAlert size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">High / Critical Threats</span>
              <div className="stat-value" style={{ color: '#b91c1c' }}>
                {(summary.severity_distribution.Critical || 0) + (summary.severity_distribution.High || 0)}
              </div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(185, 28, 28, 0.1)', color: '#b91c1c' }}>
              <Activity size={24} />
            </div>
          </div>

          <div className="glass-card stat-card">
            <div>
              <span className="stat-label">ML Model Engine</span>
              <div className="stat-value" style={{ color: '#10b981', fontSize: '1.25rem', marginTop: '0.5rem' }}>
                IsolationForest (Ready)
              </div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Cpu size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout: Anomalies Triage Panel & Behavioral Baselines */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Anomalies List */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} /> Detected Behavioral Anomalies
            </h3>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Triaged">Triaged</option>
                <option value="Closed">Closed</option>
              </select>

              <select 
                value={severityFilter} 
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{ backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
              >
                <option value="">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Employee / Subject</th>
                  <th>Anomaly Category</th>
                  <th>Severity</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No anomalies flagged for current filter selection.
                    </td>
                  </tr>
                ) : (
                  anomalies.map(anom => (
                    <tr key={anom.id}>
                      <td style={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
                        {new Date(anom.created_at).toLocaleTimeString()}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {anom.employee ? (
                          <Link to={`/employees/${anom.employee.id}`} style={{ color: '#f8fafc', textDecoration: 'none' }}>
                            {anom.employee.name}
                          </Link>
                        ) : 'System Entity'}
                      </td>
                      <td>
                        <span style={{ fontWeight: '500' }}>{anom.category}</span>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                          {anom.description}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${anom.severity.toLowerCase()}`}>
                          {anom.severity}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold', color: anom.anomaly_score > 0.8 ? '#ef4444' : '#f59e0b' }}>
                        {anom.anomaly_score}
                      </td>
                      <td>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: anom.status === 'Open' ? 'rgba(239, 68, 68, 0.15)' : anom.status === 'Triaged' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: anom.status === 'Open' ? '#ef4444' : anom.status === 'Triaged' ? '#f59e0b' : '#10b981'
                        }}>
                          {anom.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          {anom.status === 'Open' && (
                            <button 
                              onClick={() => handleUpdateStatus(anom.id, 'Triaged')}
                              className="btn btn-secondary" 
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}
                            >
                              Triage
                            </button>
                          )}
                          {anom.status !== 'Closed' && (
                            <button 
                              onClick={() => handleUpdateStatus(anom.id, 'Closed')}
                              className="btn btn-secondary" 
                              style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: '#10b981' }}
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Behavioral Baselines Panel */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Employee Baselines
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '550px', overflowY: 'auto' }}>
            {baselines.map(b => (
              <div 
                key={b.id} 
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.06)', 
                  borderRadius: '8px', 
                  padding: '1rem' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: '#f8fafc' }}>
                    {b.employee ? b.employee.name : `Employee #${b.employee_id}`}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    {b.employee ? b.employee.designation : 'Staff'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                  <div>Daily Logins: <strong style={{ color: '#f8fafc' }}>{b.avg_daily_logins}</strong></div>
                  <div>Off-Hours Ratio: <strong style={{ color: b.after_hours_ratio > 0.3 ? '#f59e0b' : '#f8fafc' }}>{(b.after_hours_ratio * 100).toFixed(0)}%</strong></div>
                  <div>Avg Downloads: <strong style={{ color: '#f8fafc' }}>{b.avg_daily_downloads} MB</strong></div>
                  <div>USB Mounts: <strong style={{ color: b.usb_usage_count > 0 ? '#ef4444' : '#f8fafc' }}>{b.usb_usage_count}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AnalyticsCockpit
