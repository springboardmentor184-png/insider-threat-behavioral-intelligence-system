import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Analytics() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <h2>Analytics</h2>

          <p>
            AI-powered analytics and security insights will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Analytics;