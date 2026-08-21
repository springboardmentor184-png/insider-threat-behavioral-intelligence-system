import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import EmployeeTable from "../components/EmployeeTable";
import EmployeeForm from "../components/EmployeeForm";

import {
  getEmployees,
  deleteEmployee,
} from "../services/employeeService";

import { getCurrentUser } from "../services/authService";

import "../styles/dashboard.css";


function Employees() {

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  // =====================================================
  // Current Logged-In User
  // =====================================================

  const [user, setUser] = useState(null);


  // =====================================================
  // URL Search Parameter
  // =====================================================

  const [searchParams, setSearchParams] =
    useSearchParams();


  // =====================================================
  // Search & Filter States
  // =====================================================

  const [searchTerm, setSearchTerm] = useState("");

  const [departmentFilter, setDepartmentFilter] =
    useState("");

  const [riskFilter, setRiskFilter] =
    useState("");


  // =====================================================
  // Load Employees
  // =====================================================

  useEffect(() => {

    loadEmployees();

  }, []);


  const loadEmployees = async () => {

    try {

      setLoading(true);

      const data = await getEmployees();

      setEmployees(data);

    } catch (error) {

      console.error(
        "Failed to load employees:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // Load Current User
  // =====================================================

  useEffect(() => {

    loadUser();

  }, []);


  const loadUser = async () => {

    try {

      const response =
        await getCurrentUser();

      setUser(response.data);

    } catch (error) {

      console.error(
        "Failed to load current user:",
        error
      );

    }

  };


  // =====================================================
  // Role Check
  // =====================================================

  const isAdministrator =
    user?.role === "Administrator";


  // =====================================================
  // Read Employee From URL
  // =====================================================

  useEffect(() => {

    const employeeId =
      searchParams.get("employee");


    if (
      !employeeId ||
      employees.length === 0
    ) {

      return;

    }


    const employee = employees.find(
      (emp) =>
        String(emp.id) ===
        String(employeeId)
    );


    if (employee) {

      setSearchTerm(
        employee.employee_id
      );

    }

  }, [
    searchParams,
    employees
  ]);


  // =====================================================
  // Filter Employees
  // =====================================================

  const filteredEmployees =
    employees.filter((employee) => {

      const searchValue =
        searchTerm
          .trim()
          .toLowerCase();


      const matchesSearch =
        employee.employee_id
          .toLowerCase()
          .includes(searchValue) ||

        employee.full_name
          .toLowerCase()
          .includes(searchValue) ||

        employee.email
          .toLowerCase()
          .includes(searchValue);


      const matchesDepartment =
        departmentFilter === "" ||
        employee.department ===
          departmentFilter;


      const risk =
        employee.risk_score <= 20
          ? "Low"
          : employee.risk_score <= 60
          ? "Medium"
          : "High";


      const matchesRisk =
        riskFilter === "" ||
        risk === riskFilter;


      return (
        matchesSearch &&
        matchesDepartment &&
        matchesRisk
      );

    });


  // =====================================================
  // Add Employee
  // Administrator Only
  // =====================================================

  const handleAdd = () => {

    setSelectedEmployee(null);

    setShowForm(true);

  };


  // =====================================================
  // Edit Employee
  // Administrator Only
  // =====================================================

  const handleEdit = (employee) => {

    setSelectedEmployee(employee);

    setShowForm(true);

  };


  // =====================================================
  // Delete Employee
  // Administrator Only
  // =====================================================

  const handleDelete = async (employee) => {

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete ${employee.full_name}?`
      );


    if (!confirmDelete) {

      return;

    }


    try {

      await deleteEmployee(
        employee.id
      );

      alert(
        "Employee deleted successfully!"
      );

      loadEmployees();

    } catch (error) {

      console.error(error);

      alert(
        "Failed to delete employee."
      );

    }

  };


  // =====================================================
  // Close Form
  // =====================================================

  const handleClose = () => {

    setShowForm(false);

    setSelectedEmployee(null);

  };


  // =====================================================
  // Reset Filters
  // =====================================================

  const handleReset = () => {

    setSearchTerm("");

    setDepartmentFilter("");

    setRiskFilter("");


    // Remove employee query parameter

    setSearchParams({});

  };


  return (

    <div className="dashboard-container">

      <Sidebar />


      <div className="main-content">

        <Navbar />


        <div className="dashboard-body">


          {/* =================================================
              Header
          ================================================= */}

          <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">

            <div>

              <h2>
                Employees
              </h2>

              <p>
                Manage employee records and
                monitor risk information.
              </p>

            </div>


            {/* ===============================================
                Add Employee
                Administrator Only
            =============================================== */}

            {isAdministrator && (

              <button
                className="btn btn-primary"
                onClick={handleAdd}
              >

                + Add Employee

              </button>

            )}

          </div>


          {/* =================================================
              Search & Filters
          ================================================= */}

          <div className="card p-3 mb-4 shadow-sm">

            <div className="row g-3">


              {/* Search */}

              <div className="col-md-5">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by ID, Name or Email..."
                  value={searchTerm}
                  onChange={(e) => {

                    setSearchTerm(
                      e.target.value
                    );


                    // Remove URL parameter
                    // when user manually searches

                    if (
                      searchParams.has(
                        "employee"
                      )
                    ) {

                      setSearchParams({});

                    }

                  }}
                />

              </div>


              {/* Department */}

              <div className="col-md-3">

                <select
                  className="form-select"
                  value={departmentFilter}
                  onChange={(e) =>
                    setDepartmentFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    All Departments
                  </option>


                  {[
                    ...new Set(
                      employees.map(
                        (emp) =>
                          emp.department
                      )
                    ),
                  ].map(
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
                  onChange={(e) =>
                    setRiskFilter(
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    All Risks
                  </option>

                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>

              </div>


              {/* Reset */}

              <div className="col-md-2">

                <button
                  className="btn btn-secondary w-100"
                  onClick={handleReset}
                >

                  Reset

                </button>

              </div>

            </div>

          </div>


          {/* =================================================
              Employee Form
          ================================================= */}

          {showForm && isAdministrator && (

            <EmployeeForm
              employee={selectedEmployee}
              onEmployeeAdded={
                loadEmployees
              }
              onClose={handleClose}
            />

          )}


          {/* =================================================
              Employee Table
          ================================================= */}

          {loading ? (

            <p>
              Loading employees...
            </p>

          ) : (

            <>

              <div className="mb-3">

                <strong>

                  Showing{" "}
                  {filteredEmployees.length}
                  {" "}of{" "}
                  {employees.length}
                  {" "}employees

                </strong>

              </div>


              <EmployeeTable
                employees={
                  filteredEmployees
                }
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