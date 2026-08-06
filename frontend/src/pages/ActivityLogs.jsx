import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { ClipboardList, RefreshCw, Play, Filter, AlertCircle, CheckCircle, Database, ChevronLeft, ChevronRight, HardDrive, FileText, Mail, Globe, Shield } from 'lucide-react'

const ActivityLogs = () => {
  const { user } = useContext(AuthContext)
  const [logs, setLogs] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filtering & Pagination
  const [eventTypeFilter, setEventTypeFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 25

  // Ingestion Simulator
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [simEventType, setSimEventType] = useState('Logon Event - Logon')
  const [simSeverity, setSimSeverity] = useState('Low')
  const [simDetails, setSimDetails] = useState('{"status": "Success", "workstation": "PC-9921", "action": "Logon", "dataset": "CERT r4.2 logon.csv"}')
  const [simError, setSimError] = useState('')
  const [simSuccess, setSimSuccess] = useState(false)

  const fetchLogs = async () => {
    try {
      setLoading(true)
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
    } finally {
      setLoading(false)
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

  const isSocOrAdmin = ['Administrator', 'SOC Engineer'].includes(user.role.name)

  // Pagination Logic
  const totalPages = Math.ceil(logs.length / pageSize) || 1
  const currentLogs = logs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="main-content">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'Space Grotesk', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
            <ClipboardList style={{ color: 'var(--accent-blue)' }} /> TELEMETRY ACTIVITY LOGS
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Ingested corporate user actions and real-time endpoint surveillance logs
          </p>
        </div>

        <button onClick={fetchLogs} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={16} /> Refresh Log Stream
        </button>
      </div>

      {/* Dataset Integration Banner Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(2, 132, 199, 0.05))', border: '1px solid var(--accent-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
              <Database size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CERT R4.2 INSIDER THREAT DATASET INTEGRATED
              </span>
              <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                1,250 Real Telemetry Records Active in Database
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.775rem' }}>
            <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}>
              🔑 Logon: 350
            </span>
            <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}>
              🔌 USB Devices: 250
            </span>
            <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}>
              📄 File Downloads: 250
            </span>
            <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}>
              ✉️ Email Traffic: 200
            </span>
            <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: '600' }}>
              🌐 Web HTTP: 200
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        
        {/* Left: Filter & Logs Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Filters Bar */}
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <Filter size={16} /> <span style={{ fontWeight: '600' }}>Filter Telemetry:</span>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '220px' }}>
              <select
                className="form-control"
                style={{ flex: 1, fontSize: '0.85rem' }}
                value={eventTypeFilter}
                onChange={(e) => { setEventTypeFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Event Types</option>
                <option value="Logon">Logon Events</option>
                <option value="USB Usage">USB Storage Activity</option>
                <option value="File Download">File Access & Downloads</option>
                <option value="Email Activity">Email Activity</option>
                <option value="Network Activity">Network & Web Browsing</option>
              </select>

              <select
                className="form-control"
                style={{ flex: 1, fontSize: '0.85rem' }}
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {currentLogs.length} of {logs.length} entries
            </div>
          </div>

          {/* Logs Table */}
          <div className="glass-card">
            <div className="table-container">
              <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Employee</th>
                    <th>Device / PC</th>
                    <th>Event Type</th>
                    <th>Severity</th>
                    <th>Dataset Source</th>
                    <th>Details Payload</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Loading surveillance telemetry logs...
                      </td>
                    </tr>
                  ) : currentLogs.length > 0 ? (
                    currentLogs.map((log) => {
                      const datasetSource = log.details ? log.details.dataset : 'CERT r4.2'
                      return (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            {log.employee ? log.employee.name : 'System Event'}
                          </td>
                          <td style={{ fontFamily: 'Space Grotesk', fontSize: '0.825rem' }}>
                            {log.device ? log.device.device_id : (log.details && log.details.workstation) ? log.details.workstation : 'PC-MONITORED'}
                          </td>
                          <td>
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{log.event_type}</span>
                          </td>
                          <td>
                            <span className={`badge badge-${log.severity.toLowerCase()}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.725rem', padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(2, 132, 199, 0.08)', color: 'var(--accent-cyan)', fontWeight: '600', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                              {datasetSource}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', fontFamily: 'monospace', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                            {JSON.stringify(log.details)}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No telemetry logs match active filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({logs.length} Total Logs)
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Log Ingestion Simulator */}
        <div>
          <div className="glass-card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', color: 'var(--accent-cyan)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={16} /> Telemetry Simulator
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
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
                  onChange={(e) => setSimEventType(e.target.value)}
                >
                  <option value="Logon Event - Logon">Logon Event</option>
                  <option value="USB Usage">USB Usage</option>
                  <option value="File Download">File Download</option>
                  <option value="Email Activity">Email Activity</option>
                  <option value="Network Activity">Network Activity</option>
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
                <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
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
