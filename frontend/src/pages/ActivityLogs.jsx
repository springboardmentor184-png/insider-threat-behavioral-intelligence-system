import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { ClipboardList, RefreshCw, Play, Filter, AlertCircle, CheckCircle } from 'lucide-react'

const ActivityLogs = () => {
  const { user } = useContext(AuthContext)
  const [logs, setLogs] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtering
  const [eventTypeFilter, setEventTypeFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')

  // Ingestion Simulator
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [simEventType, setSimEventType] = useState('Login')
  const [simSeverity, setSimSeverity] = useState('Low')
  const [simDetails, setSimDetails] = useState('{"status": "Success", "ip": "192.168.1.55", "auth_method": "Password"}')
  const [simError, setSimError] = useState('')
  const [simSuccess, setSimSuccess] = useState(false)

  const fetchLogs = async () => {
    try {
      let url = '/activities'
      const params = []
      if (eventTypeFilter) params.push(`event_type=${eventTypeFilter}`)
      if (severityFilter) params.push(`severity=${severityFilter}`)
      if (params.length > 0) {
        url += '?' + params.join('&')
      }
      const res = await api.get(url)
      setLogs(res.data)
    } catch (err) {
      console.error("Failed to load logs list", err)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        await fetchLogs()
        const empRes = await api.get('/employees')
        setEmployees(empRes.data)
        if (empRes.data.length > 0) {
          setSelectedEmpId(empRes.data[0].id)
        }
      } catch (err) {
        console.error("Error initializing Activity page", err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [eventTypeFilter, severityFilter])

  const handleSimulateSubmit = async (e) => {
    e.preventDefault()
    setSimError('')
    setSimSuccess(false)
    try {
      let detailsObj
      try {
        detailsObj = JSON.parse(simDetails)
      } catch (err) {
        setSimError("Details body must be valid JSON.")
        return
      }

      const matchingEmp = employees.find(emp => emp.id === parseInt(selectedEmpId))
      const payload = {
        employee_id: parseInt(selectedEmpId),
        event_type: simEventType,
        severity: simSeverity,
        details: detailsObj,
        device_id: matchingEmp && matchingEmp.devices.length > 0 ? matchingEmp.devices[0].id : null
      }

      await api.post('/activities', payload)
      setSimSuccess(true)
      fetchLogs()
    } catch (err) {
      setSimError(err.response?.data?.detail || "Simulation failed. Ingestion requires Administrator or SOC Engineer clearances.")
    }
  }

  // Pre-fill helper based on simulated activity selection
  const handleSimEventSelect = (val) => {
    setSimEventType(val)
    if (val === 'Login') {
      setSimDetails('{"status": "Success", "ip": "192.168.1.55", "auth_method": "Password"}')
      setSimSeverity('Low')
    } else if (val === 'File Access') {
      setSimDetails('{"file_path": "/etc/shadow", "action": "Read"}')
      setSimSeverity('Medium')
    } else if (val === 'File Upload') {
      setSimDetails('{"file_name": "source_code_archive.zip", "size_mb": 115, "destination": "mega.nz"}')
      setSimSeverity('High')
    } else if (val === 'File Download') {
      setSimDetails('{"file_name": "client_leads.csv", "size_mb": 4, "classification": "Confidential"}')
      setSimSeverity('Medium')
    } else if (val === 'USB Usage') {
      setSimDetails('{"action": "Write", "device_label": "EXT_SSD", "files_copied": ["key.json"]}')
      setSimSeverity('Critical')
    } else if (val === 'Network Activity') {
      setSimDetails('{"bytes_sent": 4509122, "destination": "malicious-cc-domain.ru", "port": 9001}')
      setSimSeverity('Critical')
    } else if (val === 'Email Activity') {
      setSimDetails('{"recipient": "personal-inbox@gmail.com", "subject": "Design drafts", "has_attachments": true}')
      setSimSeverity('High')
    }
  }

  const isSocOrAdmin = ['Administrator', 'SOC Engineer'].includes(user.role.name)

  if (loading) {
    return (
      <div style={{ color: '#94a3b8', padding: '3rem', textAlign: 'center' }}>
        <h2>Loading Surveillance Telemetry Logs...</h2>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Space Grotesk', marginBottom: '0.5rem' }}>BEHAVIOR TELEMETRY LOGS</h1>
          <p style={{ color: '#94a3b8' }}>Ingested corporate user actions and endpoint logs.</p>
        </div>
        <button onClick={fetchLogs} className="btn btn-secondary">
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        
        {/* Left: Filter & Logs Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Filters Bar */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
              <Filter size={16} /> <span>Filter Operations:</span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
              <select
                className="form-control"
                style={{ flex: 1, padding: '0.5rem 1rem' }}
                value={eventTypeFilter}
                onChange={(e) => setEventTypeFilter(e.target.value)}
              >
                <option value="">All Event Types</option>
                <option value="Login">Login Events</option>
                <option value="File Access">File Access</option>
                <option value="File Upload">File Upload</option>
                <option value="File Download">File Download</option>
                <option value="USB Usage">USB Usage</option>
                <option value="Network Activity">Network Activity</option>
                <option value="Email Activity">Email Activity</option>
              </select>

              <select
                className="form-control"
                style={{ flex: 1, padding: '0.5rem 1rem' }}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="">All Severities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Employee</th>
                  <th>Device Serial</th>
                  <th>Event Type</th>
                  <th>Severity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td style={{ fontWeight: '500', color: '#f8fafc' }}>
                        {log.employee ? log.employee.name : 'System Event'}
                      </td>
                      <td style={{ fontFamily: 'Space Grotesk', fontSize: '0.85rem' }}>
                        {log.device ? log.device.device_id : 'External / None'}
                      </td>
                      <td>{log.event_type}</td>
                      <td>
                        <span className={`badge badge-${log.severity.toLowerCase()}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', fontFamily: 'monospace', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No behaviors match active filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Log Ingestion Simulator */}
        <div>
          <div className="glass-card" style={{ borderLeft: '4px solid #06b6d4' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', color: '#06b6d4', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={16} /> Telemetry Simulator
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Simulate threat activities and ingest logging telemetry in real-time.
            </p>

            {simError && (
              <div className="alert alert-danger" style={{ padding: '0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem' }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{simError}</span>
              </div>
            )}

            {simSuccess && (
              <div className="alert alert-success" style={{ padding: '0.5rem', fontSize: '0.8rem', display: 'flex', gap: '0.25rem' }}>
                <CheckCircle size={14} style={{ flexShrink: 0 }} />
                <span>Event Ingested successfully.</span>
              </div>
            )}

            <form onSubmit={handleSimulateSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Select Target Employee</label>
                <select
                  className="form-control"
                  style={{ padding: '0.5rem' }}
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employee_id})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Event Type</label>
                <select
                  className="form-control"
                  style={{ padding: '0.5rem' }}
                  value={simEventType}
                  onChange={(e) => handleSimEventSelect(e.target.value)}
                >
                  <option value="Login">Login Event</option>
                  <option value="File Access">File Access</option>
                  <option value="File Upload">File Upload</option>
                  <option value="File Download">File Download</option>
                  <option value="USB Usage">USB Usage</option>
                  <option value="Network Activity">Network Activity</option>
                  <option value="Email Activity">Email Activity</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Threat Severity</label>
                <select
                  className="form-control"
                  style={{ padding: '0.5rem' }}
                  value={simSeverity}
                  onChange={(e) => setSimSeverity(e.target.value)}
                >
                  <option value="Low">Low (Standard)</option>
                  <option value="Medium">Medium (Suspicious)</option>
                  <option value="High">High (Policy Violation)</option>
                  <option value="Critical">Critical (Exfiltration)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Details payload (JSON)</label>
                <textarea
                  className="form-control"
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', height: '100px', resize: 'none' }}
                  value={simDetails}
                  onChange={(e) => setSimDetails(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.6rem' }} disabled={!isSocOrAdmin}>
                Simulate Telemetry
              </button>

              {!isSocOrAdmin && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  * Requires SOC Engineer or Admin clearance.
                </p>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ActivityLogs
