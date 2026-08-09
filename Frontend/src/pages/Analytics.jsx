import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
//import api from "../services/api";
import { getEmployees } from "../services/employeeService";
import { getUEBAIntelligence } from "../services/uebaService";
import "../styles/dashboard.css";

function Analytics() 
{
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [ueba, setUeba] = useState(null);
  const [loading, setLoading] = useState(false);

  // -------------------------
  // Load Employees
  // -------------------------
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
  try {
    const data = await getEmployees();

    setEmployees(data);
  } catch (error) {
    console.error("Error loading employees:", error);
  }
};

  // -------------------------
  // Load UEBA Intelligence
  // -------------------------
  const loadUEBA = async () => {
    if (!selectedEmployee) return;

    try {
      setLoading(true);

      const data = await getUEBAIntelligence(selectedEmployee);

      setUeba(data);
    } catch (error) {
      console.error("Error loading UEBA:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">

          <h2 className="mb-4">
            UEBA Intelligence Dashboard
          </h2>

          <div className="card shadow-sm mb-4">

            <div className="card-body">

              <h5 className="mb-3">

                Select Employee

              </h5>

              <div className="row">

                <div className="col-md-8">

                  <select
                    className="form-select"
                    value={selectedEmployee}
                    onChange={(e) =>
                      setSelectedEmployee(e.target.value)
                    }
                  >

                    <option value="">
                      Select Employee
                    </option>

                    {employees.map((employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.employee_id} - {employee.full_name}
                      </option>
                    ))}

                  </select>

                </div>

                <div className="col-md-4">

                  <button
                    className="btn btn-primary w-100"
                    onClick={loadUEBA}
                  >
                    Generate UEBA Intelligence
                  </button>

                </div>

               </div>

              </div>

            </div>

          {loading ? (

            <div className="text-center my-5">

              <div className="spinner-border text-primary" role="status"></div>

              <p className="mt-3">
                Generating UEBA Intelligence...
              </p>

            </div>

          ) : ueba && (

            <div className="row">

              {/* ==========================
                  User Behaviour Analytics
              ========================== */}

              <div className="col-lg-6 mb-4">

                <div className="card shadow-sm h-100">

                  <div className="card-body">

                    <h4 className="mb-4">

                      User Behaviour Analytics

                    </h4>

                    <table className="table table-borderless">

                      <tbody>

                        <tr>
    <th>Behaviour Score</th>

    <td>

        <h3 className="text-primary fw-bold mb-2">
            {ueba.behaviour_score}/100
        </h3>

        <div className="progress">

            <div
                className={
                    ueba.behaviour_score >= 80
                        ? "progress-bar bg-danger"
                        : ueba.behaviour_score >= 60
                        ? "progress-bar bg-warning"
                        : ueba.behaviour_score >= 30
                        ? "progress-bar bg-info"
                        : "progress-bar bg-success"
                }
                style={{
                    width: `${ueba.behaviour_score}%`
                }}
            >
                {ueba.behaviour_score}%
            </div>

        </div>

    </td>

</tr>

                        <tr>
                          <th>Behaviour Trend</th>
                          <td>{ueba.behaviour_trend}</td>
                        </tr>

                        <tr>
    <th>Prediction</th>

    <td>

        <span
            className={
                ueba.prediction === "Anomaly"
                    ? "badge bg-danger fs-6"
                    : "badge bg-success fs-6"
            }
        >
            {ueba.prediction}
        </span>

    </td>

</tr>
                        <tr>
                          <th>Risk Level</th>
                          <td>

                            <span
                              className={
                                ueba.risk_level === "Critical"
                                  ? "badge bg-dark"
                                  : ueba.risk_level === "High"
                                  ? "badge bg-danger"
                                  : ueba.risk_level === "Medium"
                                  ? "badge bg-warning text-dark"
                                  : "badge bg-success"
                              }
                            >
                              {ueba.risk_level}
                            </span>

                          </td>
                        </tr>

                      </tbody>

                    </table>

                  </div>

                </div>

              </div>

          {/* ==========================
    Entity Behaviour Analytics
========================== */}

<div className="col-lg-6 mb-4">

  <div className="card shadow-sm h-100">

    <div className="card-body">

      <h4 className="mb-4">
        Entity Behaviour Analytics
      </h4>

      <table className="table table-borderless">

        <tbody>

          <tr>
            <th>Employee</th>
            <td>{ueba.full_name}</td>
          </tr>

          <tr>
            <th>Department</th>
            <td>{ueba.department}</td>
          </tr>

          <tr>
            <th>Role</th>
            <td>{ueba.role}</td>
          </tr>

          <tr>
            <th>Department Risk</th>

            <td>

              <span
                className={
                  ueba.department_risk === "High"
                    ? "badge bg-danger fs-6"
                    : ueba.department_risk === "Medium"
                    ? "badge bg-warning text-dark fs-6"
                    : "badge bg-success fs-6"
                }
              >
                {ueba.department_risk}
              </span>

            </td>
          </tr>

          <tr>
            <th>Peer Group Status</th>
            <td>{ueba.peer_group_status}</td>
          </tr>

        </tbody>

      </table>

    </div>

  </div>

</div>
                            {/* ==========================
                  Threat Intelligence
              ========================== */}

              <div className="col-12">

                <div className="card shadow-sm">

                  <div className="card-body">

                    <h4 className="mb-4">

                      Threat Intelligence

                    </h4>

                    <div className="row">

                      <div className="col-md-6 mb-3">

                        <strong>Threat Severity</strong>

                        <p className="mt-2">

                          <span
                            className={
                              ueba.threat_severity === "Critical"
                                ? "badge bg-dark"
                                : ueba.threat_severity === "High"
                                ? "badge bg-danger"
                                : ueba.threat_severity === "Medium"
                                ? "badge bg-warning text-dark"
                                : "badge bg-success"
                            }
                          >
                            {ueba.threat_severity}
                          </span>

                        </p>

                      </div>

                      <div className="col-md-6 mb-3">

    <strong>Detection Method</strong>

    <p className="mt-2">

        <span className="badge bg-info text-dark fs-6">

            {ueba.detection_method}

        </span>

    </p>

</div>
                    </div>

                    <hr />

                    <h5 className="mb-3">

    UEBA Summary

</h5>

<div className="alert alert-light border">

    <p>

        <strong>Overall Assessment:</strong>

        {ueba.behaviour_status}

    </p>

    <p>

        <strong>Risk Level:</strong>

        {ueba.risk_level}

    </p>

    <p>

        <strong>Recommendation:</strong>

        Continue monitoring and review behavioural activities based on UEBA analysis.

    </p>

</div>
                  </div>

                </div>

              </div>

            </div>

          )}

          {!loading && !ueba && (

            <div className="card shadow-sm">

              <div className="card-body text-center">

                <h5>

                  No UEBA Intelligence Generated

                </h5>

                <p className="text-muted">

                  Select an employee and click
                  <strong> Generate UEBA Intelligence </strong>
                  to view behavioural analytics.

                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Analytics;