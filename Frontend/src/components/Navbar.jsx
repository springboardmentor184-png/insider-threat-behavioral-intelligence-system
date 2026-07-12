function Navbar() {
  return (
    <nav className="navbar bg-white shadow-sm px-4 py-3">
      <div>
        <h4 className="mb-0">Dashboard</h4>
        <small className="text-muted">
          Welcome to AI Insider Threat Behavioral Intelligence System
        </small>
      </div>

      <div className="d-flex align-items-center">

        <i
          className="bi bi-bell fs-4 me-4"
          style={{ cursor: "pointer" }}
        ></i>

        <div className="d-flex align-items-center">

          <i className="bi bi-person-circle fs-2 me-2"></i>

          <div>
            <strong>Darshan</strong>
            <br />
            <small>Administrator</small>
          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;