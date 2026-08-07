import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { getAnomalyDetail } from "../api/axios";

export default function AnomalyDetail() {
  const { user } = useParams();
  const [anomaly, setAnomaly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incidentStatus, setIncidentStatus] = useState("Under Investigation");
  const [analystNotes, setAnalystNotes] = useState("");
  const [notesList, setNotesList] = useState([
    { id: 1, author: "SOC Analyst", text: "Initial anomaly flag detected by Isolation Forest model.", time: "10 mins ago" }
  ]);
  const [exportNotice, setExportNotice] = useState("");

  useEffect(() => {
    getAnomalyDetail(user)
      .then((res) => {
        setAnomaly(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch anomaly detail", err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!analystNotes.trim()) return;
    const newEntry = {
      id: Date.now(),
      author: "Current Analyst",
      text: analystNotes,
      time: "Just now"
    };
    setNotesList([newEntry, ...notesList]);
    setAnalystNotes("");
  };

  const handleExportJSON = () => {
    const reportData = {
      investigation_id: `INV-${Date.now().toString().slice(-6)}`,
      subject: user,
      anomaly_details: anomaly,
      status: incidentStatus,
      analyst_notes: notesList,
      generated_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `threat_report_${user}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice("✅ Threat evidence report exported to JSON format!");
    setTimeout(() => setExportNotice(""), 4000);
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: 60, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
          Initializing Threat Investigation Workbench for Subject: {user}...
        </div>
      </Layout>
    );
  }

  if (!anomaly) {
    return (
      <Layout>
        <div className="glass-panel" style={{ textAlign: "center", padding: 40 }}>
          <h2 style={{ color: "var(--risk-critical)" }}>Subject Record Not Found</h2>
          <p style={{ color: "var(--text-muted)", marginTop: 8 }}>No anomaly record registered for user ID {user}.</p>
          <Link to="/anomalies" className="btn btn-secondary" style={{ marginTop: 20 }}>
            Back to Anomaly Center
          </Link>
        </div>
      </Layout>
    );
  }

  const isFlagged = anomaly.flagged;
  const score = anomaly.risk_score || (isFlagged ? 88 : 48);
  const reasons = Array.isArray(anomaly.reasons) ? anomaly.reasons : [anomaly.reasons || "Off-hours system access"];

  let riskTier = "Low Risk";
  let badgeClass = "badge-low";
  if (score >= 75) { riskTier = "Critical Risk"; badgeClass = "badge-critical"; }
  else if (score >= 50) { riskTier = "High Risk"; badgeClass = "badge-high"; }
  else if (score >= 25) { riskTier = "Medium Risk"; badgeClass = "badge-medium"; }

  // Activity Timeline mock events
  const timelineEvents = [
    { time: "08:14 AM", event: "User Logged In", detail: "Authentication from unusual IP 192.168.1.140 (VPN)", risk: "Low" },
    { time: "11:30 AM", event: "Mass File Access", detail: "Accessed 140 confidential database dumps in /finance", risk: "Critical" },
    { time: "01:45 PM", event: "USB / External Export", detail: "Mounted USB drive & initiated 4.2GB data transfer", risk: "Critical" },
    { time: "03:10 PM", event: "Privilege Escalation Attempt", detail: "Executed sudo su command without ticket authorization", risk: "High" },
  ];

  const handleExportPDF = () => {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("Please allow popups to export PDF");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ITBIS Threat Investigation Report - ${user}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
          .header { border-bottom: 2px solid #00f2fe; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; }
          .subtitle { font-size: 14px; color: #64748b; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
          .badge-critical { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
          .badge-high { background: #ffedd5; color: #ea580c; border: 1px solid #fed7aa; }
          .badge-medium { background: #fef9c3; color: #ca8a04; border: 1px solid #fef08a; }
          .badge-low { background: #d1fae5; color: #059669; border: 1px solid #6ee7b7; }
          .section { margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .section-title { font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; }
          .timeline-item { margin-bottom: 12px; padding-left: 15px; border-left: 3px solid #0284c7; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .footer { font-size: 11px; color: #94a3b8; margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">ITBIS Insider Threat Incident Report</div>
            <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
          </div>
          <div>
            <span class="badge ${badgeClass}">${riskTier} (Score: ${score}/100)</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">1. Subject & Case Details</div>
          <div class="meta-grid">
            <div><strong>Subject Entity ID:</strong> ${user}</div>
            <div><strong>Incident Status:</strong> ${incidentStatus}</div>
            <div><strong>Flag Status:</strong> ${isFlagged ? "🚩 Manual Security Flag Active" : "Automated ML Anomaly"}</div>
            <div><strong>Classification Label:</strong> ${anomaly.label || "Behavioral Anomaly"}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Detected Behavioral Indicators</div>
          <ul>
            ${reasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <div class="section-title">3. Activity Telemetry Timeline</div>
          ${timelineEvents.map(e => `
            <div class="timeline-item">
              <strong>[${e.time}] ${e.event}</strong> - Severity: ${e.risk}<br/>
              <span style="color:#475569;">${e.detail}</span>
            </div>
          `).join('')}
        </div>

        <div class="section">
          <div class="section-title">4. Analyst Investigation Log</div>
          ${notesList.map(n => `
            <div style="margin-bottom: 8px;">
              <strong>${n.author}</strong> (${n.time}): ${n.text}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          Confidential - Insider Threat Behavioral Intelligence System (ITBIS) - Internal Security Operations Center
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
    setExportNotice("✅ PDF export print dialog triggered!");
    setTimeout(() => setExportNotice(""), 4000);
  };

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Link to="/anomalies" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
              ← Back to Anomaly Center
            </Link>
            <h1 className="title-gradient" style={{ fontSize: 26, marginTop: 4 }}>
              Threat Investigation Workbench — {user}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-secondary" onClick={handleExportPDF}>
              📕 Export Evidence PDF
            </button>
            <button className="btn btn-secondary" onClick={handleExportJSON}>
              📄 Export Evidence JSON
            </button>
            <button className="btn btn-danger" onClick={() => setIncidentStatus("Escalated to SOC Tier 3")}>
              🚨 Escalate Incident
            </button>
          </div>
        </div>

        {exportNotice && (
          <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid var(--risk-low)", color: "var(--risk-low)", padding: "12px 16px", borderRadius: 8, fontSize: 14 }}>
            {exportNotice}
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="glass-panel" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Subject Entity ID</div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: "var(--accent-cyan)", marginTop: 4 }}>{anomaly.user}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Calculated Risk Score</div>
            <div style={{ marginTop: 4 }}>
              <span className={`badge ${badgeClass}`} style={{ fontSize: 14, padding: "6px 14px" }}>
                {riskTier} ({score} / 100)
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Security Flag Status</div>
            <div style={{ marginTop: 6 }}>
              {isFlagged ? (
                <span className="badge badge-critical">🚩 MANUAL SECURITY FLAG ACTIVE</span>
              ) : (
                <span className="badge badge-accent">AUTOMATED ML DETECTED</span>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase" }}>Incident Case Status</div>
            <div style={{ marginTop: 6 }}>
              <select
                className="input-field"
                style={{ padding: "4px 8px", fontSize: 13 }}
                value={incidentStatus}
                onChange={(e) => setIncidentStatus(e.target.value)}
              >
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Escalated to SOC Tier 3">Escalated to SOC Tier 3</option>
                <option value="Resolved / Mitigated">Resolved / Mitigated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Core Workbench Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Activity Timeline Card */}
          <div className="glass-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, color: "var(--text-primary)" }}>Activity Telemetry Timeline</h3>
              <span className="badge badge-accent">Module 7 Timeline</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {timelineEvents.map((evt, idx) => (
                <div key={idx} style={{ display: "flex", gap: 14, borderLeft: "2px solid var(--accent-cyan)", paddingLeft: 14, position: "relative" }}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 64 }}>
                    {evt.time}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{evt.event}</span>
                      <span className={`badge ${evt.risk === "Critical" ? "badge-critical" : evt.risk === "High" ? "badge-high" : "badge-low"}`}>
                        {evt.risk}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{evt.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly Reasons & Correlation */}
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ fontSize: 16, color: "var(--text-primary)" }}>Detected Risk Indicators & Correlation</h3>

            <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: 16, borderRadius: 10, border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: 12, color: "var(--accent-cyan)", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
                Primary Behavioral Indicators
              </div>
              <ul style={{ paddingLeft: 18, fontSize: 13, color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: 6 }}>
                {reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: 16, borderRadius: 10, border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: 12, color: "var(--accent-cyan)", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
                Associated Asset & Privilege Metadata
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 4 }}>
                <div>💻 <strong>Monitored Workstation:</strong> Corporate Asset #10892 (Windows 11 Enterprise)</div>
                <div>🌐 <strong>IP Address:</strong> 192.168.1.140 / 10.0.4.12 (Internal Subnet)</div>
                <div>🔑 <strong>Privilege Tier:</strong> Database Administrator & AWS Console Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analyst Notes & Investigation Log */}
        <div className="glass-panel">
          <h3 style={{ fontSize: 16, marginBottom: 14, color: "var(--text-primary)" }}>Analyst Investigation Log & Evidence Notes</h3>

          <form onSubmit={handleAddNote} style={{ marginBottom: 20 }}>
            <div className="form-group">
              <textarea
                className="input-field"
                rows="3"
                placeholder="Add analyst observation, evidence tag, or interview notes..."
                value={analystNotes}
                onChange={(e) => setAnalystNotes(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ fontSize: 13 }}>
              💬 Add Analyst Note
            </button>
          </form>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notesList.map((n) => (
              <div key={n.id} style={{ background: "rgba(30, 41, 59, 0.4)", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "var(--accent-cyan)" }}>{n.author}</span>
                  <span style={{ color: "var(--text-muted)" }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-primary)" }}>{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}