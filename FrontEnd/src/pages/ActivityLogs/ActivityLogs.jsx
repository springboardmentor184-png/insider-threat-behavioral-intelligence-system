import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Activity,
  Monitor,
  FileText,
  X,
  Eye,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import "./ActivityLogs.css";

const API_URL = "http://127.0.0.1:8000";

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, search, typeFilter, statusFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const [loginResponse, fileResponse] =
        await Promise.all([
          axios.get(`${API_URL}/login-activity/`),
          axios.get(`${API_URL}/file-access/`)
        ]);

      const loginData = Array.isArray(loginResponse.data)
        ? loginResponse.data
        : loginResponse.data?.data || [];

      const fileData = Array.isArray(fileResponse.data)
        ? fileResponse.data
        : fileResponse.data?.data || [];

      const loginLogs = loginData.map((item) => ({
        ...item,
        log_type: "Login",
        event_time:
          item.login_time ||
          item.date ||
          item.created_at,
        username:
          item.username ||
          item.user ||
          item.employee_name ||
          "-",
        device:
          item.pc ||
          item.device_name ||
          item.device ||
          "-",
        event:
          item.activity ||
          (item.success === false
            ? "Failed Login"
            : "Successful Login")
      }));

      const fileLogs = fileData.map((item) => ({
        ...item,
        log_type: "File Access",
        event_time:
          item.access_time ||
          item.date ||
          item.created_at,
        username:
          item.username ||
          item.user ||
          item.employee_name ||
          "-",
        device:
          item.pc ||
          item.device_name ||
          item.device ||
          "-",
        event:
          item.filename ||
          item.file_name ||
          "File Access"
      }));

      const combinedLogs = [
        ...loginLogs,
        ...fileLogs
      ].sort(
        (a, b) =>
          new Date(b.event_time || 0) -
          new Date(a.event_time || 0)
      );

      setLogs(combinedLogs);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load activity logs"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let result = [...logs];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((log) =>
        String(log.username || "")
          .toLowerCase()
          .includes(query) ||
        String(log.device || "")
          .toLowerCase()
          .includes(query) ||
        String(log.event || "")
          .toLowerCase()
          .includes(query)
      );
    }

    if (typeFilter !== "All") {
      result = result.filter(
        (log) => log.log_type === typeFilter
      );
    }

    if (statusFilter === "Anomaly") {
      result = result.filter(
        (log) => log.is_anomaly === true
      );
    }

    if (statusFilter === "Normal") {
      result = result.filter(
        (log) => log.is_anomaly !== true
      );
    }

    setFilteredLogs(result);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleString();
  };

  const totalActivities = logs.length;

  const loginActivities = logs.filter(
    (log) => log.log_type === "Login"
  ).length;

  const fileAccessEvents = logs.filter(
    (log) => log.log_type === "File Access"
  ).length;

  const anomalies = logs.filter(
    (log) => log.is_anomaly === true
  ).length;

  if (loading) {
    return (
      <div className="activity-logs-page">
        <div className="activity-loading">
          Loading activity logs...
        </div>
      </div>
    );
  }

  return (
    <div className="activity-logs-page">

      {/* HEADER */}

      <div className="activity-header">
        <div>
          <h1>Activity Logs</h1>

          <p>
            Monitor employee login and file access activities
          </p>
        </div>

        <button
          className="activity-refresh-button"
          onClick={loadLogs}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="activity-error">
          <span>{error}</span>

          <button onClick={loadLogs}>
            Try Again
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <div className="activity-summary">

        <div className="activity-summary-card">
          <div className="activity-summary-icon">
            <Activity size={22} />
          </div>

          <div>
            <span>Total Activities</span>
            <strong>
              {totalActivities}
            </strong>
          </div>
        </div>

        <div className="activity-summary-card">
          <div className="activity-summary-icon login">
            <Monitor size={22} />
          </div>

          <div>
            <span>Login Activities</span>
            <strong>
              {loginActivities}
            </strong>
          </div>
        </div>

        <div className="activity-summary-card">
          <div className="activity-summary-icon file">
            <FileText size={22} />
          </div>

          <div>
            <span>File Access Events</span>
            <strong>
              {fileAccessEvents}
            </strong>
          </div>
        </div>

        <div className="activity-summary-card">
          <div className="activity-summary-icon anomaly">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Anomalies</span>
            <strong>
              {anomalies}
            </strong>
          </div>
        </div>

      </div>

      {/* CONTENT */}

      <div className="activity-content">

        {/* FILTERS */}

        <div className="activity-toolbar">

          <div className="activity-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search user, device, file..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
          >
            <option value="All">
              All Activity Types
            </option>

            <option value="Login">
              Login
            </option>

            <option value="File Access">
              File Access
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

            <option value="Anomaly">
              Anomalies
            </option>

            <option value="Normal">
              Normal
            </option>
          </select>

        </div>

        {/* TABLE */}

        {filteredLogs.length === 0 ? (

          <div className="activity-empty">
            <Activity size={44} />

            <h3>
              No activity logs found
            </h3>

            <p>
              No activities match the current filters.
            </p>
          </div>

        ) : (

          <div className="activity-table-wrapper">

            <table className="activity-table">

              <thead>
                <tr>
                  <th>Type</th>
                  <th>User</th>
                  <th>Device</th>
                  <th>Activity / File</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredLogs.map((log, index) => (

                  <tr
                    key={`${log.log_type}-${log.id}-${index}`}
                  >

                    <td>
                      <span
                        className={`activity-type ${
                          log.log_type === "Login"
                            ? "login"
                            : "file"
                        }`}
                      >
                        {log.log_type}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {log.username}
                      </strong>
                    </td>

                    <td>
                      {log.device}
                    </td>

                    <td>
                      <span className="activity-event">
                        {log.event}
                      </span>
                    </td>

                    <td>
                      {formatDate(log.event_time)}
                    </td>

                    <td>
                      <span
                        className={`activity-status ${
                          log.is_anomaly
                            ? "anomaly"
                            : "normal"
                        }`}
                      >
                        {log.is_anomaly ? (
                          <>
                            <AlertTriangle size={13} />
                            Anomaly
                          </>
                        ) : (
                          <>
                            <CheckCircle size={13} />
                            Normal
                          </>
                        )}
                      </span>
                    </td>

                    <td>
                      {Number(
                        log.anomaly_score || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      <button
                        className="activity-view-button"
                        onClick={() =>
                          setSelectedLog(log)
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

      {/* DETAILS MODAL */}

      {selectedLog && (

        <div
          className="activity-modal-overlay"
          onClick={() =>
            setSelectedLog(null)
          }
        >

          <div
            className="activity-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="activity-modal-header">

              <div>
                <h2>
                  Activity Details
                </h2>

                <p>
                  {selectedLog.log_type}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedLog(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="activity-modal-body">

              <div className="activity-details-grid">

                <div>
                  <span>User</span>

                  <strong>
                    {selectedLog.username}
                  </strong>
                </div>

                <div>
                  <span>Device</span>

                  <strong>
                    {selectedLog.device}
                  </strong>
                </div>

                <div>
                  <span>Activity Type</span>

                  <strong>
                    {selectedLog.log_type}
                  </strong>
                </div>

                <div>
                  <span>Activity / File</span>

                  <strong>
                    {selectedLog.event}
                  </strong>
                </div>

                <div>
                  <span>Date & Time</span>

                  <strong>
                    {formatDate(
                      selectedLog.event_time
                    )}
                  </strong>
                </div>

                <div>
                  <span>Anomaly Score</span>

                  <strong>
                    {Number(
                      selectedLog.anomaly_score || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    {selectedLog.is_anomaly
                      ? "Anomaly"
                      : "Normal"}
                  </strong>
                </div>

                <div>
                  <span>IP Address</span>

                  <strong>
                    {selectedLog.ip_address || "-"}
                  </strong>
                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ActivityLogs;