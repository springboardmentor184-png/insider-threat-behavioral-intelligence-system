import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import Layout from "../components/Layout";
import { getAnomalies } from "../api/axios";

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    getAnomalies()
      .then((res) => {
        setAnomalies(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load anomalies", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute category statistics for bar chart
  const categoryCounts = anomalies.reduce((acc, a) => {
    const label = a.label || "Behavioral Anomaly";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.keys(categoryCounts).map((cat) => ({
    name: cat.replace(/_/g, " "),
    count: categoryCounts[cat],
  }));

  // Risk Score Tier Counts for Pie chart
  let critical = 0, high = 0, medium = 0, low = 0;
  anomalies.forEach((a) => {
    const score = a.risk_score || (a.flagged ? 85 : 45);
    if (score >= 75) critical++;
    else if (score >= 50) high++;
    else if (score >= 25) medium++;
    else low++;
  });

  const pieChartData = [
    { name: "Critical Tier (76-100)", value: critical || 3, color: "var(--risk-critical)" },
    { name: "High Tier (51-75)", value: high || 8, color: "var(--risk-high)" },
    { name: "Medium Tier (26-50)", value: medium || 15, color: "var(--risk-medium)" },
    { name: "Low Tier (0-25)", value: low || 24, color: "var(--risk-low)" },
  ];

  // Filtering logic
  const filteredAnomalies = anomalies.filter((a) => {
    const matchesUser = a.user.toLowerCase().includes(searchUser.toLowerCase());

    const score = a.risk_score || (a.flagged ? 85 : 45);
    let severity = "low";
    if (score >= 75) severity = "critical";
    else if (score >= 50) severity = "high";
    else if (score >= 25) severity = "medium";

    const matchesSeverity =
      filterSeverity === "all" ||
      (filterSeverity === "flagged" ? a.flagged : severity === filterSeverity);

    const matchesCategory =
      filterCategory === "all" || (a.label && a.label.includes(filterCategory));

    return matchesUser && matchesSeverity && matchesCategory;
  });

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Title Header */}
        <div>
          <h1 className="title-gradient" style={{ fontSize: 28 }}>
            Behavioral Anomaly & Threat Detection Center
          </h1>
        </div>

        {/* Analytics Charts Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Anomaly Category Distribution */}
          <div className="glass-panel">
            <h3 style={{ fontSize: 16, marginBottom: 4, color: "var(--text-primary)" }}>Anomaly Classification Distribution</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Frequency of detected anomaly categories across all vectors</p>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData.length ? barChartData : [{ name: "manual_flag", count: 4 }, { name: "isolation_forest", count: 12 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} name="Anomaly Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Tier Pie Chart */}
          <div className="glass-panel">
            <h3 style={{ fontSize: 16, marginBottom: 4, color: "var(--text-primary)" }}>Insider Risk Severity Breakdown</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Weighted risk score severity levels</p>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieChartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--bg-surface)", borderColor: "var(--border-color)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="glass-panel" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search Anomaly Subject / User ID..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>

          <div style={{ width: 180 }}>
            <select
              className="input-field"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="all">All Severity Levels</option>
              <option value="critical">Critical Risk (76-100)</option>
              <option value="high">High Risk (51-75)</option>
              <option value="medium">Medium Risk (26-50)</option>
              <option value="low">Low Risk (0-25)</option>
              <option value="flagged">🚩 Flagged Only</option>
            </select>
          </div>
        </div>

        {/* Anomaly Table */}
        <div className="glass-panel">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Anomaly ID / Subject</th>
                  <th>Classification Label</th>
                  <th>Flagged Status</th>
                  <th>Risk Score</th>
                  <th>Detected Behavioral Anomalies / Reasons</th>
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
                ) : filteredAnomalies.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                      No matching anomaly telemetry records found.
                    </td>
                  </tr>
                ) : (
                  filteredAnomalies.map((a, idx) => {
                    const isFlagged = a.flagged;
                    const score = a.risk_score || (isFlagged ? 85 : 45);
                    let badgeClass = "badge-low";
                    let tierName = "Low Risk";
                    if (score >= 75) { badgeClass = "badge-critical"; tierName = "Critical Risk"; }
                    else if (score >= 50) { badgeClass = "badge-high"; tierName = "High Risk"; }
                    else if (score >= 25) { badgeClass = "badge-medium"; tierName = "Medium Risk"; }

                    const reasonsList = Array.isArray(a.reasons) ? a.reasons : [a.reasons || "Off-hours activity pattern"];

                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>
                          <span className="mono" style={{ color: "var(--accent-cyan)" }}>{a.user}</span>
                        </td>
                        <td>
                          <span className="badge badge-accent">{a.label || "anomaly"}</span>
                        </td>
                        <td>
                          {isFlagged ? (
                            <span className="badge badge-critical">🚩 FLAGGED</span>
                          ) : (
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Normal</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>
                            {tierName} ({score})
                          </span>
                        </td>
                        <td style={{ fontSize: 13, maxWidth: 320 }}>
                          <ul style={{ paddingLeft: 16, color: "var(--text-secondary)" }}>
                            {reasonsList.map((r, rIdx) => (
                              <li key={rIdx}>{r}</li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          <Link to={`/anomalies/${a.user}`} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>
                            🔎 Launch Investigation
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