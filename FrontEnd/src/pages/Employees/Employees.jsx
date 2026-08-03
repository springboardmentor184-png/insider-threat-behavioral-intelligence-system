import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Download,
  X,
  Users,
  Activity,
  ShieldAlert,
  FileText,
  LoaderCircle
} from "lucide-react";
import api from "../../services/api";
import "./Employees.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/employees/");

      setEmployees(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      setEmployees([]);
      setError(
        err.response?.data?.detail ||
          "Unable to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const value = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !value ||
        String(employee.name || "")
          .toLowerCase()
          .includes(value) ||
        String(employee.user || "")
          .toLowerCase()
          .includes(value) ||
        String(employee.employee_id || "")
          .toLowerCase()
          .includes(value) ||
        String(employee.email || "")
          .toLowerCase()
          .includes(value) ||
        String(employee.department || "")
          .toLowerCase()
          .includes(value);

      const matchesRisk =
        riskFilter === "All" ||
        String(employee.risk_level || "")
          .toLowerCase() ===
          riskFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesRisk
      );
    });
  }, [
    employees,
    search,
    riskFilter
  ]);

const openEmployee = async (employee) => {
  try {
    console.log("Selected employee:", employee);

    setSelectedEmployee(employee);
    setEmployeeData(null);
    setDetailsLoading(true);
    setError("");

    const response = await api.get(
      `/employees/${employee.id}/intelligence`
    );

    console.log("Employee Intelligence:", response.data);

    setEmployeeData(response.data);

  } catch (err) {

    console.log(
      "VIEW ERROR:",
      err.response?.data || err.message
    );

    setEmployeeData(null);

    setError(
      err.response?.data?.detail ||
      "Unable to load employee details"
    );

  } finally {

    setDetailsLoading(false);

  }
};
  const closeEmployee = () => {
    setSelectedEmployee(null);
    setEmployeeData(null);
    setDetailsLoading(false);
  };

  const downloadPdf = async (employeeId) => {
    try {
      setDownloading(true);
      setError("");

      const response = await api.get(
        `/employees/${employeeId}/download/pdf`,
        {
          responseType: "blob"
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf"
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `employee_${employeeId}_intelligence_report.pdf`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to download PDF report"
      );
    } finally {
      setDownloading(false);
    }
  };

  const getRiskClass = (level) => {
    const value =
      String(level || "Low")
        .toLowerCase();

    if (
      value === "critical"
    ) {
      return "critical";
    }

    if (
      value === "high"
    ) {
      return "high";
    }

    if (
      value === "medium"
    ) {
      return "medium";
    }

    return "low";
  };

  const totalEmployees =
    employees.length;

  const highRiskEmployees =
    employees.filter(
      (employee) =>
        ["High", "Critical"]
          .includes(
            employee.risk_level
          )
    ).length;

  const totalActivities =
    employees.reduce(
      (
        total,
        employee
      ) =>
        total +
        Number(
          employee.login_count ||
            0
        ),
      0
    );

  const totalAnomalies =
    employees.reduce(
      (
        total,
        employee
      ) =>
        total +
        Number(
          employee.anomaly ||
            0
        ),
      0
    );

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <h1>
            Employees
          </h1>

          <p>
            Monitor employee profiles,
            activities, anomalies,
            and insider risk levels
          </p>
        </div>

        <button
          className="employees-refresh"
          onClick={
            loadEmployees
          }
          disabled={
            loading
          }
        >
          Refresh Data
        </button>
      </div>

      <div className="employee-stat-grid">
        <div className="employee-stat-card">
          <div className="employee-stat-icon">
            <Users size={22} />
          </div>

          <div>
            <span>
              Total Employees
            </span>

            <strong>
              {totalEmployees}
            </strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon">
            <Activity size={22} />
          </div>

          <div>
            <span>
              Login Activities
            </span>

            <strong>
              {totalActivities}
            </strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon">
            <ShieldAlert
              size={22}
            />
          </div>

          <div>
            <span>
              High Risk Employees
            </span>

            <strong>
              {highRiskEmployees}
            </strong>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon">
            <FileText
              size={22}
            />
          </div>

          <div>
            <span>
              Anomaly Indicators
            </span>

            <strong>
              {totalAnomalies}
            </strong>
          </div>
        </div>
      </div>

      <div className="employees-toolbar">
        <div className="employee-search">
          <Search
            size={19}
          />

          <input
            type="text"
            value={search}
            onChange={
              (event) =>
                setSearch(
                  event.target
                    .value
                )
            }
            placeholder="Search by employee, ID, email or department"
          />
        </div>

        <select
          value={
            riskFilter
          }
          onChange={
            (event) =>
              setRiskFilter(
                event.target
                  .value
              )
          }
        >
          <option>
            All
          </option>

          <option>
            Low
          </option>

          <option>
            Medium
          </option>

          <option>
            High
          </option>

          <option>
            Critical
          </option>
        </select>
      </div>

      {error && (
        <div className="employees-error">
          {error}
        </div>
      )}

      <div className="employees-table-card">
        <div className="employees-table-header">
          <div>
            <h2>
              Employee Directory
            </h2>

            <span>
              {
                filteredEmployees.length
              }{" "}
              employees found
            </span>
          </div>
        </div>

        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>
                  Employee
                </th>

                <th>
                  Department
                </th>

                <th>
                  Login Count
                </th>

                <th>
                  Anomaly Score
                </th>

                <th>
                  Risk Score
                </th>

                <th>
                  Risk Level
                </th>

                <th>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan="7"
                    className="employees-empty"
                  >
                    <LoaderCircle
                      size={24}
                      className="employees-spinner"
                    />

                    Loading employees...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredEmployees.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="employees-empty"
                    >
                      No employee data found
                    </td>
                  </tr>
                )}

              {!loading &&
                filteredEmployees.map(
                  (
                    employee
                  ) => (
                    <tr
                      key={
                        employee.id
                      }
                    >
                      <td>
                        <div className="employee-name-cell">
                          <div className="employee-avatar">
                            {String(
                              employee.name ||
                                employee.user ||
                                "E"
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                employee.name
                              }
                            </strong>

                            <span>
                              {
                                employee.employee_id ||
                                employee.user
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {
                          employee.department ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          employee.login_count ||
                          0
                        }
                      </td>

                      <td>
                        {
                          Number(
                            employee.anomaly_score ||
                              0
                          ).toFixed(
                            4
                          )
                        }
                      </td>

                      <td>
                        <strong>
                          {
                            Number(
                              employee.risk_score ||
                                0
                            ).toFixed(
                              2
                            )
                          }
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`risk-badge ${getRiskClass(
                            employee.risk_level
                          )}`}
                        >
                          {
                            employee.risk_level ||
                            "Low"
                          }
                        </span>
                      </td>

                      <td>
                        <div className="employee-actions">
                          <button
                            className="employee-view-button"
                            onClick={
                              () =>
                                openEmployee(
                                  employee
                                )
                            }
                          >
                            <Eye
                              size={
                                17
                              }
                            />

                            View
                          </button>

                          <button
                            className="employee-download-button"
                            onClick={
                              () =>
                                downloadPdf(
                                  employee.id
                                )
                            }
                            disabled={
                              downloading
                            }
                          >
                            <Download
                              size={
                                17
                              }
                            />

                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <div className="employee-modal-overlay">
          <div className="employee-modal">
            <div className="employee-modal-header">
              <div>
                <h2>
                  Employee Intelligence
                </h2>

                <p>
                  Complete profile,
                  activities, anomalies,
                  alerts and risk details
                </p>
              </div>

              <button
                className="employee-close-button"
                onClick={
                  closeEmployee
                }
              >
                <X
                  size={22}
                />
              </button>
            </div>

            {detailsLoading && (
              <div className="employee-details-loading">
                <LoaderCircle
                  size={28}
                  className="employees-spinner"
                />

                Loading employee intelligence...
              </div>
            )}

            {!detailsLoading &&
              employeeData && (
                <div className="employee-modal-content">
                  <div className="employee-profile-top">
                    <div className="employee-profile-main">
                      <div className="employee-profile-avatar">
                        {String(
                          employeeData
                            .employee
                            .name ||
                            "E"
                        )
                          .charAt(
                            0
                          )
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3>
                          {
                            employeeData
                              .employee
                              .name
                          }
                        </h3>

                        <p>
                          {
                            employeeData
                              .employee
                              .employee_id
                          }
                        </p>

                        <span>
                          {
                            employeeData
                              .employee
                              .department
                          }
                        </span>
                      </div>
                    </div>

                    <div className="employee-risk-summary">
                      <span>
                        Risk Score
                      </span>

                      <strong>
                        {
                          Number(
                            employeeData
                              .risk
                              .score ||
                              0
                          ).toFixed(
                            2
                          )
                        }
                      </strong>

                      <span
                        className={`risk-badge ${getRiskClass(
                          employeeData
                            .risk
                            .level
                        )}`}
                      >
                        {
                          employeeData
                            .risk
                            .level
                        }
                      </span>
                    </div>
                  </div>

                  <div className="employee-detail-grid">
                    <div>
                      <span>
                        Email
                      </span>

                      <strong>
                        {
                          employeeData
                            .employee
                            .email
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Designation
                      </span>

                      <strong>
                        {
                          employeeData
                            .employee
                            .designation
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Manager
                      </span>

                      <strong>
                        {
                          employeeData
                            .employee
                            .manager
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Status
                      </span>

                      <strong>
                        {
                          employeeData
                            .employee
                            .is_active
                            ? "Active"
                            : "Inactive"
                        }
                      </strong>
                    </div>
                  </div>

                  <div className="employee-intelligence-stats">
                    <div>
                      <span>
                        Total Activities
                      </span>

                      <strong>
                        {
                          employeeData
                            .statistics
                            .total_activities
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Login Activities
                      </span>

                      <strong>
                        {
                          employeeData
                            .statistics
                            .login_activities
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        File Activities
                      </span>

                      <strong>
                        {
                          employeeData
                            .statistics
                            .file_activities
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Total Anomalies
                      </span>

                      <strong>
                        {
                          employeeData
                            .statistics
                            .total_anomalies
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Alerts
                      </span>

                      <strong>
                        {
                          employeeData
                            .statistics
                            .alerts
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Investigations
                      </span>

                      <strong>
                        {
                          employeeData
                            .statistics
                            .investigations
                        }
                      </strong>
                    </div>
                  </div>

                  <div className="employee-section">
                    <div className="employee-section-heading">
                      <h3>
                        Complete Activity
                        History
                      </h3>

                      <span>
                        {
                          employeeData
                            .activities
                            .length
                        }{" "}
                        records
                      </span>
                    </div>

                    <div className="employee-activity-list">
                      {employeeData
                        .activities
                        .length ===
                        0 && (
                        <div className="employee-no-data">
                          No activity data
                          available
                        </div>
                      )}

                      {employeeData
                        .activities
                        .map(
                          (
                            activity
                          ) => (
                            <div
                              className="employee-activity-item"
                              key={
                                activity.id
                              }
                            >
                              <div>
                                <strong>
                                  {
                                    activity.activity
                                  }
                                </strong>

                                <span>
                                  {
                                    activity.type
                                  }{" "}
                                  •{" "}
                                  {
                                    activity.timestamp
                                  }
                                </span>
                              </div>

                              <div className="employee-activity-meta">
                                <span>
                                  {
                                    activity.device
                                  }
                                </span>

                                <span>
                                  {
                                    activity.resource
                                  }
                                </span>

                                {activity.is_anomaly && (
                                  <span className="activity-anomaly">
                                    Anomaly
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>

                  <div className="employee-section">
                    <div className="employee-section-heading">
                      <h3>
                        Alerts
                      </h3>

                      <span>
                        {
                          employeeData
                            .alerts
                            .length
                        }
                      </span>
                    </div>

                    <div className="employee-alert-list">
                      {employeeData
                        .alerts
                        .length ===
                        0 && (
                        <div className="employee-no-data">
                          No alerts
                          available
                        </div>
                      )}

                      {employeeData
                        .alerts
                        .map(
                          (
                            alert
                          ) => (
                            <div
                              className="employee-alert-item"
                              key={
                                alert.id
                              }
                            >
                              <div>
                                <strong>
                                  {
                                    alert.title
                                  }
                                </strong>

                                <p>
                                  {
                                    alert.description
                                  }
                                </p>
                              </div>

                              <div>
                                <span
                                  className={`risk-badge ${getRiskClass(
                                    alert.severity
                                  )}`}
                                >
                                  {
                                    alert.severity
                                  }
                                </span>

                                <small>
                                  {
                                    alert.status
                                  }
                                </small>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>

                  <div className="employee-section">
                    <div className="employee-section-heading">
                      <h3>
                        Investigations
                      </h3>

                      <span>
                        {
                          employeeData
                            .investigations
                            .length
                        }
                      </span>
                    </div>

                    <div className="employee-investigation-list">
                      {employeeData
                        .investigations
                        .length ===
                        0 && (
                        <div className="employee-no-data">
                          No investigations
                          available
                        </div>
                      )}

                      {employeeData
                        .investigations
                        .map(
                          (
                            investigation
                          ) => (
                            <div
                              className="employee-investigation-item"
                              key={
                                investigation.id
                              }
                            >
                              <div>
                                <strong>
                                  {
                                    investigation.title
                                  }
                                </strong>

                                <p>
                                  {
                                    investigation.description
                                  }
                                </p>
                              </div>

                              <div>
                                <span>
                                  {
                                    investigation.priority
                                  }
                                </span>

                                <small>
                                  {
                                    investigation.status
                                  }
                                </small>
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
              )}

            <div className="employee-modal-footer">
              <button
                className="employee-download-report"
                onClick={
                  () =>
                    downloadPdf(
                      selectedEmployee.id
                    )
                }
                disabled={
                  downloading
                }
              >
                <Download
                  size={18}
                />

                {downloading
                  ? "Generating PDF..."
                  : "Download Complete PDF Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;