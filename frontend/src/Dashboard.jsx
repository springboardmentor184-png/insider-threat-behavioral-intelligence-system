import { useEffect, useState } from "react";
import {
  getEmployees, getLogs, ingestSampleLogs, createEmployee, getAnomalies,
  computeBaselines, detectAnomalies, computeRiskScores, runPeerComparison,
  generateInvestigations, getInvestigations, getInvestigationDetail,
} from "./api";

function riskCategory(score) {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export default function Dashboard({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [expandedCase, setExpandedCase] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [message, setMessage] = useState("");

  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");

  async function loadData() {
    try { setEmployees(await getEmployees()); } catch (err) { setMessage(err.message); }
    try { setLogs(await getLogs()); } catch (err) { setMessage(err.message); }
    try { setAnomalies(await getAnomalies()); } catch (err) { setMessage(err.message); }
    try { setInvestigations(await getInvestigations()); } catch (err) { setMessage(err.message); }
  }

  useEffect(() => { loadData(); }, []);

  async function handleIngest() {
    try {
      const result = await ingestSampleLogs();
      setMessage(`Ingested ${result.inserted}, skipped ${result.skipped_count}`);
      loadData();
    } catch (err) { setMessage(err.message); }
  }

  async function handleAddEmployee() {
    const employee_code = prompt("Employee code (e.g. EMP001):");
    if (!employee_code) return;
    const full_name = prompt("Full name:");
    const department = prompt("Department:");
    const designation = prompt("Designation:");
    const access_level = prompt("Access level (standard/elevated/privileged):", "standard");
    try {
      await createEmployee({ employee_code, full_name, department, designation, access_level });
      loadData();
    } catch (err) { setMessage(err.message); }
  }

  async function handleComputeBaselines() {
    try {
      const result = await computeBaselines();
      setMessage(`Baselines computed for ${result.baselines_computed} employees`);
    } catch (err) { setMessage(err.message); }
  }

  async function handleDetectAnomalies() {
    try {
      const result = await detectAnomalies();
      setMessage(`Analyzed ${result.employees_analyzed} employees, flagged ${result.anomalies_flagged} anomalies`);
      loadData();
    } catch (err) { setMessage(err.message); }
  }

  async function handleComputeRiskScores() {
    try {
      const result = await computeRiskScores();
      setMessage(`Risk scores computed for ${result.employees_scored} employees`);
      loadData();
    } catch (err) { setMessage(err.message); }
  }

  async function handlePeerComparison() {
    try {
      const result = await runPeerComparison();
      setMessage(`UEBA: compared ${result.employees_compared} employees, ${result.peer_outliers} peer outliers found`);
      loadData();
    } catch (err) { setMessage(err.message); }
  }

  async function handleGenerateInvestigations() {
    try {
      const result = await generateInvestigations();
      setMessage(`${result.investigations_created} new investigation case(s) opened`);
      loadData();
    } catch (err) { setMessage(err.message); }
  }

  async function toggleCase(id) {
    if (expandedCase === id) {
      setExpandedCase(null);
      setTimeline(null);
      return;
    }
    try {
      const detail = await getInvestigationDetail(id);
      setTimeline(detail);
      setExpandedCase(id);
    } catch (err) { setMessage(err.message); }
  }

  const offHoursCount = logs.filter((l) => l.activity_type === "usb_connect" || l.data_volume_mb > 100).length;
  const privilegedCount = employees.filter((e) => e.access_level === "privileged").length;

  const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  employees.forEach((e) => { riskCounts[riskCategory(e.risk_score || 0)]++; });

  const openCases = investigations.filter((i) => i.status === "open").length;

  return (
    <div>
      <header className="topbar">
        <div className="brand">Insider Threat Intelligence</div>
        <div className="who">
          Signed in as <span>{email}</span> &middot; role: <span>{role}</span>
          <button className="logout" onClick={onLogout}>Sign out</button>
        </div>
      </header>
      <div className={`pulse-strip ${offHoursCount > 0 ? "alert" : ""}`}>
        {Array.from({ length: 32 }).map((_, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.05}s` }}></span>
        ))}
      </div>

      <main>
        {message && <p className="message-banner">{message}</p>}

        <div className="tab-row">
          <button className={`tab-btn ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
          <button className={`tab-btn ${tab === "employees" ? "active" : ""}`} onClick={() => setTab("employees")}>Employees</button>
          <button className={`tab-btn ${tab === "activity" ? "active" : ""}`} onClick={() => setTab("activity")}>Activity feed</button>
          <button className={`tab-btn ${tab === "anomalies" ? "active" : ""}`} onClick={() => setTab("anomalies")}>Anomalies</button>
          <button className={`tab-btn ${tab === "investigations" ? "active" : ""}`} onClick={() => setTab("investigations")}>Investigations</button>
        </div>

        {tab === "overview" && (
          <>
            <div className="stat-row">
              <div className="stat-card accent">
                <div className="label">Employees monitored</div>
                <div className="value">{employees.length}</div>
              </div>
              <div className="stat-card">
                <div className="label">Activity events logged</div>
                <div className="value">{logs.length}</div>
              </div>
              <div className="stat-card warn">
                <div className="label">Flagged anomalies</div>
                <div className="value">{anomalies.length}</div>
              </div>
              <div className="stat-card danger">
                <div className="label">Open investigations</div>
                <div className="value">{openCases}</div>
              </div>
            </div>

            <div className="risk-gauge-row">
              <div className="risk-gauge-card">
                <div className="risk-ring low">{riskCounts.low}</div>
                <div className="risk-gauge-info">
                  <div className="label">Low risk</div>
                  <div className="value" style={{ color: "var(--cyan)" }}>{riskCounts.low} employees</div>
                </div>
              </div>
              <div className="risk-gauge-card">
                <div className="risk-ring medium">{riskCounts.medium}</div>
                <div className="risk-gauge-info">
                  <div className="label">Medium risk</div>
                  <div className="value" style={{ color: "var(--amber)" }}>{riskCounts.medium} employees</div>
                </div>
              </div>
              <div className="risk-gauge-card">
                <div className="risk-ring high">{riskCounts.high}</div>
                <div className="risk-gauge-info">
                  <div className="label">High risk</div>
                  <div className="value" style={{ color: "#ff8a5c" }}>{riskCounts.high} employees</div>
                </div>
              </div>
              <div className="risk-gauge-card">
                <div className="risk-ring critical">{riskCounts.critical}</div>
                <div className="risk-gauge-info">
                  <div className="label">Critical risk</div>
                  <div className="value" style={{ color: "var(--coral)" }}>{riskCounts.critical} employees</div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2>Run the analytics pipeline</h2>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", padding: "16px 20px" }}>
                <button className="btn-outline" onClick={handleComputeBaselines}>1. Compute baselines</button>
                <button className="btn-outline" onClick={handleDetectAnomalies}>2. Detect anomalies</button>
                <button className="btn-outline" onClick={handleComputeRiskScores}>3. Compute risk scores</button>
                <button className="btn-outline" onClick={handlePeerComparison}>4. Run UEBA peer comparison</button>
                <button className="btn-outline" onClick={handleGenerateInvestigations}>5. Generate investigations</button>
              </div>
            </div>
          </>
        )}

        {tab === "employees" && (
          <div className="panel">
            <div className="panel-head">
              <h2>Employee directory</h2>
              <button onClick={handleAddEmployee}>+ Add employee</button>
            </div>
            <table>
              <thead>
                <tr><th>Code</th><th>Name</th><th>Department</th><th>Access level</th><th>Risk score</th><th>Risk category</th></tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr className="empty-row"><td colSpan="6">No employees yet.</td></tr>
                ) : (
                  employees.map((e) => (
                    <tr key={e.id}>
                      <td>{e.employee_code}</td>
                      <td>{e.full_name}</td>
                      <td>{e.department}</td>
                      <td><span className={`badge ${e.access_level}`}>{e.access_level}</span></td>
                      <td>{e.risk_score ?? 0}</td>
                      <td><span className={`severity-badge ${riskCategory(e.risk_score || 0)}`}>{riskCategory(e.risk_score || 0)}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "activity" && (
          <div className="panel">
            <div className="panel-head">
              <h2>Recent activity feed</h2>
              <button onClick={handleIngest}>Load sample data</button>
            </div>
            <table>
              <thead>
                <tr><th></th><th>Employee ID</th><th>Activity</th><th>Resource</th><th>Device</th><th>Data volume</th></tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr className="empty-row"><td colSpan="6">No activity logged yet.</td></tr>
                ) : (
                  logs.map((l) => {
                    const flagged = l.activity_type === "usb_connect" || l.data_volume_mb > 100;
                    return (
                      <tr key={l.id}>
                        <td><span className={`flag-dot ${flagged ? "off-hours" : ""}`}></span></td>
                        <td>{l.employee_id}</td>
                        <td>{l.activity_type}</td>
                        <td>{l.resource || "-"}</td>
                        <td>{l.device || "-"}</td>
                        <td>{l.data_volume_mb} MB</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "anomalies" && (
          <div className="panel">
            <div className="panel-head">
              <h2>Behavioral anomaly report</h2>
            </div>
            <table>
              <thead>
                <tr><th></th><th>Employee ID</th><th>Activity</th><th>Resource</th><th>Device</th><th>Data volume</th><th>Timestamp</th></tr>
              </thead>
              <tbody>
                {anomalies.length === 0 ? (
                  <tr className="empty-row"><td colSpan="7">No anomalies flagged yet. Run detection from the Overview tab.</td></tr>
                ) : (
                  anomalies.map((a) => (
                    <tr key={a.id}>
                      <td><span className="flag-dot off-hours"></span></td>
                      <td>{a.employee_id}</td>
                      <td>{a.activity_type}</td>
                      <td>{a.resource || "-"}</td>
                      <td>{a.device || "-"}</td>
                      <td>{a.data_volume_mb} MB</td>
                      <td>{a.timestamp ? new Date(a.timestamp).toLocaleString() : "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === "investigations" && (
          <div className="panel">
            <div className="panel-head">
              <h2>Threat investigation cases</h2>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>
                Click a row to view its timeline
              </span>
            </div>
            <table>
              <thead>
                <tr><th>Case ID</th><th>Employee ID</th><th>Severity</th><th>Status</th><th>Summary</th></tr>
              </thead>
              <tbody>
                {investigations.length === 0 ? (
                  <tr className="empty-row"><td colSpan="5">No investigations opened yet. Generate them from the Overview tab.</td></tr>
                ) : (
                  investigations.map((c) => (
                    <>
                      <tr key={c.id} className="investigation-row" onClick={() => toggleCase(c.id)}>
                        <td>#{c.id}</td>
                        <td>{c.employee_id}</td>
                        <td><span className={`severity-badge ${c.severity.toLowerCase()}`}>{c.severity}</span></td>
                        <td><span className="status-pill">{c.status}</span></td>
                        <td>{c.summary}</td>
                      </tr>
                      {expandedCase === c.id && timeline && (
                        <tr>
                          <td colSpan="5" style={{ padding: 0 }}>
                            <div className="timeline-panel">
                              {timeline.timeline.map((t) => (
                                <div className="timeline-item" key={t.id}>
                                  <div className="timeline-dot"></div>
                                  <div>
                                    {t.timestamp ? new Date(t.timestamp).toLocaleString() : "-"} &mdash; {t.activity_type} &mdash; {t.resource || "-"} &mdash; {t.device || "-"} &mdash; {t.data_volume_mb} MB
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}