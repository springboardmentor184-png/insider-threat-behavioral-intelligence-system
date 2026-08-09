import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { getInvestigations } from "../services/investigationService";

import "../styles/dashboard.css";

function ThreatInvestigation() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInvestigations();
  }, []);

  const loadInvestigations = async () => {
    try {
      const data = await getInvestigations();
      setInvestigations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Critical":
        return "badge bg-dark fs-6";
      case "High":
        return "badge bg-danger fs-6";
      case "Medium":
        return "badge bg-warning text-dark fs-6";
      default:
        return "badge bg-success fs-6";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Closed":
        return "badge bg-success fs-6";

      case "Resolved":
        return "badge bg-primary fs-6";

      case "Investigating":
        return "badge bg-warning text-dark fs-6";

      default:
        return "badge bg-secondary fs-6";
    }
  };

  return (
  <div className="dashboard-container">

    <Sidebar />

    <div className="main-content">

      <Navbar />

      <div className="dashboard-body">

        {/* Page Header */}

        <div className="mb-4">

          <h2 className="fw-bold">
            Threat Investigation Dashboard
          </h2>

          <p className="text-muted">
            Review, investigate, and manage insider threat incidents generated
            by the AI detection engine.
          </p>

        </div>

        {loading ? (

          <div className="text-center mt-5">

            <div
              className="spinner-border text-primary"
              role="status"
            ></div>

            <p className="mt-3">
              Loading investigations...
            </p>

          </div>

        ) : investigations.length === 0 ? (

          <div className="card shadow-sm border-0">

            <div className="card-body text-center py-5">

              <i className="bi bi-shield-check display-3 text-success"></i>

              <h4 className="mt-3">
                No Active Investigations
              </h4>

              <p className="text-muted mb-0">
                No insider threat incidents have been detected.
              </p>

            </div>

          </div>

        ) : (

          <div className="card shadow">

            {/* Card Header */}

            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">

              <h5 className="mb-0">

                Active Investigation Queue

              </h5>

              <span className="badge bg-light text-dark">

                {investigations.length} Incident(s)

              </span>

            </div>

            <div className="card-body">

              <div className="table-responsive">

                <table className="table table-hover align-middle">

                  <thead className="table-dark">

                    <tr>

                      <th>Incident</th>

                      <th>Employee</th>

                      <th>Department</th>

                      <th>Role</th>

                      <th className="text-center">Severity</th>

                      <th className="text-center">Status</th>

                      <th>Assigned Analyst</th>

                      <th>Created</th>

                      <th className="text-center">Action</th>

                    </tr>

                  </thead>

                  <tbody>

                    {investigations.map((item) => (

                      <tr key={item.id}>

                        <td>

                          <strong>#{item.id}</strong>

                        </td>

                        <td>

                          <strong>{item.employee_code}</strong>

                          <br />

                          <small className="text-muted">

                            {item.full_name}

                          </small>

                        </td>

                        <td>

                          {item.department}

                        </td>

                        <td>

                          {item.role}

                        </td>

                        <td className="text-center">

                          <span
                            className={getSeverityBadge(item.threat_severity)}
                          >
                            {item.threat_severity}
                          </span>

                        </td>

                        <td className="text-center">

                          <span
                            className={getStatusBadge(item.status)}
                          >
                            {item.status}
                          </span>

                        </td>

                        <td>

                          {item.assigned_analyst}

                        </td>

                        <td>

                          {new Date(item.created_at).toLocaleDateString()}

                        </td>

                        <td className="text-center">

                                                  <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                                navigate(`/investigation/${item.id}`)
                            }
                        >

                            <i className="bi bi-search me-1"></i>

                            Open Investigation

                        </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  </div>
);
}

export default ThreatInvestigation;