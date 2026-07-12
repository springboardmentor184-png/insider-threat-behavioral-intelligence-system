import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function ThreatAlerts() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <h2>Threat Alerts</h2>

          <p>
            All detected insider threat alerts will appear here after backend integration.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ThreatAlerts;