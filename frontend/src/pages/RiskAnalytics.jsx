import React, { useState, useEffect } from 'react'
import { 
  ShieldAlert, Activity, Users, AlertTriangle, Cpu, TrendingUp, 
  BarChart2, Shield, Search, Eye, Filter, RefreshCw, CheckCircle, UserX, Bell, AlertCircle, Zap
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { PieChartComponent, BarChartComponent } from '../components/Charts'

const RiskAnalytics = () => {
  const [dashboard, setDashboard] = useState(null)
  const [riskScores, setRiskScores] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [scanningAlerts, setScanningAlerts] = useState(false)
  
  // Risk filters
  const [riskFilter, setRiskFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Alert filters
  const [alertSeverityFilter, setAlertSeverityFilter] = useState('')
  const [alertStatusFilter, setAlertStatusFilter] = useState('')

  const [feedback, setFeedback] = useState('')

  const navigate = useNavigate()

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const [dashRes, scoresRes, alertsRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/risk/scores', { params: { risk_level: riskFilter, search: searchQuery } }),
        api.get('/alerts', { params: { severity: alertSeverityFilter, status: alertStatusFilter } })
      ])
      setDashboard(dashRes.data)
      setRiskScores(scoresRes.data)
      setAlerts(alertsRes.data)
    } catch (err) {
      console.error("Failed to load risk analytics data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [riskFilter, alertSeverityFilter, alertStatusFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchAnalyticsData()
  }

  const handleRecalculateScores = async () => {
    setRecalculating(true)
    setFeedback('')
    try {
      const res = await api.post('/risk/recalculate')
      setFeedback(res.data.message)
      await fetchAnalyticsData()
    } catch (err) {
      setFeedback("Failed to recalculate risk scores.")
    } finally {
      setRecalculating(false)
    }
  }

  const handleTriggerAlertScan = async () => {
    setScanningAlerts(true)
    setFeedback('')
    try {
      const res = await api.post('/alerts/trigger-scan')
      setFeedback(res.data.message)
      await fetchAnalyticsData()
    } catch (err) {
      setFeedback("Failed to trigger alert threshold scan.")
    } finally {
      setScanningAlerts(false)
    }
  }

  const handleAssignAlert = async (alertId) => {
    const analyst = prompt("Enter analyst name to assign this security alert:", "SOC Lead Analyst")
    if (!analyst) return
    try {
      await api.put(`/alerts/${alertId}/assign`, { assigned_analyst_name: analyst, status: "Acknowledged" })
      fetchAnalyticsData()
    } catch (err) {
      alert("Failed to assign alert")
    }
  }

  if (loading && !dashboard) {
    return (
      <div style={{ color: 'var(--text-secondary)', padding: '3rem', textAlign: 'center' }}>
        <h2>Loading Risk Analytics & UEBA Engine...</h2>
      </div>
    )
  }

  const cards = dashboard ? dashboard.cards : {}

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'Space Grotesk', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
            <Activity style={{ color: 'var(--accent-blue)' }} /> INSIDER RISK ANALYTICS, UEBA & ALERT SYSTEM
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            35-25-20-10-10 weighted risk model, peer group comparison, and dynamic automated alert queue
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleTriggerAlertScan} 
            className="btn btn-secondary"
            disabled={scanningAlerts}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Zap size={16} className={scanningAlerts ? 'spinner' : ''} />
            {scanningAlerts ? 'Scanning Alerts...' : 'Trigger Alert Threshold Scan'}
          </button>

          <button 
            onClick={handleRecalculateScores} 
            className="btn btn-primary"
            disabled={recalculating}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={18} className={recalculating ? 'spinner' : ''} />
            {recalculating ? 'Recalculating Risk Scores...' : 'Recalculate Risk Scores'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="alert alert-success" style={{ marginBottom: '2rem' }}>
          {feedback}
        </div>
      )}

      {/* Security Dashboard Cards (10 Core Metrics) */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card stat-card">
          <div>
            <span className="stat-label">Total Monitored Personnel</span>
            <div className="stat-value" style={{ color: 'var(--text-primary)' }}>{cards.total_employees}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--accent-blue)' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <span className="stat-label">Average Insider Risk</span>
            <div className="stat-value" style={{ color: cards.average_risk_score > 50 ? 'var(--color-danger)' : 'var(--accent-cyan)' }}>
              {cards.average_risk_score} / 100
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(2, 132, 199, 0.08)', color: 'var(--accent-cyan)' }}>
            <Activity size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <span className="stat-label">Critical & High Risk</span>
            <div className="stat-value" style={{ color: 'var(--color-critical)' }}>
              {(cards.critical_risk_users || 0) + (cards.high_risk_users || 0)}
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(185, 28, 28, 0.08)', color: 'var(--color-critical)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <span className="stat-label">Open Threat Cases</span>
            <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{cards.open_investigations}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)', color: 'var(--color-warning)' }}>
            <ShieldAlert size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <span className="stat-label">Active Security Alerts</span>
            <div className="stat-value" style={{ color: 'var(--color-critical)' }}>{cards.total_alerts}</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-critical)' }}>
            <Bell size={24} />
          </div>
        </div>
      </div>

      {/* 3-Column Charts Section: Risk Distribution, Department UEBA, Alert Severity Breakdown */}
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* Pie Chart: Risk Classification */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Shield size={18} /> Insider Risk Classification (Pie Chart)
            </h3>

            <PieChartComponent 
              title="Risk Levels"
              data={[
                { label: 'Critical Risk', value: dashboard.risk_distribution["Critical Risk"] || 0, color: 'var(--color-critical)' },
                { label: 'High Risk', value: dashboard.risk_distribution["High Risk"] || 0, color: 'var(--color-danger)' },
                { label: 'Medium Risk', value: dashboard.risk_distribution["Medium Risk"] || 0, color: 'var(--color-warning)' },
                { label: 'Low Risk', value: dashboard.risk_distribution["Low Risk"] || 0, color: 'var(--color-success)' }
              ]}
            />
          </div>

          {/* Bar Graph: Department UEBA Risk Averages */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <BarChart2 size={18} /> Department UEBA Averages (Bar Graph)
            </h3>

            <BarChartComponent 
              height={190}
              data={Object.entries(dashboard.department_risk_comparison).map(([dept, avg]) => ({
                label: dept,
                value: avg,
                color: avg > 70 ? 'var(--color-critical)' : avg > 45 ? 'var(--color-warning)' : 'var(--accent-blue)'
              }))}
            />
          </div>

          {/* Pie Chart: Security Alert Severities */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              <Bell size={18} /> Alert Severity Queue (Pie Chart)
            </h3>

            <PieChartComponent 
              title="Alert Severities"
              data={[
                { label: 'Critical', value: dashboard.alerts_by_severity.Critical || 0, color: 'var(--color-critical)' },
                { label: 'High', value: dashboard.alerts_by_severity.High || 0, color: 'var(--color-danger)' },
                { label: 'Medium', value: dashboard.alerts_by_severity.Medium || 0, color: 'var(--color-warning)' },
                { label: 'Low', value: dashboard.alerts_by_severity.Low || 0, color: 'var(--color-success)' }
              ]}
            />
          </div>

        </div>
      )}

      {/* Monitored Personnel Risk Leaderboard Table */}
      <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Monitored Personnel Risk Leaderboard ({riskScores.length})
          </h3>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text"
                placeholder="Search employee name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ fontSize: '0.85rem' }}
              />
            </form>

            <select 
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: '0.85rem', paddingRight: '2rem' }}
            >
              <option value="">All Risk Levels</option>
              <option value="Critical Risk">Critical Risk</option>
              <option value="High Risk">High Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="Low Risk">Low Risk</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Personnel ID</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Risk Score (0-100)</th>
                <th>Risk Level</th>
                <th>Risk Explanation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {riskScores.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No risk score records found.
                  </td>
                </tr>
              ) : (
                riskScores.slice(0, 15).map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: '700', color: 'var(--accent-blue)', whiteSpace: 'nowrap' }}>
                      {r.employee_code}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{r.name}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{r.email}</div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{r.department}</td>
                    <td style={{ fontSize: '1.1rem', fontWeight: 'bold', color: r.risk_score > 75 ? 'var(--color-critical)' : r.risk_score > 50 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                      {r.risk_score}
                    </td>
                    <td>
                      <span className={`badge badge-${r.risk_level.toLowerCase().split(' ')[0]}`}>
                        {r.risk_level}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                      {r.explanation}
                    </td>
                    <td>
                      <button 
                        onClick={() => navigate('/investigations')}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <ShieldAlert size={14} /> Open Case
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Alert Management Queue Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', color: 'var(--color-critical)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} /> Security Alert Management Queue ({alerts.length})
          </h3>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select 
              value={alertSeverityFilter}
              onChange={(e) => setAlertSeverityFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: '0.85rem', paddingRight: '2rem' }}
            >
              <option value="">All Alert Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select 
              value={alertStatusFilter}
              onChange={(e) => setAlertStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: '0.85rem', paddingRight: '2rem' }}
            >
              <option value="">All Alert Statuses</option>
              <option value="Active">Active</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Employee / Subject</th>
                <th>Severity</th>
                <th>Alert Reason</th>
                <th>Assigned Analyst</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No active security alerts.
                  </td>
                </tr>
              ) : (
                alerts.map(a => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {a.employee ? a.employee.name : 'System'}
                    </td>
                    <td>
                      <span className={`badge badge-${a.severity.toLowerCase()}`}>
                        {a.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '350px' }}>
                      {a.reason}
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {a.assigned_analyst_name}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: a.status === 'Active' ? '#fee2e2' : '#d1fae5',
                        color: a.status === 'Active' ? '#b91c1c' : '#047857'
                      }}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleAssignAlert(a.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.775rem' }}
                      >
                        Assign / Acknowledge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default RiskAnalytics
