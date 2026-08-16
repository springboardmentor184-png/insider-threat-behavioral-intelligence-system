import React, { useState, useEffect } from 'react';
import { Shield, User, Calendar, Activity, CheckCircle, RefreshCw, AlertOctagon } from 'lucide-react';

export default function IncidentDetails({ alertId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('Open');
  const [analyst, setAnalyst] = useState('Arnav');
const [notes, setNotes] = useState('');
const [savingNotes, setSavingNotes] = useState(false);
const [saveMessage, setSaveMessage] = useState('');

  const fetchIncidentDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/alerts/${alertId}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
        setStatus(result.alert.status);
      }
    } catch (e) {
      console.error("Error fetching incident details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alertId) {
      fetchIncidentDetails();
    }
  }, [alertId]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      const res = await fetch(`http://localhost:8000/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setStatus(newStatus);
      }
    } catch (e) {
      console.error("Error updating incident status:", e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '350px' }}>
        <p style={{ color: '#475569', fontWeight: 600 }}>Loading investigation timeline...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="section-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>Incident not found or database sync failed.</p>
        <button className="refresh-btn" style={{ marginTop: '16px', display: 'inline-flex' }} onClick={onBack}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { alert, timeline, history } = data;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button 
            onClick={onBack}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#2563eb', 
              fontWeight: 600, 
              cursor: 'pointer',
              marginBottom: '8px',
              fontSize: '13px'
            }}
          >
            &larr; Back to Alerts
          </button>
          <h2 className="page-title">Incident Investigation</h2>
          <p className="page-subtitle">Investigation timeline and digital forensics audit log for alert #{alert.id}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            className="filter-select"
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            style={{ 
              fontWeight: 600,
              backgroundColor: status === 'Resolved' ? '#dcfce7' : status === 'Investigating' ? '#fef3c7' : '#fee2e2',
              color: status === 'Resolved' ? '#16a34a' : status === 'Investigating' ? '#d97706' : '#ef4444',
              border: 'none'
            }}
          >
            <option value="Open">🔴 Open Incident</option>
            <option value="Investigating">🟡 Investigating</option>
            <option value="Resolved">🟢 Resolved / Closed</option>
          </select>
        </div>
      </div>

      <div className="incident-grid">
        {/* Left Column: Details & Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Employee Risk Card */}
          <div className="section-card detail-card">
            <h3 className="section-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <User size={18} style={{ color: '#2563eb' }} />
              Employee Profile
            </h3>
            
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{alert.employee_name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">ID:</span>
              <span className="detail-value" style={{ fontFamily: 'monospace' }}>{alert.employee_id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{alert.department}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Privilege:</span>
              <span className="detail-value">{alert.privilege_level}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Account Status:</span>
              <span className="detail-value"><span className="badge low" style={{ fontSize: '10px' }}>{alert.employee_status}</span></span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Current Risk Score:</span>
              <span className="detail-value" style={{ fontSize: '18px', fontWeight: 800, color: alert.risk_score >= 70 ? '#ef4444' : '#ea580c' }}>
                {alert.risk_score} / 100
              </span>
            </div>
          </div>

          {/* Incident Info */}
          <div className="section-card detail-card">
            <h3 className="section-title" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertOctagon size={18} style={{ color: '#ef4444' }} />
              Alert Details
            </h3>
            
            <div className="detail-row">
              <span className="detail-label">Threat Type:</span>
              <span className="detail-value">{alert.threat_type}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Severity:</span>
              <span className="detail-value"><span className={`badge ${alert.severity.toLowerCase()}`}>{alert.severity}</span></span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Triggered At:</span>
              <span className="detail-value" style={{ fontSize: '11px', color: '#64748b' }}>
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <span className="detail-label">Reason:</span>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500, lineHeight: 1.5 }}>
                {alert.reason}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline Forensics */}
        <div className="section-card">
          {/* Investigation Controls */}
<div
  className="section-card"
  style={{
    marginBottom: '24px'
  }}
>
  <h3
    className="section-title"
    style={{
      borderBottom: '1px solid #e2e8f0',
      paddingBottom: '12px',
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    }}
  >
    <Shield
      size={18}
      style={{ color: '#2563eb' }}
    />
    Investigation
  </h3>

  {/* Assigned Analyst */}
  <div
    style={{
      marginTop: '18px'
    }}
  >
    <label
      style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: '#475569',
        marginBottom: '7px'
      }}
    >
      Assigned Analyst
    </label>

    <select
      value={analyst}
      onChange={(e) => setAnalyst(e.target.value)}
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        background: 'white'
      }}
    >
      <option value="Arnav">
        Arnav
      </option>
      <option value="Security Manager">
        Security Manager
      </option>
      <option value="Security Analyst">
        Security Analyst
      </option>
      <option value="SOC Analyst">
        SOC Analyst
      </option>
    </select>
  </div>

  {/* Investigation Notes */}
  <div style={{ marginTop: '18px' }}>
    <label
      style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        color: '#475569',
        marginBottom: '7px'
      }}
    >
      Investigation Notes
    </label>

    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="Enter investigation findings, observations, or recommended actions..."
      rows={5}
      style={{
        width: '100%',
        padding: '10px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        resize: 'vertical',
        boxSizing: 'border-box',
        fontFamily: 'inherit'
      }}
    />
  </div>

  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '12px'
    }}
  >
    <button
      onClick={async () => {
        try {
          setSavingNotes(true);
          setSaveMessage('');

          /*
           * For now we save the investigation information
           * locally in the browser.
           *
           * We will persist it to SQLite in the next step.
           */
          localStorage.setItem(
            `investigation_${alertId}`,
            JSON.stringify({
              analyst,
              notes,
              updatedAt: new Date().toISOString()
            })
          );

          setSaveMessage(
            'Investigation notes saved successfully.'
          );
        } catch (error) {
          console.error(error);
          setSaveMessage(
            'Unable to save investigation notes.'
          );
        } finally {
          setSavingNotes(false);
        }
      }}
      disabled={savingNotes}
      style={{
        padding: '10px 16px',
        border: 'none',
        borderRadius: '6px',
        background: '#2563eb',
        color: 'white',
        fontWeight: 600,
        cursor: savingNotes
          ? 'not-allowed'
          : 'pointer',
        opacity: savingNotes ? 0.7 : 1
      }}
    >
      {savingNotes
        ? 'Saving...'
        : 'Save Investigation'}
    </button>

    {saveMessage && (
      <span
        style={{
          fontSize: '12px',
          color: saveMessage.includes('successfully')
            ? '#16a34a'
            : '#dc2626'
        }}
      >
        {saveMessage}
      </span>
    )}
  </div>
</div>
          <div className="section-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <h3 className="section-title" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Activity size={18} style={{ color: '#2563eb' }} />
              Forensic Activity Timeline
            </h3>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Sorted Chronologically</span>
          </div>

          <div className="timeline-container">
            {timeline.map((act) => (
              <div key={act.id} className="timeline-item">
                <div className={`timeline-dot ${act.severity.toLowerCase()}`}></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-title">{act.activity_type}</span>
                    <span className="timeline-time">{new Date(act.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="timeline-desc">{act.description}</p>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${act.severity.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {act.severity} Severity
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                      Risk Delta: +{act.risk_score_contribution}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
