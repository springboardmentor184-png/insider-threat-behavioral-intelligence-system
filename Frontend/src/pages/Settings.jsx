import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";

function Settings() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">
          <h2>Settings</h2>

          <p>
            Application settings and user preferences will be managed here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;