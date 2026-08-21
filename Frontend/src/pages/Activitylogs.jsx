import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { getActivityLogs } from "../services/activityService";

import "../styles/dashboard.css";

function Activitylogs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Search & Filters
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [usbFilter, setUsbFilter] = useState("");
  const [afterHoursFilter, setAfterHoursFilter] = useState("");

  // =====================================================
  // Load Activity Logs
  // =====================================================

  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);

      const data = await getActivityLogs();

      setLogs(data || []);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Read Employee From URL
  // Same behavior as Employees.jsx
  // =====================================================

  useEffect(() => {
    const employeeId = searchParams.get("employee");

    if (!employeeId || logs.length === 0) {
      return;
    }

    const employee = logs.find(
      (log) =>
        String(log.employee_id) === String(employeeId) ||
        String(log.id) === String(employeeId)
    );

    if (employee) {
      setSearchTerm(employee.employee_id);
    }
  }, [searchParams, logs]);

  // =====================================================
  // Filter Activity Logs
  // =====================================================

  const filteredLogs = logs.filter((log) => {
    const searchValue = searchTerm
      .trim()
      .toLowerCase();

    // Employee Search
    const matchesSearch =
      searchValue === "" ||
      String(log.employee_id || "")
        .toLowerCase()
        .includes(searchValue) ||
      String(log.full_name || "")
        .toLowerCase()
        .includes(searchValue);

    // Department Filter
    const matchesDepartment =
      departmentFilter === "" ||
      String(log.department || "") === departmentFilter;

    // USB Filter
    const matchesUsb =
      usbFilter === "" ||
      String(log.usb_used).toLowerCase() ===
        usbFilter.toLowerCase();

    // After Hours Filter
    const matchesAfterHours =
      afterHoursFilter === "" ||
      String(log.after_hours_login).toLowerCase() ===
        afterHoursFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesUsb &&
      matchesAfterHours
    );
  });

  // =====================================================
  // Reset Filters
  // Same behavior as Employees.jsx
  // =====================================================

  const handleReset = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setUsbFilter("");
    setAfterHoursFilter("");

    // Remove employee query parameter
    setSearchParams({});
  };

  // =====================================================
  // Department List
  // =====================================================

  const departments = [
    ...new Set(
      logs
        .map((log) => log.department)
        .filter(Boolean)
    ),
  ];

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="dashboard-body">

          {/* =====================================================
              Header
          ===================================================== */}

          <div className="dashboard-header mb-4">

            <div>
              <h2>Activity Logs</h2>

              <p>
                Monitor employee behavioral activities and
                security events.
              </p>
            </div>

          </div>


          {/* =====================================================
              Search & Filters
          ===================================================== */}

          <div className="card p-3 mb-4 shadow-sm">

            <div className="row g-3">

              {/* =================================================
                  Employee Search
              ================================================= */}

              <div className="col-md-4">

                <label className="form-label fw-semibold">
                  Search Employee
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Employee ID or Name..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

              </div>


              {/* =================================================
                  Department
              ================================================= */}

              <div className="col-md-3">

                <label className="form-label fw-semibold">
                  Department
                </label>

                <select
                  className="form-select"
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(e.target.value)
                  }
                >

                  <option value="">
                    All Departments
                  </option>

                  {departments.map((department) => (

                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>

                  ))}

                </select>

              </div>


              {/* =================================================
                  USB Usage
              ================================================= */}

              <div className="col-md-2">

                <label className="form-label fw-semibold">
                  USB Usage
                </label>

                <select
                  className="form-select"
                  value={usbFilter}
                  onChange={(e) =>
                    setUsbFilter(e.target.value)
                  }
                >

                  <option value="">
                    All
                  </option>

                  <option value="true">
                    Used
                  </option>

                  <option value="false">
                    Not Used
                  </option>

                </select>

              </div>


              {/* =================================================
                  After Hours
              ================================================= */}

              <div className="col-md-2">

                <label className="form-label fw-semibold">
                  After Hours
                </label>

                <select
                  className="form-select"
                  value={afterHoursFilter}
                  onChange={(e) =>
                    setAfterHoursFilter(e.target.value)
                  }
                >

                  <option value="">
                    All
                  </option>

                  <option value="true">
                    Yes
                  </option>

                  <option value="false">
                    No
                  </option>

                </select>

              </div>


              {/* =================================================
                  Reset
              ================================================= */}

              <div className="col-md-1 d-flex align-items-end">

                <button
                  type="button"
                  className="btn btn-secondary w-100"
                  onClick={handleReset}
                >
                  Reset
                </button>

              </div>

            </div>

          </div>


          {/* =====================================================
              Result Count
          ===================================================== */}

          {!loading && (

            <div className="mb-3">

              <strong>
                Showing {filteredLogs.length} of{" "}
                {logs.length} Activity Logs
              </strong>

            </div>

          )}


          {/* =====================================================
              Activity Logs Table
          ===================================================== */}

          <div className="card shadow-sm">

            <div className="card-body">

              {loading ? (

                <div className="text-center py-4">

                  <p className="mb-0">
                    Loading activity logs...
                  </p>

                </div>

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

                        filteredLogs.map((log, index) => (

                          <tr
                            key={`${log.employee_id}-${index}`}
                          >

                            {/* Employee ID */}

                            <td>
                              <strong>
                                {log.employee_id}
                              </strong>
                            </td>


                            {/* Name */}

                            <td>
                              {log.full_name}
                            </td>


                            {/* Department */}

                            <td>
                              {log.department}
                            </td>


                            {/* Role */}

                            <td>
                              {log.role}
                            </td>


                            {/* Failed Logins */}

                            <td>
                              {log.failed_logins}
                            </td>


                            {/* USB */}

                            <td>

                              <span
                                className={
                                  log.usb_used
                                    ? "badge bg-danger"
                                    : "badge bg-success"
                                }
                              >
                                {log.usb_used
                                  ? "Used"
                                  : "No"}
                              </span>

                            </td>


                            {/* After Hours */}

                            <td>

                              <span
                                className={
                                  log.after_hours_login
                                    ? "badge bg-warning text-dark"
                                    : "badge bg-success"
                                }
                              >
                                {log.after_hours_login
                                  ? "Yes"
                                  : "No"}
                              </span>

                            </td>


                            {/* Files */}

                            <td>
                              {log.files_downloaded}
                            </td>


                            {/* Emails */}

                            <td>
                              {log.emails_sent}
                            </td>


                            {/* Login Hour */}

                            <td>
                              {log.login_hour}:00
                            </td>

                          </tr>

                        ))

                      ) : (

                        <tr>

                          <td
                            colSpan="10"
                            className="text-center py-4"
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