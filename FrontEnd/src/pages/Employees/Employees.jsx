import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Users,
  Eye,
  X
} from "lucide-react";
import "./Employees.css";

const API_URL = "http://127.0.0.1:8000";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, search, riskFilter]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/employees/`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.employees || [];

      setEmployees(data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load employees"
      );
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let result = [...employees];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((employee) =>
        [
          employee.name,
          employee.employee_id,
          employee.email,
          employee.department,
          employee.designation
        ]
          .map((value) =>
            String(value || "").toLowerCase()
          )
          .some((value) => value.includes(query))
      );
    }

    if (riskFilter !== "All") {
      result = result.filter(
        (employee) =>
          String(employee.risk_level || "Low")
            .toLowerCase() ===
          riskFilter.toLowerCase()
      );
    }

    setFilteredEmployees(result);
  };

  const getRiskClass = (risk) => {
    return String(risk || "Low").toLowerCase();
  };

  const getRiskCount = (level) => {
    return employees.filter(
      (employee) =>
        String(employee.risk_level || "Low")
          .toLowerCase() === level.toLowerCase()
    ).length;
  };

  if (loading) {
    return (
      <div className="employees-page">
        <div className="employees-loading">
          Loading employees...
        </div>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <h1>Employees</h1>

          <p>
            Monitor employee profiles and behavioral risk levels
          </p>
        </div>

        <button
          className="employees-refresh-button"
          onClick={loadEmployees}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="employees-error">
          <span>{error}</span>

          <button onClick={loadEmployees}>
            Try Again
          </button>
        </div>
      )}

      <div className="employees-summary">
        <div className="employee-summary-card">
          <div className="employee-summary-icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total Employees</span>
            <strong>{employees.length}</strong>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-icon critical">
            <Users size={22} />
          </div>

          <div>
            <span>Critical Risk</span>
            <strong>{getRiskCount("Critical")}</strong>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-icon high">
            <Users size={22} />
          </div>

          <div>
            <span>High Risk</span>
            <strong>{getRiskCount("High")}</strong>
          </div>
        </div>

        <div className="employee-summary-card">
          <div className="employee-summary-icon medium">
            <Users size={22} />
          </div>

          <div>
            <span>Medium Risk</span>
            <strong>{getRiskCount("Medium")}</strong>
          </div>
        </div>
      </div>

      <div className="employees-content">
        <div className="employees-toolbar">
          <div className="employee-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter(event.target.value)
            }
          >
            <option value="All">
              All Risk Levels
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
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="employees-empty">
            <Users size={42} />

            <h3>No employees found</h3>

            <p>
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="employees-table-wrapper">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={
                      employee.id ||
                      employee.employee_id
                    }
                  >
                    <td>
                      <div className="employee-name-cell">
                        <div className="employee-avatar">
                          {String(
                            employee.name || "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {employee.name || "Unknown"}
                          </strong>

                          <span>
                            {employee.email || "-"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {employee.employee_id || "-"}
                    </td>

                    <td>
                      {employee.department || "-"}
                    </td>

                    <td>
                      {employee.designation || "-"}
                    </td>

                    <td>
                      <strong>
                        {Number(
                          employee.risk_score || 0
                        ).toFixed(1)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`employee-risk-badge ${getRiskClass(
                          employee.risk_level
                        )}`}
                      >
                        {employee.risk_level || "Low"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`employee-status ${
                          employee.is_active
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {employee.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <button
                        className="employee-view-button"
                        onClick={() =>
                          setSelectedEmployee(
                            employee
                          )
                        }
                      >
                        <Eye size={16} />
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

      {selectedEmployee && (
        <div
          className="employee-modal-overlay"
          onClick={() =>
            setSelectedEmployee(null)
          }
        >
          <div
            className="employee-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="employee-modal-header">
              <div>
                <h2>
                  {selectedEmployee.name ||
                    "Employee"}
                </h2>

                <p>
                  Employee Profile
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedEmployee(null)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="employee-modal-body">
              <div className="employee-profile-avatar">
                {String(
                  selectedEmployee.name || "U"
                )
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="employee-details-grid">
                <div>
                  <span>Employee ID</span>

                  <strong>
                    {selectedEmployee.employee_id ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    {selectedEmployee.email || "-"}
                  </strong>
                </div>

                <div>
                  <span>Department</span>

                  <strong>
                    {selectedEmployee.department ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Designation</span>

                  <strong>
                    {selectedEmployee.designation ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Manager</span>

                  <strong>
                    {selectedEmployee.manager || "-"}
                  </strong>
                </div>

                <div>
                  <span>Risk Score</span>

                  <strong>
                    {Number(
                      selectedEmployee.risk_score || 0
                    ).toFixed(1)}
                  </strong>
                </div>

                <div>
                  <span>Risk Level</span>

                  <strong>
                    {selectedEmployee.risk_level ||
                      "Low"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    {selectedEmployee.is_active
                      ? "Active"
                      : "Inactive"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="employee-modal-footer">
              <button
                onClick={() =>
                  setSelectedEmployee(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;