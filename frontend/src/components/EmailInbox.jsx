import React, { useState, useEffect } from 'react';
import { Mail, Shield, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

export default function EmailInbox({ onViewIncident }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/emails');
      if (res.ok) {
        const result = await res.json();
        setEmails(result);
        if (result.length > 0) {
          setSelectedEmail(result[0]);
        } else {
          setSelectedEmail(null);
        }
      }
    } catch (e) {
      console.error("Error fetching emails:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Helper to extract alert_id from email HTML body
  const extractAlertId = (body) => {
    const match = body.match(/\/incident\/(\d+)/);
    return match ? match[1] : null;
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Mock Manager Inbox</h2>
          <p className="page-subtitle">Simulated email inbox for the Security Manager (receives High & Critical threat alerts)</p>
        </div>
        <button className="refresh-btn" onClick={fetchEmails}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="incident-grid" style={{ gridTemplateColumns: '1.2fr 2fr' }}>
        {/* Left Column: Email List */}
        <div className="section-card" style={{ padding: '16px', maxHeight: '600px', overflowY: 'auto' }}>
          <h3 className="section-title" style={{ margin: '8px 8px 16px 8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Mail size={16} />
            Inbox (manager@insiderai.com)
          </h3>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading inbox logs...</p>
          ) : emails.length > 0 ? (
            <div className="inbox-list">
              {emails.map((email) => {
                const isSelected = selectedEmail && selectedEmail.id === email.id;
                return (
                  <div 
                    key={email.id} 
                    className={`email-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="email-header-top">
                      <span className="email-sender">Insider AI SOC</span>
                      <span className="email-date">{new Date(email.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="email-subject">{email.subject}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
              <Mail size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '13px', fontWeight: 500 }}>No security emails received yet.</p>
              <p style={{ fontSize: '11px', marginTop: '4px' }}>Use the Threat Simulator to trigger High/Critical threats.</p>
            </div>
          )}
        </div>

        {/* Right Column: Email Reader */}
        <div className="email-viewer">
          {selectedEmail ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header Info */}
              <div className="email-viewer-header">
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{selectedEmail.subject}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                  <span>From: <strong>Insider AI Security Analytics &lt;soc@insiderai.com&gt;</strong></span>
                  <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  To: <strong>Security Manager &lt;{selectedEmail.recipient}&gt;</strong>
                </div>
                
                {/* Navigation Interception Alert */}
                {extractAlertId(selectedEmail.body) && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px 16px', 
                    backgroundColor: '#eff6ff', 
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#1e40af', fontWeight: 500 }}>
                      <Shield size={16} />
                      <span>Email contains incident action button for Alert #{extractAlertId(selectedEmail.body)}.</span>
                    </div>
                    <button 
                      onClick={() => onViewIncident(parseInt(extractAlertId(selectedEmail.body)))}
                      className="refresh-btn"
                      style={{ 
                        backgroundColor: '#2563eb', 
                        color: 'white', 
                        padding: '6px 12px', 
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Simulate Click</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Render HTML Body safely */}
              <div className="email-viewer-body">
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  style={{ overflow: 'auto' }}
                  onClick={(e) => {
                    // If they click the button inside the email, intercept it to trigger our react navigation
                    if (e.target.tagName === 'A' && e.target.href.includes('/incident/')) {
                      e.preventDefault();
                      const alertId = extractAlertId(selectedEmail.body);
                      if (alertId) {
                        onViewIncident(parseInt(alertId));
                      }
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', padding: '40px' }}>
              <Mail size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <p style={{ fontWeight: 600 }}>No Email Selected</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Select an email from the inbox list to read it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
