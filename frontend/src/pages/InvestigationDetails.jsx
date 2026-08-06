import React, { useState, useEffect } from 'react'
import { 
  ShieldAlert, ArrowLeft, User, Shield, HardDrive, Clock, CheckCircle, 
  Plus, Download, UserX, AlertCircle, Activity, Cpu, FileText, Lock
} from 'lucide-react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

const InvestigationDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('Open')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [assignedAnalyst, setAssignedAnalyst] = useState('')
  const [newNoteType, setNewNoteType] = useState('Analyst Note')
  const [newNoteDesc, setNewNoteDesc] = useState('')
  const [feedback, setFeedback] = useState('')

  const fetchCaseDetails = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/investigations/${id}`)
      setDetails(res.data)
      setStatus(res.data.status)
      setResolutionNotes(res.data.resolution_notes || '')
      setAssignedAnalyst(res.data.assigned_analyst_name || '')
    } catch (err) {
      console.error("Failed to load case details", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCaseDetails()
  }, [id])

  const handleUpdateCaseStatus = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/investigations/${id}/status`, {
        status: status,
        assigned_analyst_name: assignedAnalyst,
        resolution_notes: resolutionNotes
      })
      setFeedback("Investigation case status updated successfully!")
      fetchCaseDetails()
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      alert("Failed to update case status")
    }
  }

  const handleAddTimelineNote = async (e) => {
    e.preventDefault()
    if (!newNoteDesc) return
    try {
      await api.post(`/investigations/${id}/timeline`, {
        event_type: newNoteType,
        description: newNoteDesc
      })
      setNewNoteDesc('')
      fetchCaseDetails()
    } catch (err) {
      alert("Failed to add timeline note")
    }
  }

  const handleExportReport = () => {
    if (!details) return
    const textContent = `========================================================
INSIDER THREAT DETAILED INVESTIGATION CASE BRIEF
========================================================
Case Reference   : #CASE-${details.id}
Case Title       : ${details.title}
Created Date     : ${new Date(details.created_at).toLocaleString()}
Severity Level   : ${details.severity}
Case Status      : ${details.status}
Assigned Analyst : ${details.assigned_analyst_name}

--------------------------------------------------------
SUBJECT EMPLOYEE PROFILE:
Name             : ${details.employee ? details.employee.name : 'N/A'}
Employee ID      : ${details.employee ? details.employee.employee_id : 'N/A'}
Corporate Email  : ${details.employee ? details.employee.email : 'N/A'}
Department       : ${details.employee ? details.employee.department : 'N/A'}
Designation      : ${details.employee ? details.employee.designation : 'N/A'}

--------------------------------------------------------
INSIDER RISK SCORE ANALYSIS:
Total Risk Score : ${details.risk_profile ? details.risk_profile.score : 0}/100 (${details.risk_profile ? details.risk_profile.level : 'N/A'})
Risk Explanation : ${details.risk_profile ? details.risk_profile.explanation : 'N/A'}

Weighted Components:
- Behavioral Anomalies (35%) : ${details.risk_profile ? details.risk_profile.components.behavioral_anomaly_score : 0}
- Privilege Misuse (25%)    : ${details.risk_profile ? details.risk_profile.components.privilege_misuse_score : 0}
- Data Access (20%)         : ${details.risk_profile ? details.risk_profile.components.data_access_score : 0}
- Access Patterns (10%)     : ${details.risk_profile ? details.risk_profile.components.access_pattern_score : 0}
- Historical Events (10%)   : ${details.risk_profile ? details.risk_profile.components.historical_event_score : 0}

--------------------------------------------------------
CASE SUMMARY:
${details.summary}

RESOLUTION NOTES:
${details.resolution_notes || 'Investigation active in SOC queue.'}

========================================================`

    const element = document.createElement("a")
    const file = new Blob([textContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `investigation_case_${details.id}_${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading || !details) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2>Loading Deep-Dive Investigation Case Details...</h2>
      </div>
    )
  }

  const { employee, risk_profile, devices, recent_logs, timeline } = details

  return (
    <div className="main-content">
      {/* Top Navigation Back Button */}
      <button 
        onClick={() => navigate('/investigations')}
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Investigations List
      </button>

      {/* Case Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: '700' }}>
              #CASE-{details.id}
            </span>
            <span className={`badge badge-${details.severity.toLowerCase()}`}>
              {details.severity} SEVERITY
            </span>
            <span style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '700',
              backgroundColor: details.status === 'Open' ? '#fee2e2' : details.status === 'In Progress' ? '#fef3c7' : '#d1fae5',
              color: details.status === 'Open' ? '#b91c1c' : details.status === 'In Progress' ? '#b45309' : '#047857'
            }}>
              {details.status}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {details.title}
          </h1>
        </div>

        <button 
          onClick={handleExportReport}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Download size={16} /> Export Case Brief (.txt)
        </button>
      </div>

      {feedback && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {feedback}
        </div>
      )}

      {/* 2-Column Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Left Column: Risk Score & Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Risk Score Gauge & Breakdown */}
          {risk_profile && (
            <div className="glass-card">
              <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} /> Insider Risk Score Breakdown (0-100)
              </h3>

              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {/* Risk Score Circle/Badge */}
                <div style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `4px solid ${risk_profile.score > 75 ? 'var(--color-critical)' : risk_profile.score > 50 ? 'var(--color-danger)' : 'var(--color-warning)'}`,
                  backgroundColor: 'var(--bg-tertiary)'
                }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {risk_profile.score}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    {risk_profile.level}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {risk_profile.explanation}
                  </p>

                  {/* Components Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.775rem', marginTop: '0.75rem' }}>
                    <div>Anomalies (35%): <strong>{risk_profile.components.behavioral_anomaly_score}</strong></div>
                    <div>Privilege (25%): <strong>{risk_profile.components.privilege_misuse_score}</strong></div>
                    <div>Data Access (20%): <strong>{risk_profile.components.data_access_score}</strong></div>
                    <div>Access Pattern (10%): <strong>{risk_profile.components.access_pattern_score}</strong></div>
                    <div>Historical (10%): <strong>{risk_profile.components.historical_event_score}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity & Timeline Correlation */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} /> Event Correlation & Investigation Timeline
            </h3>

            {/* Add Note Form */}
            <form onSubmit={handleAddTimelineNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <select 
                value={newNoteType}
                onChange={(e) => setNewNoteType(e.target.value)}
                className="form-control"
                style={{ width: 'auto', fontSize: '0.8rem' }}
              >
                <option value="Analyst Note">Analyst Note</option>
                <option value="Evidence Added">Evidence Added</option>
                <option value="Interviews">Interview Note</option>
              </select>

              <input 
                type="text"
                placeholder="Add timeline entry or investigation note..."
                value={newNoteDesc}
                onChange={(e) => setNewNoteDesc(e.target.value)}
                className="form-control"
                style={{ flex: 1, fontSize: '0.85rem' }}
              />

              <button type="submit" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Plus size={16} /> Add Note
              </button>
            </form>

            {/* Timeline Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {timeline.map(t => (
                <div key={t.id} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid var(--accent-blue)', paddingLeft: '1rem', paddingBottom: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{t.event_type}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(t.timestamp).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      {t.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Case Workflow & Employee Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Case Workflow Controls */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} /> Analyst Triage Controls
            </h3>

            <form onSubmit={handleUpdateCaseStatus}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Investigation Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Assigned Analyst</label>
                <input 
                  type="text"
                  value={assignedAnalyst}
                  onChange={(e) => setAssignedAnalyst(e.target.value)}
                  className="form-control"
                  placeholder="Analyst Name"
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Resolution / Action Notes</label>
                <textarea 
                  rows="3"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="form-control"
                  placeholder="Record investigation findings or mitigation steps..."
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Update Case Status
              </button>
            </form>
          </div>

          {/* Subject Employee Profile & Device Inventory */}
          {employee && (
            <div className="glass-card">
              <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1rem', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} /> Subject Employee
              </h3>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>Name: <strong style={{ color: 'var(--text-primary)' }}>{employee.name}</strong></div>
                <div>Corporate ID: <strong style={{ color: 'var(--text-primary)' }}>{employee.employee_id}</strong></div>
                <div>Email: <strong style={{ color: 'var(--text-primary)' }}>{employee.email}</strong></div>
                <div>Department: <strong style={{ color: 'var(--text-primary)' }}>{employee.department}</strong></div>
                <div>Designation: <strong style={{ color: 'var(--text-primary)' }}>{employee.designation}</strong></div>
                <div>Privileges: <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>{employee.access_privileges}</span></div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <HardDrive size={14} /> Assigned Hardware Devices
              </h4>
              {devices.map(d => (
                <div key={d.device_id} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{d.device_name} ({d.device_type})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>IP: {d.ip_address} | MAC: {d.mac_address}</div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default InvestigationDetails
