import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="bi bi-shield-lock-fill"></i>
        </div>

        <div>
          <h4>AI Insider</h4>
          <p>Threat Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-grid-fill"></i>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/employees"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-people-fill"></i>
          <span>Employees</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-bar-chart-fill"></i>
          <span>Analytics</span>
        </NavLink>

        <NavLink
          to="/activitylogs"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-clock-history"></i>
          <span>Activity Logs</span>
        </NavLink>

        <NavLink
          to="/threatalerts"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-shield-exclamation"></i>
          <span>Threat Alerts</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-gear-fill"></i>
          <span>Settings</span>
        </NavLink>

      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span> Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;