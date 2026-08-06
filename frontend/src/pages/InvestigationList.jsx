import React, { useState, useEffect } from 'react'
import { 
  ShieldAlert, Search, Filter, Plus, Eye, User, Calendar, AlertTriangle, CheckCircle, Clock
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const InvestigationList = () => {
  const [cases, setCases] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newEmpId, setNewEmpId] = useState('')
  const [newSeverity, setNewSeverity] = useState('High')
  const [newSummary, setNewSummary] = useState('')

  const navigate = useNavigate()

  const fetchCases = async () => {
    try {
      setLoading(true)
      const [caseRes, empRes] = await Promise.all([
        api.get('/investigations', { params: { status: statusFilter, severity: severityFilter, search: searchTerm } }),
        api.get('/employees')
      ])
      setCases(caseRes.data)
      setEmployees(empRes.data)
    } catch (err) {
      console.error("Failed to load investigation cases", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCases()
  }, [statusFilter, severityFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchCases()
  }

  const handleCreateCase = async (e) => {
    e.preventDefault()
    if (!newEmpId || !newTitle || !newSummary) return alert("Please fill out all case details")

    try {
      const res = await api.post('/investigations', {
        title: newTitle,
        employee_id: parseInt(newEmpId),
        severity: newSeverity,
        summary: newSummary
      })
      setShowModal(false)
      setNewTitle('')
      setNewSummary('')
      fetchCases()
    } catch (err) {
      alert("Failed to initialize investigation case")
    }
  }

  const handleStatusChange = async (caseId, newStatus) => {
    try {
      await api.put(`/investigations/${caseId}/status`, { status: newStatus })
      fetchCases()
    } catch (err) {
      alert("Failed to update case status")
    }
  }

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'Space Grotesk', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
            <ShieldAlert style={{ color: 'var(--accent-blue)' }} /> THREAT INVESTIGATION WORKFLOWS
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Case management, timeline event correlation, analyst triage, and resolution tracking
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem' }}
        >
          <Plus size={18} /> Initialize Investigation Case
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search cases by title or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', paddingRight: '2rem' }}
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>

            <select 
              value={severityFilter} 
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', paddingRight: '2rem' }}
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </form>
      </div>

      {/* Investigation Cases Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Investigation Title</th>
                <th>Subject Employee</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned Analyst</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading threat investigation cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No investigation cases found.
                  </td>
                </tr>
              ) : (
                cases.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: '700', color: 'var(--accent-blue)', whiteSpace: 'nowrap' }}>
                      #CASE-{c.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{c.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Created: {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      {c.employee ? (
                        <div>
                          <div style={{ fontWeight: '600' }}>{c.employee.name}</div>
                          <div style={{ fontSize: '0.775rem', color: 'var(--accent-cyan)' }}>
                            {c.employee.employee_id} ({c.employee.department})
                          </div>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <span className={`badge badge-${c.severity.toLowerCase()}`}>
                        {c.severity}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={c.status}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.775rem',
                          fontWeight: '700',
                          backgroundColor: c.status === 'Open' ? '#fee2e2' : c.status === 'In Progress' ? '#fef3c7' : '#d1fae5',
                          color: c.status === 'Open' ? '#b91c1c' : c.status === 'In Progress' ? '#b45309' : '#047857',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {c.assigned_analyst_name}
                    </td>
                    <td>
                      <button 
                        onClick={() => navigate(`/investigations/${c.id}`)}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Eye size={14} /> Case Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Case Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontFamily: 'Space Grotesk', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Initialize Threat Investigation Case
            </h3>

            <form onSubmit={handleCreateCase}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Case Title</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="e.g. Unauthorized Database Export - John White"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Subject Employee</label>
                <select 
                  className="form-control"
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.employee_id} - {emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Initial Severity</label>
                <select 
                  className="form-control"
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value)}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Case Summary & Background</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  placeholder="Provide investigation rationale..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default InvestigationList
