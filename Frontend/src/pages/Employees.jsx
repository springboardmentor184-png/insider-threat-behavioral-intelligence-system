import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeForm from "../components/EmployeeForm";

import {
  getEmployees,
  deleteEmployee,
} from "../services/employeeService";

import "../styles/dashboard.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  // Load Employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Employees
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.employee_id
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter === "" ||
      employee.department === departmentFilter;

    const risk =
      employee.risk_score <= 20
        ? "Low"
        : employee.risk_score <= 60
        ? "Medium"
        : "High";

    const matchesRisk =
      riskFilter === "" || risk === riskFilter;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesRisk
    );
  });

  // Add Employee
  const handleAdd = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  // Edit Employee
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  // Delete Employee
  const handleDelete = async (employee) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${employee.full_name}?`
    );

    if (!confirmDelete) return;

    try {
      await deleteEmployee(employee.id);

      alert("Employee deleted successfully!");

      loadEmployees();
    } catch (error) {
      console.error(error);
      alert("Failed to delete employee.");
    }
  };

  // Close Form
  const handleClose = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div className="dashboard-body">

          {/* Header */}
          <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Employees</h2>
              <p>Manage employee records and monitor risk information.</p>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAdd}
            >
              + Add Employee
            </button>
          </div>

          {/* Search & Filters */}
          <div className="card p-3 mb-4 shadow-sm">
            <div className="row g-3">

              {/* Search */}
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔍 Search by ID, Name or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Department */}
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>

                  {[...new Set(employees.map(emp => emp.department))].map(
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

              {/* Risk */}
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                >
                  <option value="">All Risks</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Reset */}
              <div className="col-md-2">
                <button
                  className="btn btn-secondary w-100"
                  onClick={() => {
                    setSearchTerm("");
                    setDepartmentFilter("");
                    setRiskFilter("");
                  }}
                >
                  Reset
                </button>
              </div>

            </div>
          </div>

          {/* Employee Form */}
          {showForm && (
            <EmployeeForm
              employee={selectedEmployee}
              onEmployeeAdded={loadEmployees}
              onClose={handleClose}
            />
          )}

          {/* Employee Table */}
          {loading ? (
            <p>Loading employees...</p>
          ) : (
            <>
              <div className="mb-3">
                <strong>
                  Showing {filteredEmployees.length} of {employees.length} employees
                </strong>
              </div>

              <EmployeeTable
                employees={filteredEmployees}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Employees;