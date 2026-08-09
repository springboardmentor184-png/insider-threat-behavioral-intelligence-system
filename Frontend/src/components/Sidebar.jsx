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

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-grid-fill"></i>
          <span>Dashboard</span>
        </NavLink>

        {/* Employees */}
        <NavLink
          to="/employees"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-people-fill"></i>
          <span>Employees</span>
        </NavLink>

        {/* Analytics */}
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-bar-chart-fill"></i>
          <span>UEBA Intelligence</span>
        </NavLink>

          {/* Threat Investigation */}
          <NavLink
            to="/investigation"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <i className="bi bi-binoculars-fill"></i>
            <span>Threat Investigation</span>
          </NavLink>

        {/* Activity Logs */}
        <NavLink
          to="/activitylogs"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-clock-history"></i>
          <span>Activity Logs</span>
        </NavLink>

        {/* Threat Alerts */}
        <NavLink
          to="/threatalerts"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-shield-exclamation"></i>
          <span>Threat Alerts</span>
        </NavLink>

        {/* AI Prediction */}
        <NavLink
          to="/prediction"
          className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }
        >
          <i className="bi bi-cpu-fill"></i>
          <span>AI Prediction</span>
        </NavLink>

        {/* Settings */}
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