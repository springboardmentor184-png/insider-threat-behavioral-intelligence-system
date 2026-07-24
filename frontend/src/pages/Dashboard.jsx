import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        setUser(res.data.user);
      } catch (err) {
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <h2 style={{ marginLeft: "220px" }}>Loading...</h2>;

  const cardStyle = {
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "20px",
    minWidth: "200px",
  };

  const renderRoleCards = () => {
    switch (user?.role) {
      case "Security Analyst":
        return (
          <>
            <div style={cardStyle}><h4>Threat Alerts</h4><p>Coming in Milestone 2</p></div>
            <div style={cardStyle}><h4>Risk Scores</h4><p>Coming in Milestone 2</p></div>
            <div style={cardStyle}><h4>Investigation Queue</h4><p>Coming in Milestone 2</p></div>
          </>
        );
      case "SOC Engineer":
        return (
          <>
            <div style={cardStyle}><h4>Security Events</h4><p>Coming in Milestone 2</p></div>
            <div style={cardStyle}><h4>Behavioral Anomalies</h4><p>Coming in Milestone 2</p></div>
          </>
        );
      case "Security Manager":
        return (
          <>
            <div style={cardStyle}><h4>Organizational Risk Posture</h4><p>Coming in Milestone 2</p></div>
            <div style={cardStyle}><h4>Risk Trends</h4><p>Coming in Milestone 2</p></div>
          </>
        );
      case "Administrator":
        return (
          <>
            <div style={cardStyle}><h4>User Management</h4><p>Coming in Milestone 2</p></div>
            <div style={cardStyle}><h4>System Monitoring</h4><p>Coming in Milestone 2</p></div>
          </>
        );
      default:
        return <p>No dashboard view configured for this role yet.</p>;
    }
  };

  return (
    <div>
      <Sidebar />

      <div style={{ marginLeft: "220px", padding: "20px" }}>
        <h1>Dashboard</h1>
        <p>
          Welcome, <strong>{user?.name}</strong> ({user?.role})
        </p>

        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "20px" }}>
          {renderRoleCards()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;