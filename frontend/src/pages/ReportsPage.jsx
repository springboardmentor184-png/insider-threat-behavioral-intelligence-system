import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const CATEGORY_COLORS = {
  Low: "#2e7d32",
  Medium: "#d4a017",
  High: "#ef6c00",
  Critical: "#c62828",
};

function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [flaggedUsers, setFlaggedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const summaryRes = await api.get("/analytics/risk-summary");
        setSummary(summaryRes.data);

        const [criticalRes, highRes, mediumRes] = await Promise.all([
          api.get("/analytics/risk-scores?category=Critical"),
          api.get("/analytics/risk-scores?category=High"),
          api.get("/analytics/risk-scores?category=Medium"),
        ]);

        setFlaggedUsers([...criticalRes.data, ...highRes.data, ...mediumRes.data]);
      } catch (err) {
        setError("Failed to load report data. Try running risk analysis first.");
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <h2 style={{ marginLeft: "240px", marginTop: "20px" }}>Loading...</h2>;
  if (error) return <p style={{ marginLeft: "240px", marginTop: "20px", color: "red" }}>{error}</p>;

  const pieData = summary
    ? Object.entries(summary.summary).map(([category, count]) => ({
        name: category,
        value: count,
      }))
    : [];

  const barData = flaggedUsers
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 15)
    .map((u) => ({
      name: u.source_user_id,
      score: u.risk_score,
    }));

  return (
    <div>
      <Sidebar />

      <div className="report-content" style={{ marginLeft: "240px", marginTop: "20px", paddingRight: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Insider Threat Anomaly Report</h1>
          <button onClick={handlePrint} className="no-print">
            Download Full Report (PDF)
          </button>
        </div>

        <p>Total users analyzed: <strong>{summary?.total_users_analyzed}</strong></p>
        <p>Flagged users (Medium, High, Critical): <strong>{flaggedUsers.length}</strong></p>

        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", marginTop: "20px" }}>
          <div>
            <h3>Risk Category Distribution</h3>
            <PieChart width={350} height={300}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div>
            <h3>Top 15 Users by Risk Score</h3>
            <BarChart width={500} height={300} data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} fontSize={11} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#c62828" />
            </BarChart>
          </div>
        </div>

        <h3 style={{ marginTop: "30px" }}>All Flagged Users</h3>

        <table border="1" cellPadding="8" style={{ width: "100%", maxWidth: "900px", marginTop: "10px" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Risk Score</th>
              <th>Category</th>
              <th>Total Events</th>
              <th>Days Active</th>
              <th>Avg Login Hour</th>
            </tr>
          </thead>
          <tbody>
            {flaggedUsers
              .sort((a, b) => b.risk_score - a.risk_score)
              .map((u) => (
                <tr key={u.id}>
                  <td>{u.source_user_id}</td>
                  <td>{u.risk_score}</td>
                  <td>{u.risk_category}</td>
                  <td>{u.total_events}</td>
                  <td>{u.unique_days_active}</td>
                  <td>{u.avg_login_hour?.toFixed(2)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsPage;