import { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  Eye,
  X,
  CheckCircle
} from "lucide-react";
import "./Alerts.css";

const API_URL = "http://127.0.0.1:8000";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, search, severityFilter, statusFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/alerts/`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.alerts || [];

      setAlerts(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load alerts"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let result = [...alerts];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((alert) =>
        String(alert.title || "")
          .toLowerCase()
          .includes(query) ||
        String(alert.description || "")
          .toLowerCase()
          .includes(query) ||
        String(alert.alert_type || "")
          .toLowerCase()
          .includes(query)
      );
    }

    if (severityFilter !== "All") {
      result = result.filter(
        (alert) =>
          String(alert.severity || "")
            .toLowerCase() ===
          severityFilter.toLowerCase()
      );
    }

    if (statusFilter !== "All") {
      result = result.filter(
        (alert) =>
          String(alert.status || "")
            .toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    setFilteredAlerts(result);
  };

  const resolveAlert = async (alert) => {
    try {
      await axios.put(
        `${API_URL}/alerts/${alert.id}/resolve`
      );

      loadAlerts();
      setSelectedAlert(null);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to resolve alert"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="alerts-page">
        <div className="alerts-loading">
          Loading alerts...
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div>
          <h1>Security Alerts</h1>
          <p>
            Monitor and manage insider threat alerts
          </p>
        </div>

        <button
          className="alerts-refresh-button"
          onClick={loadAlerts}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alerts-error">
          <span>{error}</span>

          <button onClick={loadAlerts}>
            Try Again
          </button>
        </div>
      )}

      <div className="alerts-summary">
        <div className="alert-summary-card">
          <div className="alert-summary-icon total">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Total Alerts</span>
            <strong>{alerts.length}</strong>
          </div>
        </div>

        <div className="alert-summary-card">
          <div className="alert-summary-icon critical">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Critical</span>
            <strong>
              {
                alerts.filter(
                  (alert) =>
                    alert.severity === "Critical"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="alert-summary-card">
          <div className="alert-summary-icon high">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>High</span>
            <strong>
              {
                alerts.filter(
                  (alert) =>
                    alert.severity === "High"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="alert-summary-card">
          <div className="alert-summary-icon open">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Open Alerts</span>
            <strong>
              {
                alerts.filter(
                  (alert) =>
                    String(alert.status)
                      .toLowerCase() === "open"
                ).length
              }
            </strong>
          </div>
        </div>
      </div>

      <div className="alerts-content">
        <div className="alerts-toolbar">
          <div className="alerts-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value)
            }
          >
            <option value="All">
              All Severity
            </option>

            <option value="Critical">
              Critical
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Open">
              Open
            </option>

            <option value="Resolved">
              Resolved
            </option>
          </select>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="alerts-empty">
            <CheckCircle size={45} />
            <h3>No alerts found</h3>
            <p>
              There are no alerts matching the selected filters.
            </p>
          </div>
        ) : (
          <div className="alerts-table-wrapper">
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Alert</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Risk Score</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <div className="alert-title-cell">
                        <div
                          className={`alert-icon ${String(
                            alert.severity || "Medium"
                          ).toLowerCase()}`}
                        >
                          <AlertTriangle size={17} />
                        </div>

                        <div>
                          <strong>
                            {alert.title || "Security Alert"}
                          </strong>

                          <span>
                            {alert.description ||
                              "No description available"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {alert.alert_type || "-"}
                    </td>

                    <td>
                      <span
                        className={`alert-severity ${String(
                          alert.severity || "Medium"
                        ).toLowerCase()}`}
                      >
                        {alert.severity || "Medium"}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {alert.risk_score || 0}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`alert-status ${String(
                          alert.status || "Open"
                        ).toLowerCase()}`}
                      >
                        {alert.status || "Open"}
                      </span>
                    </td>

                    <td>
                      {formatDate(alert.created_at)}
                    </td>

                    <td>
                      <button
                        className="alert-view-button"
                        onClick={() =>
                          setSelectedAlert(alert)
                        }
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedAlert && (
        <div
          className="alert-modal-overlay"
          onClick={() =>
            setSelectedAlert(null)
          }
        >
          <div
            className="alert-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="alert-modal-header">
              <div>
                <h2>
                  {selectedAlert.title}
                </h2>

                <p>
                  Alert Details
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedAlert(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="alert-modal-body">
              <div className="alert-detail-box">
                <span>Description</span>
                <strong>
                  {selectedAlert.description ||
                    "No description available"}
                </strong>
              </div>

              <div className="alert-details-grid">
                <div>
                  <span>Alert Type</span>
                  <strong>
                    {selectedAlert.alert_type || "-"}
                  </strong>
                </div>

                <div>
                  <span>Severity</span>
                  <strong>
                    {selectedAlert.severity || "-"}
                  </strong>
                </div>

                <div>
                  <span>Risk Score</span>
                  <strong>
                    {selectedAlert.risk_score || 0}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {selectedAlert.status || "-"}
                  </strong>
                </div>

                <div>
                  <span>Created At</span>
                  <strong>
                    {formatDate(
                      selectedAlert.created_at
                    )}
                  </strong>
                </div>

                <div>
                  <span>Resolved At</span>
                  <strong>
                    {formatDate(
                      selectedAlert.resolved_at
                    )}
                  </strong>
                </div>
              </div>

              {String(
                selectedAlert.status || ""
              ).toLowerCase() === "open" && (
                <button
                  className="resolve-alert-button"
                  onClick={() =>
                    resolveAlert(selectedAlert)
                  }
                >
                  <CheckCircle size={17} />
                  Resolve Alert
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Alerts;