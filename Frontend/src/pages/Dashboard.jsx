import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ActivityChart from "../components/charts/ActivityChart";
import RiskChart from "../components/charts/RiskChart";
import ActivityTable from "../components/ActivityTable";
import ThreatAlerts from "../components/ThreatAlerts";

import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">
          {/* Page Heading */}
          <div className="dashboard-header">

              <div>
                <h2>Security Operations Center</h2>
                <p>
                  Welcome back, Darshan. Here's today's security overview and employee activity.
                </p>
              </div>

              <div className="dashboard-date">
                <h5>{new Date().toLocaleDateString()}</h5>
                <span>Live Monitoring</span>
              </div>

            </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <StatCard
              title="Total Employees"
              value="1,250"
              icon="bi-people-fill"
              color="primary-bg"
              change="+12% this week"
            />

            <StatCard
              title="Threat Alerts"
              value="18"
              icon="bi-shield-exclamation"
              color="danger-bg"
              change="+3 Today"
            />

            <StatCard
              title="Risk Score"
              value="84%"
              icon="bi-graph-up-arrow"
              color="warning-bg"
              change="Stable"
            />

            <StatCard
              title="Active Sessions"
              value="320"
              icon="bi-laptop"
              color="success-bg"
              change="Online"
            />
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <ActivityChart />
            <RiskChart />
          </div>

          {/* Activity Table */}
          <ActivityTable />
          <ThreatAlerts />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;