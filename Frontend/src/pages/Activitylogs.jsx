import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { getActivityLogs } from "../services/activityService";

import "../styles/dashboard.css";

function Activitylogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [usbFilter, setUsbFilter] = useState("");
  const [afterHoursFilter, setAfterHoursFilter] = useState("");

  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const data = await getActivityLogs();
      setLogs(data);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === "" ||
      log.department === departmentFilter;

    const matchesUsb =
      usbFilter === "" ||
      String(log.usb_used) === usbFilter;

    const matchesAfterHours =
      afterHoursFilter === "" ||
      String(log.after_hours_login) === afterHoursFilter;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesUsb &&
      matchesAfterHours
    );
  });

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">

          {/* Header */}
          <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Activity Logs</h2>
              <p>
                Monitor employee behavioral activities and security events.
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="card p-3 mb-4 shadow-sm">
            <div className="row g-3">

              {/* Search */}
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search Employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Department */}
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(e.target.value)
                  }
                >
                  <option value="">All Departments</option>

                  {[...new Set(logs.map((log) => log.department))].map(
                    (department) => (
                      <option
                        key={department}
                        value={department}
                      >
                        {department}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* USB */}
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={usbFilter}
                  onChange={(e) =>
                    setUsbFilter(e.target.value)
                  }
                >
                  <option value="">USB Usage</option>
                  <option value="true">Used</option>
                  <option value="false">Not Used</option>
                </select>
              </div>

              {/* After Hours */}
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={afterHoursFilter}
                  onChange={(e) =>
                    setAfterHoursFilter(e.target.value)
                  }
                >
                  <option value="">After Hours</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Reset */}
              <div className="col-md-1">
                <button
                  className="btn btn-secondary w-100"
                  onClick={() => {
                    setSearchTerm("");
                    setDepartmentFilter("");
                    setUsbFilter("");
                    setAfterHoursFilter("");
                  }}
                >
                  Reset
                </button>
              </div>

            </div>
          </div>

          {/* Total Records */}
          {!loading && (
            <div className="mb-3">
              <strong>
                Showing {filteredLogs.length} of {logs.length} Activity Logs
              </strong>
            </div>
          )}

          {/* Table */}
          <div className="card shadow-sm">
            <div className="card-body">

              {loading ? (
                <p>Loading activity logs...</p>
              ) : (
                <div className="table-responsive">

                  <table className="table table-hover table-bordered align-middle">

                    <thead className="table-dark">

                      <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Failed Logins</th>
                        <th>USB Used</th>
                        <th>After Hours</th>
                        <th>Files Downloaded</th>
                        <th>Emails Sent</th>
                        <th>Login Hour</th>
                      </tr>

                    </thead>

                    <tbody>

                      {filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (

                          <tr key={log.employee_id}>

                            <td>{log.employee_id}</td>

                            <td>{log.full_name}</td>

                            <td>{log.department}</td>

                            <td>{log.role}</td>

                            <td>{log.failed_logins}</td>

                            <td>
                              <span
                                className={
                                  log.usb_used
                                    ? "badge bg-danger"
                                    : "badge bg-success"
                                }
                              >
                                {log.usb_used ? "Used" : "No"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={
                                  log.after_hours_login
                                    ? "badge bg-warning text-dark"
                                    : "badge bg-success"
                                }
                              >
                                {log.after_hours_login ? "Yes" : "No"}
                              </span>
                            </td>

                            <td>{log.files_downloaded}</td>

                            <td>{log.emails_sent}</td>

                            <td>{log.login_hour}:00</td>

                          </tr>

                        ))
                      ) : (

                        <tr>

                          <td
                            colSpan="10"
                            className="text-center"
                          >
                            No Activity Logs Found
                          </td>

                        </tr>

                      )}

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

export default Activitylogs;