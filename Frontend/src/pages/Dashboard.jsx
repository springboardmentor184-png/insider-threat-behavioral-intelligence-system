import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ActivityChart from "../components/charts/ActivityChart";
import RiskChart from "../components/charts/RiskChart";
import ActivityTable from "../components/ActivityTable";
import ThreatAlerts from "../components/ThreatAlerts";

import { getEmployees } from "../services/employeeService";

import "../styles/dashboard.css";

function Dashboard() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const totalEmployees = employees.length;

  const lowRisk = employees.filter(
    (emp) => emp.risk_score <= 20
  ).length;

  const mediumRisk = employees.filter(
    (emp) => emp.risk_score > 20 && emp.risk_score <= 60
  ).length;

  const highRisk = employees.filter(
    (emp) => emp.risk_score > 60
  ).length;

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">

          {/* Header */}
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

          {/* Statistics */}
          <div className="stats-grid">

            <StatCard
              title="Total Employees"
              value={totalEmployees}
              icon="bi-people-fill"
              color="primary-bg"
              change="Live Data"
            />

            <StatCard
              title="High Risk Employees"
              value={highRisk}
              icon="bi-shield-exclamation"
              color="danger-bg"
              change="Risk Score > 60"
            />

            <StatCard
              title="Medium Risk Employees"
              value={mediumRisk}
              icon="bi-graph-up-arrow"
              color="warning-bg"
              change="Risk Score 21–60"
            />

            <StatCard
              title="Low Risk Employees"
              value={lowRisk}
              icon="bi-person-check-fill"
              color="success-bg"
              change="Risk Score ≤ 20"
            />

          </div>

          {/* Charts */}
          <div className="charts-grid">
            <RiskChart employees={employees} />
            <ActivityChart employees={employees} />
          </div>

          {/* Activity */}
          <ActivityTable />

          {/* Alerts */}
          <ThreatAlerts />

        </div>
      </div>
    </div>
  );
}

export default Dashboard;