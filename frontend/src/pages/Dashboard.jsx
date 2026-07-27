import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [topRisks, setTopRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const profileRes = await api.get("/profile");
        setUser(profileRes.data.user);

        const summaryRes = await api.get("/analytics/risk-summary");
        setSummary(summaryRes.data);

        const criticalRes = await api.get("/analytics/risk-scores?category=Critical");
        const highRes = await api.get("/analytics/risk-scores?category=High");
        setTopRisks([...criticalRes.data, ...highRes.data].slice(0, 10));
      } catch (err) {
        setError("Some dashboard data could not be loaded. Try running risk analysis first.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const cardStyle = {
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "20px",
    minWidth: "150px",
    textAlign: "center",
  };

  if (loading) return <h2 style={{ marginLeft: "240px", marginTop: "20px" }}>Loading...</h2>;

  return (
    <div>
      <Sidebar />

      <div style={{ marginLeft: "240px", marginTop: "20px", paddingRight: "20px" }}>
        <h1>Dashboard</h1>
        <p>
          Welcome, <strong>{user?.name}</strong> ({user?.role})
        </p>

        {error && <p style={{ color: "orange" }}>{error}</p>}

        <h3 style={{ marginTop: "30px" }}>Insider Risk Overview</h3>

        {summary ? (
          <>
            <p>Total users analyzed: <strong>{summary.total_users_analyzed}</strong></p>

            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
              <div style={{ ...cardStyle, borderColor: "green" }}>
                <h4>Low</h4>
                <p style={{ fontSize: "24px" }}>{summary.summary.Low}</p>
              </div>
              <div style={{ ...cardStyle, borderColor: "#d4a017" }}>
                <h4>Medium</h4>
                <p style={{ fontSize: "24px" }}>{summary.summary.Medium}</p>
              </div>
              <div style={{ ...cardStyle, borderColor: "orange" }}>
                <h4>High</h4>
                <p style={{ fontSize: "24px" }}>{summary.summary.High}</p>
              </div>
              <div style={{ ...cardStyle, borderColor: "red" }}>
                <h4>Critical</h4>
                <p style={{ fontSize: "24px" }}>{summary.summary.Critical}</p>
              </div>
            </div>
          </>
        ) : (
          <p>No risk data yet — run analysis to populate this dashboard.</p>
        )}

        <h3 style={{ marginTop: "30px" }}>Top Flagged Users (High / Critical)</h3>

        {topRisks.length > 0 ? (
          <table border="1" cellPadding="8" style={{ width: "100%", maxWidth: "700px", marginTop: "10px" }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Risk Score</th>
                <th>Category</th>
                <th>Total Events</th>
                <th>Days Active</th>
              </tr>
            </thead>
            <tbody>
              {topRisks.map((r) => (
                <tr key={r.id}>
                  <td>{r.source_user_id}</td>
                  <td>{r.risk_score}</td>
                  <td>{r.risk_category}</td>
                  <td>{r.total_events}</td>
                  <td>{r.unique_days_active}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No flagged users to display.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;