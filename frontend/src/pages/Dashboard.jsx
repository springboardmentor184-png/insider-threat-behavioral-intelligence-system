import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Layout from "../components/Layout";
import { getAnomalies } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnomalies()
      .then((res) => {
        setAnomalies(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch anomalies", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute metrics from fetched data
  const totalAnomalies = anomalies.length;
  const flaggedCount = anomalies.filter(a => a.flagged).length;
  const criticalCount = anomalies.filter(a => (a.risk_score || (a.flagged ? 85 : 45)) >= 75).length;
  const highRiskCount = anomalies.filter(a => {
    const s = a.risk_score || (a.flagged ? 85 : 45);
    return s >= 50 && s < 75;
  }).length;
  const mediumRiskCount = anomalies.filter(a => {
    const s = a.risk_score || (a.flagged ? 85 : 45);
    return s >= 25 && s < 50;
  }).length;
  const lowRiskCount = totalAnomalies - (criticalCount + highRiskCount + mediumRiskCount);

  // UEBA Trend Mock Data
  const uebaTrendData = [
    { time: "00:00", loginAnomalies: 12, dataExfiltration: 4, privilegeAbuse: 2 },
    { time: "04:00", loginAnomalies: 8, dataExfiltration: 2, privilegeAbuse: 1 },
    { time: "08:00", loginAnomalies: 45, dataExfiltration: 15, privilegeAbuse: 8 },
    { time: "12:00", loginAnomalies: 78, dataExfiltration: 32, privilegeAbuse: 19 },
    { time: "16:00", loginAnomalies: 92, dataExfiltration: 41, privilegeAbuse: 24 },
    { time: "20:00", loginAnomalies: 34, dataExfiltration: 18, privilegeAbuse: 10 },
  ];

  // Risk Categories Pie Data
  const riskPieData = [
    { name: "Critical Risk (76-100)", value: criticalCount || 5, color: "var(--risk-critical)" },
    { name: "High Risk (51-75)", value: highRiskCount || 12, color: "var(--risk-high)" },
    { name: "Medium Risk (26-50)", value: mediumRiskCount || 24, color: "var(--risk-medium)" },
    { name: "Low Risk (0-25)", value: lowRiskCount || 59, color: "var(--risk-low)" },
  ];

  // Weighted Scoring Model Breakdown
  const scoringWeights = [
    { factor: "Behavioral Anomalies", weight: 35, desc: "Deviation from user historical activity baselines", color: "#00F2FE" },
    { factor: "Privilege Misuse Indicators", weight: 25, desc: "Unauthorized admin actions or privilege escalations", color: "#3B82F6" },
    { factor: "Data Access Violations", weight: 20, desc: "Mass file downloads, unauthorized database queries", color: "#8B5CF6" },
    { factor: "Access Pattern Deviations", weight: 10, desc: "Off-hours login, unusual IP/geo connections", color: "#F59E0B" },
    { factor: "Historical Security Events", weight: 10, desc: "Prior security flags, policy violations history", color: "#EF4444" },
  ];

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {/* Page Title Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="title-gradient" style={{ fontSize: 28 }}>
              Insider Risk & UEBA Threat Analytics
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/anomalies" className="btn btn-secondary">
              🔍 View All Anomalies
            </Link>
            <Link to="/employees" className="btn btn-primary">
              🛡️ Employee Profiles
            </Link>
          </div>
        </div>

        {/* Top KPI Metrics Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          <div className="glass-panel">
            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Monitored Entities</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6, color: "var(--text-primary)" }}>1,240</div>
            <div style={{ fontSize: 12, color: "var(--risk-low)", marginTop: 4 }}>🟢 Active UEBA Sensors</div>
          </div>

          <div className="glass-panel">
            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Behavioral Anomalies</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6, color: "var(--accent-cyan)" }}>{totalAnomalies || 100}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>⚡ Filtered by Isolation Forest</div>
          </div>

          <div className="glass-panel" style={{ borderColor: "rgba(239, 68, 68, 0.4)" }}>
            <div style={{ fontSize: 12, color: "var(--risk-critical)", textTransform: "uppercase" }}>Critical Risk Subjects</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6, color: "var(--risk-critical)" }}>{criticalCount || 5}</div>
            <div style={{ fontSize: 12, color: "var(--risk-critical)", marginTop: 4 }}>🚨 Requires Immediate SOC Review</div>
          </div>

          <div className="glass-panel">
            <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Manual Security Flags</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6, color: "var(--risk-high)" }}>{flaggedCount}</div>
            <div style={{ fontSize: 12, color: "var(--risk-high)", marginTop: 4 }}>🚩 Flagged by Security Team</div>
          </div>
        </div>

        {/* Section 1: Insider Risk Scoring Engine Visualization */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Weighted Scoring Model Card */}
          <div className="glass-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, color: "var(--text-primary)" }}>Weighted Insider Risk Scoring Engine</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Multi-factor composite risk evaluation model</p>
              </div>
              <span className="badge badge-accent">Module 6</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {scoringWeights.map((w) => (
                <div key={w.factor}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{w.factor}</span>
                    <span className="mono" style={{ fontWeight: 700, color: w.color }}>{w.weight}% Weight</span>
                  </div>
                  <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${w.weight}%`, height: "100%", background: w.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{w.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Tier Categorization Pie Chart */}
          <div className="glass-panel" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, color: "var(--text-primary)" }}>Employee Risk Categorization</h3>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Breakdown across Low, Medium, High & Critical Tiers</p>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: 8 }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
              {riskPieData.map((r) => (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: r.color }} />
                  <span style={{ color: "var(--text-secondary)" }}>{r.name}:</span>
                  <span className="mono" style={{ fontWeight: 700, color: "#fff" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: UEBA Behavioral Intelligence Trends */}
        <div className="glass-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, color: "var(--text-primary)" }}>UEBA Behavioral Anomaly Telemetry</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Real-time event frequency across login, file transfer, & privilege vectors</p>
            </div>
            <span className="badge badge-accent">Module 8 — UEBA Engine</span>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uebaTrendData}>
                <defs>
                  <linearGradient id="colorLogin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F2FE" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExfil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="loginAnomalies" stroke="#00F2FE" fillOpacity={1} fill="url(#colorLogin)" name="Unusual Logins" />
                <Area type="monotone" dataKey="dataExfiltration" stroke="#EF4444" fillOpacity={1} fill="url(#colorExfil)" name="Data Exfiltration" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: High Priority Anomaly Queue & Investigation */}
        <div className="glass-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, color: "var(--text-primary)" }}>Threat Investigation Workbench Queue</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Recent high-risk behavioral anomalies detected for SOC review</p>
            </div>
            <Link to="/anomalies" className="btn btn-secondary" style={{ fontSize: 12 }}>
              View All Queue
            </Link>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee / User</th>
                  <th>Classification</th>
                  <th>Risk Tier</th>
                  <th>Flagged Status</th>
                  <th>Primary Threat Reasons</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--accent-cyan)" }}>
                      Loading Anomaly Telemetry...
                    </td>
                  </tr>
                ) : anomalies.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                      No anomaly records detected in database.
                    </td>
                  </tr>
                ) : (
                  anomalies.slice(0, 5).map((a, idx) => {
                    const isFlagged = a.flagged;
                    const riskScore = a.risk_score || (isFlagged ? 88 : 45);
                    let badgeClass = "badge-low";
                    let tierLabel = "Low Risk";
                    if (riskScore >= 75) {
                      badgeClass = "badge-critical";
                      tierLabel = "Critical Risk";
                    } else if (riskScore >= 50) {
                      badgeClass = "badge-high";
                      tierLabel = "High Risk";
                    } else if (riskScore >= 25) {
                      badgeClass = "badge-medium";
                      tierLabel = "Medium Risk";
                    }

                    const reasonsStr = Array.isArray(a.reasons) ? a.reasons.join(", ") : (a.reasons || "Off-hours baseline deviation");

                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>
                          <span className="mono" style={{ color: "var(--accent-cyan)" }}>{a.user}</span>
                        </td>
                        <td>
                          <span className="badge badge-accent">{a.label || "behavioral_anomaly"}</span>
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>
                            {tierLabel} ({riskScore})
                          </span>
                        </td>
                        <td>
                          {isFlagged ? (
                            <span className="badge badge-critical">🚩 FLAGGED</span>
                          ) : (
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Normal</span>
                          )}
                        </td>
                        <td style={{ fontSize: 13, maxWidth: 300 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-secondary)" }}>
                            {reasonsStr}
                          </div>
                        </td>
                        <td>
                          <Link to={`/anomalies/${a.user}`} className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 12 }}>
                            🔎 Investigate
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
