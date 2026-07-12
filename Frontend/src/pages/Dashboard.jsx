import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="dashboard-body">

          <h2>Dashboard</h2>

          <p>
            Welcome to AI Insider Threat Behavioral Intelligence System.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;