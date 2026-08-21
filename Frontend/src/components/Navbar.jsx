import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import NotificationBell from "./NotificationBell";

import { getCurrentUser } from "../services/authService";
import { getEmployees } from "../services/employeeService";


function Navbar() {

  const navigate = useNavigate();

  // =====================================================
  // State
  // =====================================================

  const [search, setSearch] = useState("");

  const [user, setUser] = useState(null);

  const [employees, setEmployees] = useState([]);

  const [showResults, setShowResults] = useState(false);


  // =====================================================
  // Load Logged-In User
  // =====================================================

  useEffect(() => {

    loadUser();

  }, []);


  const loadUser = async () => {

    try {

      const response = await getCurrentUser();

      setUser(response.data);

    } catch (error) {

      console.error(
        "Failed to load current user:",
        error
      );

    }

  };


  // =====================================================
  // Load Employees For Search
  // =====================================================

  useEffect(() => {

    loadEmployees();

  }, []);


  const loadEmployees = async () => {

    try {

      const data = await getEmployees();

      setEmployees(data);

    } catch (error) {

      console.error(
        "Failed to load employees:",
        error
      );

    }

  };


  // =====================================================
  // Employee Search
  // =====================================================

  const filteredEmployees = employees.filter(
    (employee) => {

      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) {
        return false;
      }

      return (
        employee.employee_id
          ?.toLowerCase()
          .includes(searchValue) ||

        employee.full_name
          ?.toLowerCase()
          .includes(searchValue) ||

        employee.email
          ?.toLowerCase()
          .includes(searchValue)
      );

    }
  );


  // =====================================================
  // Handle Search Change
  // =====================================================

  const handleSearchChange = (e) => {

    const value = e.target.value;

    setSearch(value);

    setShowResults(
      value.trim().length > 0
    );

  };


  // =====================================================
  // Open Employee
  // =====================================================

  const handleEmployeeClick = (employee) => {

    setSearch("");

    setShowResults(false);

    navigate(
      `/employees?employee=${employee.id}`
    );

  };


  // =====================================================
  // Handle Search Submit
  // =====================================================

  const handleSearchSubmit = (e) => {

    e.preventDefault();

    if (!search.trim()) {
      return;
    }

    if (filteredEmployees.length > 0) {

      handleEmployeeClick(
        filteredEmployees[0]
      );

      return;
    }

    // If no employee found,
    // open Employees page.

    setShowResults(false);

    navigate("/employees");

  };


  // =====================================================
  // Close Search Results
  // =====================================================

  const handleSearchBlur = () => {

    // Small delay allows click on result
    // before dropdown disappears.

    setTimeout(() => {

      setShowResults(false);

    }, 200);

  };


  // =====================================================
  // Profile Navigation
  // =====================================================

  const handleProfileClick = () => {

    navigate("/profile");

  };


  // =====================================================
  // Keyboard Navigation
  // =====================================================

  const handleProfileKeyDown = (e) => {

    if (
      e.key === "Enter" ||
      e.key === " "
    ) {

      e.preventDefault();

      navigate("/profile");

    }

  };


  // =====================================================
  // Render
  // =====================================================

  return (

    <nav className="top-navbar">


      {/* =================================================
          LEFT SECTION
      ================================================= */}

      <div className="navbar-left">

        <h3>
          Dashboard
        </h3>

        <p>

          Welcome back,{" "}

          {user?.full_name ||
            "Administrator"}

          {" "}👋

        </p>

      </div>


      {/* =================================================
          RIGHT SECTION
      ================================================= */}

      <div className="navbar-right">


        {/* =================================================
            EMPLOYEE SEARCH
        ================================================= */}

        <div
          className="navbar-search-wrapper"
          onBlur={handleSearchBlur}
        >

          <form
            className="search-box"
            onSubmit={handleSearchSubmit}
          >

            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={handleSearchChange}
              onFocus={() => {

                if (search.trim()) {

                  setShowResults(true);

                }

              }}
            />

          </form>


          {/* =================================================
              SEARCH RESULTS
          ================================================= */}

          {showResults && (

            <div className="employee-search-results">

              {filteredEmployees.length > 0 ? (

                filteredEmployees
                  .slice(0, 6)
                  .map((employee) => (

                    <div
                      key={employee.id}
                      className="employee-search-result"
                      onMouseDown={() =>
                        handleEmployeeClick(
                          employee
                        )
                      }
                    >

                      <div className="employee-result-icon">

                        <i className="bi bi-person-fill"></i>

                      </div>


                      <div className="employee-result-info">

                        <strong>

                          {employee.employee_id}

                        </strong>

                        <span>

                          {employee.full_name}

                        </span>

                      </div>


                      <i className="bi bi-arrow-right"></i>

                    </div>

                  ))

              ) : (

                <div className="employee-search-empty">

                  <i className="bi bi-search me-2"></i>

                  No employee found

                </div>

              )}

            </div>

          )}

        </div>


        {/* =================================================
            NOTIFICATION
        ================================================= */}

        <div className="icon-box">

          <NotificationBell />

        </div>


        {/* =================================================
            USER PROFILE
        ================================================= */}

        <div
          className="profile-box"
          onClick={handleProfileClick}
          title="View Profile"
          role="button"
          tabIndex={0}
          onKeyDown={handleProfileKeyDown}
        >

          <div className="profile-image">

            <i className="bi bi-person-fill"></i>

          </div>


          <div>

            <h6>

              {user?.full_name ||
                "Administrator"}

            </h6>

            <small>
                {user?.role || "Security Analyst"}
            </small>

          </div>

        </div>


      </div>

    </nav>

  );

}


export default Navbar;