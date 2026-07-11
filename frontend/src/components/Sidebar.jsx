import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        background: "#e5e7eb",
        height: "100vh",
        padding: "20px",
      }}
    >
      <h3>Menu</h3>

      <p>
        <Link to="/dashboard">📊 Dashboard</Link>
      </p>

      <p>
        <Link to="/employees">👥 Employees</Link>
      </p>

      <p>
        <Link to="/activities">📋 Activities</Link>
      </p>
    </div>
  );
}