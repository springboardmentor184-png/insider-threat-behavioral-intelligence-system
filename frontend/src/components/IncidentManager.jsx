import React, { useState, useEffect } from 'react';

export default function IncidentManager({ token, currentUser }) {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Workflow updates
  const [newNote, setNewNote] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    setError('');
    let url = '/api/incidents?';
    if (statusFilter) url += `status_filter=${statusFilter}&`;
    if (severityFilter) url += `severity_filter=${severityFilter}&`;
    
    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load incidents registry.");
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidentDetail = async (incidentId) => {
    setDetailLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load case details.");
      const data = await res.json();
      setSelectedIncident(data);
      setAssigneeEmail(data.analyst_assigned || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchIncidents();
    }
  }, [token, statusFilter, severityFilter]);

  const handleStatusChange = async (newStatus) => {
    if (!selectedIncident) return;
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/incidents/${selectedIncident.incident_id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update status.");
      
      setSuccess(`Incident marked as ${newStatus.toLowerCase()}!`);
      // Reload
      fetchIncidentDetail(selectedIncident.incident_id);
      fetchIncidents();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIncident || !assigneeEmail.trim()) return;
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/incidents/${selectedIncident.incident_id}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ analyst_email: assigneeEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to assign case.");
      
      setSuccess("Case analyst successfully updated!");
      fetchIncidentDetail(selectedIncident.incident_id);
      fetchIncidents();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedIncident || !newNote.trim()) return;
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/incidents/${selectedIncident.incident_id}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newNote.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to append comment.");
      
      setSuccess("Analyst journal note added!");
      setNewNote('');
      fetchIncidentDetail(selectedIncident.incident_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'CRITICAL': return '#f87171';
      case 'HIGH': return '#fb923c';
      case 'MEDIUM': return '#facc15';
      default: return '#60a5fa';
    }
  };

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.headerBlock}>
        <div>
          <h2 style={styles.title}>Incident Case & Case Management System</h2>
          <p style={styles.subtitle}>Audit security incident portfolios, coordinate analyst workflows, and review case notes</p>
        </div>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}
      {success && <div style={styles.successAlert}>{success}</div>}

      <div style={styles.grid}>
        {/* Left Side: Case Registry List */}
        <div className="glass-panel" style={styles.leftCol}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Active Incident Cases</h3>
            <div style={styles.filterGroup}>
              <select 
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Statuses</option>
                <option value="OPEN">⚠️ Open</option>
                <option value="INVESTIGATING">🔍 Investigating</option>
                <option value="RESOLVED">✅ Resolved</option>
                <option value="ESCALATED">🚨 Escalated</option>
              </select>

              <select 
                className="form-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">🔴 Critical</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🔵 Low</option>
              </select>
            </div>
          </div>

          <div style={styles.incidentList}>
            {loading && <div style={styles.loadingCell}>Querying cases...</div>}
            {!loading && incidents.length === 0 && (
              <div style={styles.noDataCell}>No security cases match selected filters.</div>
            )}
            {!loading && incidents.map(inc => {
              const sevColor = getSeverityColor(inc.severity);
              const isSelected = selectedIncident && selectedIncident.incident_id === inc.incident_id;
              return (
                <div 
                  key={inc.incident_id}
                  onClick={() => fetchIncidentDetail(inc.incident_id)}
                  style={{
                    ...styles.incidentCard,
                    borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--panel-border)',
                    background: isSelected ? 'rgba(96, 165, 250, 0.12)' : 'var(--bg-secondary)'
                  }}
                >
                  <div style={styles.cardHeader}>
                    <span style={styles.caseId}>{inc.incident_id} ({inc.employee_id})</span>
                    <span style={{...styles.cardSeverity, color: sevColor}}>{inc.severity}</span>
                  </div>
                  <h4 style={styles.cardTitle}>{inc.title}</h4>
                  <div style={styles.cardFooter}>
                    <span>Assignee: {inc.analyst_assigned || 'Unassigned'}</span>
                    <span style={styles.cardStatus}>{inc.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Case Details & Workflows */}
        <div className="glass-panel" style={styles.rightCol}>
          {detailLoading && <div style={styles.loadingCell}>Fetching case journals...</div>}
          {!detailLoading && !selectedIncident && (
            <div style={styles.noDetails}>Select an incident case file from the registry list to audit details.</div>
          )}
          {!detailLoading && selectedIncident && (
            <div style={styles.caseDetails}>
              <div style={styles.detailHeader}>
                <h3 style={styles.detailTitle}>{selectedIncident.incident_id}: {selectedIncident.title}</h3>
                <span style={{
                  ...styles.statusBadge,
                  background: selectedIncident.status === 'RESOLVED' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                  color: selectedIncident.status === 'RESOLVED' ? '#34d399' : '#f87171'
                }}>{selectedIncident.status}</span>
              </div>
              <p style={styles.caseDesc}>{selectedIncident.description}</p>

              {/* Workflow Actions toolbar */}
              <div style={styles.actionToolbar}>
                {/* Status Switcher */}
                <div style={styles.actionBox}>
                  <label style={styles.boxLabel}>Update Status</label>
                  <select 
                    className="form-select"
                    value={selectedIncident.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={updating}
                    style={styles.actionSelect}
                  >
                    <option value="OPEN">⚠️ Open</option>
                    <option value="INVESTIGATING">🔍 Investigating</option>
                    <option value="RESOLVED">✅ Resolved</option>
                    <option value="ESCALATED">🚨 Escalated</option>
                  </select>
                </div>

                {/* Analyst Assignment */}
                <form onSubmit={handleAssignSubmit} style={styles.assignForm}>
                  <div style={styles.actionBox}>
                    <label style={styles.boxLabel}>Assign Analyst</label>
                    <div style={styles.assignInputGroup}>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={assigneeEmail}
                        onChange={(e) => setAssigneeEmail(e.target.value)}
                        disabled={updating}
                        style={styles.assignInput}
                      />
                      <button type="submit" className="btn btn-secondary" disabled={updating} style={styles.assignBtn}>
                        Assign
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Evidence Alerts attachment list */}
              {selectedIncident.evidence_logs && selectedIncident.evidence_logs.length > 0 && (
                <div style={styles.evidenceSection}>
                  <h4 style={styles.sectionTitle}> forensic Evidence Logs Attached</h4>
                  <ul style={styles.evidenceList}>
                    {selectedIncident.evidence_logs.map(logId => (
                      <li key={logId} style={styles.evidenceLi}>
                        🛡️ Log Link ID: <code>{logId}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Analyst Journal Comments notes */}
              <div style={styles.notesSection}>
                <h4 style={styles.sectionTitle}>Analyst Case Journals</h4>
                <div style={styles.notesTimeline}>
                  {selectedIncident.notes.map((note, idx) => (
                    <div key={idx} style={styles.noteCard}>
                      <div style={styles.noteHeader}>
                        <span style={styles.noteAnalyst}>{note.analyst}</span>
                        <span style={styles.noteTime}>{new Date(note.timestamp).toLocaleString()}</span>
                      </div>
                      <p style={styles.noteText}>{note.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Journal update note */}
                <form onSubmit={handleAddNote} style={styles.noteForm}>
                  <textarea 
                    className="form-input"
                    placeholder="Record notes, diary entries, or containment summaries..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows="3"
                    disabled={updating}
                    style={styles.noteTextarea}
                  />
                  <button type="submit" className="btn btn-primary" disabled={updating} style={styles.submitNoteBtn}>
                    {updating ? 'Recording...' : 'Add Journal Entry'}
                  </button>
                </form>
              </div>
            </div>
          )}
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
    color: 'var(--text-primary)'
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '4px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '24px',
    alignItems: 'start'
  },
  leftCol: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  panelHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  panelTitle: {
    fontSize: '15px',
    color: 'var(--text-primary)',
    fontWeight: '600'
  },
  filterGroup: {
    display: 'flex',
    gap: '8px'
  },
  filterSelect: {
    flexGrow: 1,
    padding: '6px 10px',
    fontSize: '12px'
  },
  incidentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '650px',
    overflowY: 'auto',
    paddingRight: '6px'
  },
  incidentCard: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontWeight: '600'
  },
  caseId: {
    color: 'var(--accent-cyan)'
  },
  cardSeverity: {
    fontSize: '10px',
    fontWeight: '700'
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '4px 0'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: 'var(--text-muted)'
  },
  cardStatus: {
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  rightCol: {
    padding: '24px',
    minHeight: '400px'
  },
  noDetails: {
    textAlign: 'center',
    padding: '80px 20px',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    fontSize: '14px'
  },
  caseDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    borderBottom: '1px solid var(--panel-border)',
    paddingBottom: '12px'
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '700'
  },
  caseDesc: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  actionToolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    padding: '16px',
    background: 'var(--bg-primary)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  actionBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  boxLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  actionSelect: {
    padding: '6px 12px',
    fontSize: '12px',
    minWidth: '150px'
  },
  assignForm: {
    flexGrow: 1
  },
  assignInputGroup: {
    display: 'flex',
    gap: '8px'
  },
  assignInput: {
    flexGrow: 1,
    padding: '6px 12px',
    fontSize: '12px'
  },
  assignBtn: {
    padding: '6px 12px',
    fontSize: '12px'
  },
  evidenceSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sectionTitle: {
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: '600'
  },
  evidenceList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  evidenceLi: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    background: 'rgba(255,255,255,0.01)',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  notesSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '10px'
  },
  notesTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '6px'
  },
  noteCard: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '6px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px'
  },
  noteAnalyst: {
    fontWeight: '700',
    color: 'var(--accent-cyan)'
  },
  noteTime: {
    color: 'var(--text-muted)'
  },
  noteText: {
    fontSize: '12px',
    color: 'var(--text-primary)',
    lineHeight: '1.4'
  },
  noteForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px'
  },
  noteTextarea: {
    padding: '10px',
    fontSize: '12px',
    resize: 'none',
    width: '100%'
  },
  submitNoteBtn: {
    alignSelf: 'flex-end',
    padding: '8px 16px',
    fontSize: '12px'
  },
  loadingCell: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--accent-cyan)'
  },
  noDataCell: {
    textAlign: 'center',
    padding: '20px',
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
