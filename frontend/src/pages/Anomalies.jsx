import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import Layout from "../components/Layout";
import { getAnomalies } from "../api/axios";

export default function Anomalies() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnomalies()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <p style={{ color: "var(--text-secondary)" }}>Loading anomaly reports...</p>
      </Layout>
    );
  }

  const flaggedCount = data.filter((d) => d.flagged).length;
  const normalCount = data.length - flaggedCount;
  const avgRisk = data.length
    ? (data.reduce((sum, d) => sum + (d.risk_score || 0), 0) / data.length).toFixed(2)
    : 0;

  const pieData = [
    { name: "Normal", value: normalCount },
    { name: "Flagged", value: flaggedCount },
  ];
  const pieColors = ["var(--accent-dim)", "#e05555"];

  const topRisky = [...data]
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 8)
    .map((d) => ({ user: d.user.split(".")[0], score: d.risk_score }));

  const stats = [
    { label: "Total employees", value: data.length },
    { label: "Flagged as risky", value: flaggedCount },
    { label: "Avg risk score", value: avgRisk },
  ];

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Anomaly Reports</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
          Behavioral risk analysis across all monitored employees
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="field-label" style={{ marginBottom: 8 }}>{stat.label}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="field-label" style={{ marginBottom: 12 }}>Normal vs Flagged</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((entry, i) => (
                  <Cell key={entry.name} fill={pieColors[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="field-label" style={{ marginBottom: 12 }}>Top Risk Scores</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topRisky}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-hairline)" />
              <XAxis dataKey="user" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary)" }} domain={[0, 5]} />
              <Tooltip />
              <Bar dataKey="score" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-hairline)" }}>
              {["User", "Risk Score", "RF Probability", "Status", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.user} style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                <td style={{ padding: "12px 16px", fontSize: 14 }}>{row.user}</td>
                <td className="mono" style={{ padding: "12px 16px", fontSize: 13 }}>{row.risk_score}</td>
                <td className="mono" style={{ padding: "12px 16px", fontSize: 13 }}>{row.rf_malicious_prob}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span className={row.flagged ? "badge badge-accent" : "badge"} style={row.flagged ? { background: "#e0555522", color: "#e05555" } : {}}>
                    {row.flagged ? "Flagged" : "Normal"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <Link to={`/anomalies/${row.user}`} style={{ color: "var(--accent)", fontSize: 13, textDecoration: "none" }}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}