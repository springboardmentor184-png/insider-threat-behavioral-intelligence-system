import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { toast } from "react-toastify";
import {

    getAlertDashboard,

    assignAlert,

    escalateAlert,

    resolveAlert

} from "../services/alertManagementService";

import "../styles/dashboard.css";

function ThreatAlerts() {

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {

    try {

      const data = await getAlertDashboard();

      setAlerts(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  const handleAssign = async (alertId) => {

  const analyst = prompt("Enter Analyst Name");

  if (!analyst) return;

  try {

    await assignAlert(
      alertId,
      analyst
    );

    toast.success(
      "Analyst Assigned Successfully"
    );

    loadAlerts();

  } catch (error) {

    console.error(error);

    toast.error(
      "Assignment Failed"
    );

  }

};

const handleEscalate = async (alertId) => {

  try {

    await escalateAlert(alertId);

    toast.success(
      "Alert Escalated Successfully"
    );

    loadAlerts();

  } catch (error) {

    console.error(error);

    toast.error(
      "Escalation Failed"
    );

  }

};

const handleResolve = async (alertId) => {

  const notes = prompt(
    "Enter Resolution Notes"
  );

  if (!notes) return;

  try {

    await resolveAlert(
      alertId,
      notes
    );

    toast.success(
      "Alert Resolved Successfully"
    );

    loadAlerts();

  } catch (error) {

    console.error(error);

    toast.error(
      "Resolution Failed"
    );

  }

};

  const totalAlerts = alerts.length;

  const criticalAlerts =
    alerts.filter(
      (a) => a.severity === "Critical"
    ).length;

  const highAlerts =
    alerts.filter(
      (a) => a.severity === "High"
    ).length;

  const openAlerts =
    alerts.filter(
      (a) => a.status === "Open"
    ).length;

  const resolvedAlerts =
    alerts.filter(
      (a) => a.status === "Resolved"
    ).length;

  const severityBadge = (severity) => {

    switch (severity) {

      case "Critical":
        return "badge bg-dark";

      case "High":
        return "badge bg-danger";

      case "Medium":
        return "badge bg-warning text-dark";

      default:
        return "badge bg-success";

    }

  };


  return (

    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="dashboard-body">

          <div className="mb-4">

            <h2 className="fw-bold">

              Alert Management Dashboard

            </h2>

            <p className="text-muted">

              AI Generated Insider Threat Alerts

            </p>

          </div>

          {/* KPI Cards */}

          <div className="row mb-4">

            <div className="col-md-2">

              <div className="card shadow text-center">

                <div className="card-body">

                  <h3>{totalAlerts}</h3>

                  <small>Total Alerts</small>

                </div>

              </div>

            </div>

            <div className="col-md-2">

              <div className="card shadow text-center border-danger">

                <div className="card-body">

                  <h3 className="text-danger">

                    {criticalAlerts}

                  </h3>

                  <small>Critical</small>

                </div>

              </div>

            </div>

            <div className="col-md-2">

              <div className="card shadow text-center border-warning">

                <div className="card-body">

                  <h3 className="text-warning">

                    {highAlerts}

                  </h3>

                  <small>High</small>

                </div>

              </div>

            </div>

            <div className="col-md-2">

              <div className="card shadow text-center border-primary">

                <div className="card-body">

                  <h3 className="text-primary">

                    {openAlerts}

                  </h3>

                  <small>Open</small>

                </div>

              </div>

            </div>

            <div className="col-md-2">

              <div className="card shadow text-center border-success">

                <div className="card-body">

                  <h3 className="text-success">

                    {resolvedAlerts}

                  </h3>

                  <small>Resolved</small>

                </div>

              </div>

            </div>

          </div>

          {/* Alert Table */}

          <div className="card shadow">

            <div className="card-body">

              <h4 className="mb-4">

                Recent Threat Alerts

              </h4>

              {loading ? (

                <div className="text-center py-5">

                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>

                </div>

              ) : alerts.length === 0 ? (

                <div className="alert alert-info">

                  No Threat Alerts Found

                </div>

              ) : (

                <div className="table-responsive">

                  <table className="table table-hover align-middle">

                    <thead className="table-light">

                      <tr>

                        <th>Severity</th>

                        <th>Employee</th>

                        <th>Department</th>

                        <th>Status</th>

                        <th>Escalation</th>

                        <th>Analyst</th>

                        <th>Created</th>

                        <th>Actions</th>

                      </tr>

                    </thead>

                    <tbody>

                      {alerts.map((alert) => (

                        <tr key={alert.id}>

                          <td>

                            <span
                              className={severityBadge(
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

                            {alert.status}

                          </td>

                          <td>

                            Level {alert.escalation_level}

                          </td>

                          <td>

                            {alert.assigned_analyst}

                          </td>

                          <td>

                            {new Date(
                              alert.created_at
                            ).toLocaleDateString()}

                          </td>

                          <td>

                            <button
                              className="btn btn-primary btn-sm me-2"
                              onClick={() =>
                                handleAssign(alert.id)
                              }
                            >

                              Assign

                            </button>

                            <button
                              className="btn btn-warning btn-sm me-2"
                              onClick={() =>
                                handleEscalate(alert.id)
                              }
                            >

                              Escalate

                            </button>

                            <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleResolve(alert.id)
                            }
                          >

                            Resolve

                          </button>

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

    </div>

  );

}

export default ThreatAlerts;