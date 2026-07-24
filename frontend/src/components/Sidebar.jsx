import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const linkStyle = {
    display: "block",
    padding: "10px 15px",
    textDecoration: "none",
    color: "black",
  };

  return (
    <div
      style={{
        width: "200px",
        minHeight: "100vh",
        borderRight: "1px solid #ccc",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <h3 style={{ padding: "15px" }}>InsiderThreat</h3>

      <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
      <Link to="/employees" style={linkStyle}>Employees</Link>
      <Link to="/departments" style={linkStyle}>Departments</Link>
      <Link to="/device" style={linkStyle}>Device</Link>
      <Link to="/profile" style={linkStyle}>Profile</Link>

      <button
        onClick={handleLogout}
        style={{ margin: "15px", padding: "8px 12px" }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;