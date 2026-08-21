import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import api from "../services/api";
import { toast } from "react-toastify";

import "../styles/dashboard.css";


function UserManagement() {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);


  // ==========================================
  // Load Registered Users
  // ==========================================

  useEffect(() => {

    loadUsers();

  }, []);


  const loadUsers = async () => {

    try {

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response = await api.get(
        "/auth/users",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);

    } catch (error) {

      console.error(
        "Failed to load users:",
        error
      );


      // ==========================================
      // Administrator Access Required
      // ==========================================

      if (
        error.response?.status === 403
      ) {

        toast.error(
          "Administrator access required."
        );

        setTimeout(() => {

          navigate("/dashboard");

        }, 800);

      } else {

        toast.error(
          "Failed to load registered users."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // Role Badge
  // ==========================================

  const getRoleBadge = (role) => {

    switch (role) {

      case "Administrator":

        return "badge bg-danger";


      case "Security Manager":

        return "badge bg-warning text-dark";


      case "SOC Engineer":

        return "badge bg-info text-dark";


      case "Security Analyst":

        return "badge bg-primary";


      default:

        return "badge bg-secondary";

    }

  };


  // ==========================================
  // Statistics
  // ==========================================

  const totalUsers =
    users.length;


  const administrators =
    users.filter(
      (user) =>
        user.role === "Administrator"
    ).length;


  const securityAnalysts =
    users.filter(
      (user) =>
        user.role === "Security Analyst"
    ).length;


  const securityManagers =
    users.filter(
      (user) =>
        user.role === "Security Manager"
    ).length;


  const socEngineers =
    users.filter(
      (user) =>
        user.role === "SOC Engineer"
    ).length;


  const otherSecurityRoles =
    securityManagers +
    socEngineers;


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="dashboard-container">

      <Sidebar />


      <div className="main-content">

        <Navbar />


        <div className="dashboard-body">


          {/* ==================================
              Page Header
          ================================== */}

          <div className="mb-4">

            <h2 className="fw-bold">
              User Management
            </h2>

            <p className="text-muted">
              View registered system users and
              their assigned security roles.
            </p>

          </div>


          {/* ==================================
              Information Notice
          ================================== */}

          <div className="alert alert-info">

            <i className="bi bi-info-circle-fill me-2"></i>

            This page displays users currently
            registered in the system database.
            Login activity is not stored as a
            separate history record.

          </div>


          {/* ==================================
              KPI Cards
          ================================== */}

          <div className="row mb-4">


            {/* Total Users */}

            <div className="col-md-3">

              <div className="card shadow-sm text-center">

                <div className="card-body">

                  <h3>
                    {totalUsers}
                  </h3>

                  <small className="text-muted">
                    Total Registered Users
                  </small>

                </div>

              </div>

            </div>


            {/* Administrators */}

            <div className="col-md-3">

              <div className="card shadow-sm text-center">

                <div className="card-body">

                  <h3 className="text-danger">
                    {administrators}
                  </h3>

                  <small className="text-muted">
                    Administrators
                  </small>

                </div>

              </div>

            </div>


            {/* Security Analysts */}

            <div className="col-md-3">

              <div className="card shadow-sm text-center">

                <div className="card-body">

                  <h3 className="text-primary">
                    {securityAnalysts}
                  </h3>

                  <small className="text-muted">
                    Security Analysts
                  </small>

                </div>

              </div>

            </div>


            {/* Other Roles */}

            <div className="col-md-3">

              <div className="card shadow-sm text-center">

                <div className="card-body">

                  <h3 className="text-info">
                    {otherSecurityRoles}
                  </h3>

                  <small className="text-muted">
                    Other Security Roles
                  </small>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================
              Registered Users Table
          ================================== */}

          <div className="card shadow">

            <div className="card-body">


              <div className="d-flex justify-content-between align-items-center mb-4">

                <h4 className="mb-0">
                  Registered Users
                </h4>

                <span className="badge bg-secondary">
                  {users.length} User(s)
                </span>

              </div>


              {/* ==================================
                  Loading
              ================================== */}

              {loading ? (

                <div className="text-center py-5">

                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>

                  <p className="mt-3 text-muted">
                    Loading users...
                  </p>

                </div>


              ) : users.length === 0 ? (


                /* ==================================
                   No Users
                ================================== */

                <div className="alert alert-info">

                  No registered users found.

                </div>


              ) : (


                /* ==================================
                   Users Table
                ================================== */

                <div className="table-responsive">

                  <table className="table table-hover align-middle">


                    <thead className="table-light">

                      <tr>

                        <th>
                          #
                        </th>

                        <th>
                          Full Name
                        </th>

                        <th>
                          Email
                        </th>

                        <th>
                          System Role
                        </th>

                        <th>
                          Status
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {users.map(
                        (user, index) => (

                          <tr
                            key={user.id}
                          >

                            <td>
                              {index + 1}
                            </td>


                            <td>

                              <strong>
                                {user.full_name}
                              </strong>

                            </td>


                            <td>
                              {user.email}
                            </td>


                            <td>

                              <span
                                className={
                                  getRoleBadge(
                                    user.role
                                  )
                                }
                              >

                                {user.role}

                              </span>

                            </td>


                            <td>

                              <span className="badge bg-success">

                                <i className="bi bi-check-circle me-1"></i>

                                Active

                              </span>

                            </td>

                          </tr>

                        )
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


export default UserManagement;