function Sidebar() {
  return (
    <div
      className="bg-dark text-white p-4"
      style={{ width: "250px", minHeight: "100vh" }}
    >

      <h3 className="mb-5">
        🛡 AI Insider Threat
      </h3>

      <ul className="nav flex-column">

        <li className="nav-item mb-3">
          <a href="#" className="nav-link text-white">
            🏠 Dashboard
          </a>
        </li>

        <li className="nav-item mb-3">
          <a href="#" className="nav-link text-white">
            👤 Profile
          </a>
        </li>

        <li className="nav-item mb-3">
          <a href="#" className="nav-link text-white">
            📄 Activity Logs
          </a>
        </li>

        <li className="nav-item mb-3">
          <a href="#" className="nav-link text-white">
            ⚠ Threat Alerts
          </a>
        </li>

        <li className="nav-item">
          <a href="#" className="nav-link text-white">
            🚪 Logout
          </a>
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;