import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import StatCard from "../components/StatCard";

import ActivityChart from "../components/charts/ActivityChart";
import RiskChart from "../components/charts/RiskChart";

import ActivityTable from "../components/ActivityTable";

import { getEmployees } from "../services/employeeService";

import {
  getExecutiveDashboard
} from "../services/analyticsService";

import {
  getAlertDashboard
} from "../services/alertManagementService";

import ThreatInvestigationChart
  from "../components/charts/ThreatInvestigationChart";

import DepartmentRiskChart
  from "../components/charts/DepartmentRiskChart";

import "../styles/dashboard.css";


function Dashboard() {

  const navigate = useNavigate();


  // ==========================================
  // State
  // ==========================================

  const [employees, setEmployees] = useState([]);

  const [analytics, setAnalytics] = useState(null);

  const [recentAlerts, setRecentAlerts] = useState([]);

  const [lastUpdated, setLastUpdated] = useState(null);

  const [loading, setLoading] = useState(true);


  // ==========================================
  // Load Dashboard Data
  // ==========================================

  const loadDashboardData = useCallback(async () => {

    try {

      const [
        employeeData,
        analyticsData,
        alertData
      ] = await Promise.all([

        getEmployees(),

        getExecutiveDashboard(),

        getAlertDashboard()

      ]);


      setEmployees(employeeData || []);

      setAnalytics(analyticsData || null);

      setRecentAlerts(
        (alertData || []).slice(0, 5)
      );

      // Update dashboard refresh time
      setLastUpdated(new Date());

    } catch (error) {

      console.error(
        "Error loading dashboard data:",
        error
      );

    } finally {

      setLoading(false);

    }

  }, []);


  // ==========================================
  // Initial Load + Auto Refresh
  // ==========================================

  useEffect(() => {

    loadDashboardData();

    const interval = setInterval(() => {

      loadDashboardData();

    }, 30000);


    return () => {

      clearInterval(interval);

    };

  }, [loadDashboardData]);


  // ==========================================
  // Loading
  // ==========================================

  if (loading) {

    return (

      <div className="dashboard-container">

        <Sidebar />

        <div className="main-content">

          <Navbar />

          <div className="dashboard-body">

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              >

                <span className="visually-hidden">
                  Loading...
                </span>

              </div>

              <p className="mt-3">
                Loading security dashboard...
              </p>

            </div>

          </div>

        </div>

      </div>

    );

  }


  // ==========================================
  // Default Analytics
  // ==========================================

  const dashboard = analytics || {

    total_employees: 0,

    high_risk_employees: 0,

    critical_risk_employees: 0,

    average_risk_score: 0,

    total_alerts: 0,

    critical_alerts: 0,

    high_alerts: 0,

    medium_alerts: 0,

    low_alerts: 0,

    open_alerts: 0,

    resolved_alerts: 0,

    total_investigations: 0,

    active_investigations: 0,

    resolved_investigations: 0,

    critical_investigations: 0,

    high_investigations: 0

  };


  // ==========================================
  // Severity Badge
  // ==========================================

  const getSeverityClass = (severity) => {

    switch (severity) {

      case "Critical":
        return "badge bg-dark";

      case "High":
        return "badge bg-danger";

      case "Medium":
        return "badge bg-warning text-dark";

      case "Low":
        return "badge bg-success";

      default:
        return "badge bg-secondary";

    }

  };


  // ==========================================
  // Format Date
  // ==========================================

  const formatAlertDate = (date) => {

    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString();

  };


  // ==========================================
  // Clickable Card Style
  // ==========================================

  const clickableCardStyle = {
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  };


  // ==========================================
  // Dashboard
  // ==========================================

  return (

    <div className="dashboard-container">

      <Sidebar />


      <div className="main-content">

        <Navbar />


        <div className="dashboard-body">


          {/* ======================================
                  Executive Dashboard Header
              ====================================== */}

              <div className="dashboard-header mb-4">

                <div>

                  <h2 className="mb-1">
                    Executive Security Dashboard
                  </h2>

                  <p className="mb-0 text-muted">
                    Security overview of the Insider Threat Behavioral Intelligence System.
                  </p>

                </div>

                <div className="dashboard-date">

                  <h5 className="mb-1">
                    {new Date().toLocaleDateString()}
                  </h5>

                  <div className="live-monitoring">

                    <span className="live-dot"></span>

                    <span>
                      Live Monitoring
                    </span>

                  </div>

                  {lastUpdated && (

                    <small className="text-muted d-block mt-1">

                      Last updated{" "}
                      {lastUpdated.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}

                    </small>

                  )}

                </div>

              </div>

          {/* ======================================
              Executive KPI Cards
          ====================================== */}

          <div className="stats-grid">


            {/* Total Employees */}

            <div
              style={clickableCardStyle}
              onClick={() => navigate("/employees")}
              title="Open Employee Management"
            >

              <StatCard
                title="Total Employees"
                value={dashboard.total_employees}
                icon="bi-people-fill"
                color="primary-bg"
                change="Active Workforce"
              />

            </div>


            {/* High Risk Employees */}

            <div
              style={clickableCardStyle}
              onClick={() => navigate("/prediction")}
              title="Open AI Threat Prediction"
            >

              <StatCard
                title="High Risk Employees"
                value={dashboard.high_risk_employees}
                icon="bi-shield-exclamation"
                color="danger-bg"
                change="Risk Score ≥ 70"
              />

            </div>


            {/* Critical Risk Employees */}

            <div
              style={clickableCardStyle}
              onClick={() => navigate("/prediction")}
              title="Open AI Threat Prediction"
            >

              <StatCard
                title="Critical Risk Employees"
                value={dashboard.critical_risk_employees}
                icon="bi-exclamation-octagon-fill"
                color="danger-bg"
                change="Risk Score ≥ 90"
              />

            </div>


            {/* Average Risk Score */}

            <div
              style={clickableCardStyle}
              onClick={() => navigate("/analytics")}
              title="Open Security Analytics"
            >

              <StatCard
                title="Average Risk Score"
                value={dashboard.average_risk_score}
                icon="bi-speedometer2"
                color="warning-bg"
                change="Organization Average"
              />

            </div>

          </div>


          {/* ======================================
              Alert & Investigation KPI Cards
          ====================================== */}

          <div className="stats-grid mt-4">


            {/* Total Alerts */}

            <div
              style={clickableCardStyle}
              onClick={() => navigate("/threatalerts")}
              title="Open Threat Alerts"
            >

              <StatCard
                title="Total Alerts"
                value={dashboard.total_alerts}
                icon="bi-bell-fill"
                color="primary-bg"
                change="Generated Threat Alerts"
              />

            </div>


            {/* Critical Alerts */}

            <div
              style={clickableCardStyle}
              onClick={() => navigate("/threatalerts")}
              title="Open Critical Alerts"
            >

              <StatCard
                title="Critical Alerts"
                value={dashboard.critical_alerts}
                icon="bi-exclamation-triangle-fill"
                color="danger-bg"
                change="Immediate Attention"
              />

            </div>


            {/* Open Alerts */}

            <div
              style={clickableCardStyle}
              onClick={() => navigate("/threatalerts")}
              title="Open Active Alerts"
            >

              <StatCard
                title="Open Alerts"
                value={dashboard.open_alerts}
                icon="bi-folder2-open"
                color="warning-bg"
                change="Awaiting Resolution"
              />

            </div>


            {/* Active Investigations */}

            <div
              style={clickableCardStyle}
              onClick={() => navigate("/investigation")}
              title="Open Investigations"
            >

              <StatCard
                title="Active Investigations"
                value={dashboard.active_investigations}
                icon="bi-search"
                color="danger-bg"
                change="Under Investigation"
              />

            </div>

          </div>


          {/* ======================================
              Security Risk Overview
          ====================================== */}

          <div className="card shadow-sm mt-4">

            <div className="card-body">

              <h4 className="mb-4">
                Security Risk Overview
              </h4>


              <div className="row">


                <div className="col-md-4 mb-3">

                  <div className="p-3 bg-light rounded">

                    <h6 className="text-muted">
                      Average Risk Score
                    </h6>

                    <h3 className="fw-bold">

                      {dashboard.average_risk_score}

                      <small className="text-muted">
                        /100
                      </small>

                    </h3>

                  </div>

                </div>


                <div className="col-md-4 mb-3">

                  <div className="p-3 bg-light rounded">

                    <h6 className="text-muted">
                      High Risk Employees
                    </h6>

                    <h3 className="fw-bold text-danger">

                      {dashboard.high_risk_employees}

                    </h3>

                  </div>

                </div>


                <div className="col-md-4 mb-3">

                  <div className="p-3 bg-light rounded">

                    <h6 className="text-muted">
                      Critical Risk Employees
                    </h6>

                    <h3 className="fw-bold text-danger">

                      {dashboard.critical_risk_employees}

                    </h3>

                  </div>

                </div>


              </div>

            </div>

          </div>


          {/* ======================================
    Threat & Investigation Summary
====================================== */}

<div className="card shadow-sm mt-4">

  <div className="card-body">

    <h4 className="mb-4">
      Threat & Investigation Summary
    </h4>


    <div className="row">


      {/* ======================================
          Alert Status
      ====================================== */}

      <div className="col-md-6">

        <h6 className="fw-bold mb-3">
          Alert Status
        </h6>


        <div className="d-flex justify-content-between mb-2">

          <span>
            Critical Alerts
          </span>

          <strong className="text-danger">
            {dashboard.critical_alerts}
          </strong>

        </div>


        <div className="d-flex justify-content-between mb-2">

          <span>
            High Alerts
          </span>

          <strong className="text-danger">
            {dashboard.high_alerts}
          </strong>

        </div>


        <div className="d-flex justify-content-between mb-2">

          <span>
            Open Alerts
          </span>

          <strong>
            {dashboard.open_alerts}
          </strong>

        </div>


        <div className="d-flex justify-content-between">

          <span>
            Resolved Alerts
          </span>

          <strong className="text-success">
            {dashboard.resolved_alerts}
          </strong>

        </div>

      </div>


      {/* ======================================
          Investigation Status
      ====================================== */}

      <div className="col-md-6">

        <h6 className="fw-bold mb-3">
          Investigation Status
        </h6>


        <div className="d-flex justify-content-between mb-2">

          <span>
            Total Investigations
          </span>

          <strong>
            {dashboard.total_investigations}
          </strong>

        </div>


        <div className="d-flex justify-content-between mb-2">

          <span>
            Active Investigations
          </span>

          <strong className="text-danger">
            {dashboard.active_investigations}
          </strong>

        </div>


        <div className="d-flex justify-content-between mb-2">

          <span>
            Critical Investigations
          </span>

          <strong className="text-danger">
            {dashboard.critical_investigations}
          </strong>

        </div>


        <div className="d-flex justify-content-between">

          <span>
            Resolved Investigations
          </span>

          <strong className="text-success">
            {dashboard.resolved_investigations}
          </strong>

        </div>

      </div>


    </div>


    {/* ======================================
        Threat & Investigation Chart
    ====================================== */}

    <div className="mt-4">

      <ThreatInvestigationChart
        analytics={dashboard}
      />

    </div>


  </div>

</div>

{/* ======================================
    Department Risk Analytics
====================================== */}

<div className="mt-4">

  <DepartmentRiskChart
    employees={employees}
  />

</div>

{/* ======================================
    Executive Security Summary
====================================== */}

<div className="card shadow-sm mt-4">

  <div className="card-body">

    <h4 className="mb-2">
      Executive Security Summary
    </h4>

    <p className="text-muted mb-4">
      Current security posture across the organization.
    </p>


    <div className="row g-3">


      {/* Employees Monitored */}

      <div className="col-md-3">

        <div className="p-3 border rounded h-100">

          <small className="text-muted">
            Employees Monitored
          </small>

          <h3 className="mt-2 mb-0">
            {dashboard.total_employees}
          </h3>

        </div>

      </div>


      {/* High Risk */}

      <div className="col-md-3">

        <div className="p-3 border rounded h-100">

          <small className="text-muted">
            High Risk Employees
          </small>

          <h3 className="text-danger mt-2 mb-0">
            {dashboard.high_risk_employees}
          </h3>

        </div>

      </div>


      {/* Critical Risk */}

      <div className="col-md-3">

        <div className="p-3 border rounded h-100">

          <small className="text-muted">
            Critical Risk Employees
          </small>

          <h3 className="text-danger mt-2 mb-0">
            {dashboard.critical_risk_employees}
          </h3>

        </div>

      </div>


      {/* Active Investigations */}

      <div className="col-md-3">

        <div className="p-3 border rounded h-100">

          <small className="text-muted">
            Active Investigations
          </small>

          <h3 className="text-warning mt-2 mb-0">
            {dashboard.active_investigations}
          </h3>

        </div>

      </div>


    </div>


    {/* Monitoring Status */}

    <div className="alert alert-success mt-4 mb-0">

      <i className="bi bi-shield-check me-2"></i>

      <strong>
        Security Monitoring Active
      </strong>

      <span className="ms-2">
        The platform is actively monitoring employee
        behavioral risk, threat alerts, and investigations.
      </span>

    </div>

  </div>

</div>

          {/* ======================================
              Security Analytics Charts
          ====================================== */}

          <div className="charts-grid">

            <RiskChart
              employees={employees}
            />

            <ActivityChart
              employees={employees}
            />

          </div>


          {/* ======================================
              Activity Table
          ====================================== */}

          <ActivityTable />


          {/* ======================================
              Recent Threat Alerts
          ====================================== */}

          <div className="alerts-card">

            <div className="d-flex justify-content-between align-items-center mb-3">

              <div>

                <h4 className="mb-1">
                  Recent Threat Alerts
                </h4>

                <small className="text-muted">
                  Latest alerts generated by the threat detection engine
                </small>

              </div>


              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate("/threatalerts")}
              >
                View All Alerts
              </button>

            </div>


            {recentAlerts.length === 0 ? (

              <div className="alert alert-info mb-0">

                No threat alerts found.

              </div>

            ) : (

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead>

                    <tr>

                      <th>
                        Severity
                      </th>

                      <th>
                        Employee
                      </th>

                      <th>
                        Department
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Escalation
                      </th>

                      <th>
                        Analyst
                      </th>

                      <th>
                        Created
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {recentAlerts.map((alert) => (

                      <tr
                        key={alert.id}
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate("/threatalerts")
                        }
                        title="Open Threat Alerts"
                      >


                        <td>

                          <span
                            className={getSeverityClass(
                              alert.severity
                            )}
                          >

                            {alert.severity}

                          </span>

                        </td>


                        <td>

                          <strong>
                            {alert.employee_code}
                          </strong>

                          <br />

                          <small>
                            {alert.full_name}
                          </small>

                        </td>


                        <td>
                          {alert.department}
                        </td>


                        <td>

                          <span
                            className={
                              alert.status === "Resolved"
                                ? "badge bg-success"
                                : "badge bg-primary"
                            }
                          >

                            {alert.status}

                          </span>

                        </td>


                        <td>
                          Level {alert.escalation_level}
                        </td>


                        <td>
                          {alert.assigned_analyst}
                        </td>


                        <td>
                          {formatAlertDate(
                            alert.created_at
                          )}
                        </td>


                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>


        </div>

      </div>

    </div>

  );

}


export default Dashboard;