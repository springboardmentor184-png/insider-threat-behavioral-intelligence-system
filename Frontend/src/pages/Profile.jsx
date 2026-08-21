import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { getCurrentUser, clearAuthData } from "../services/authService";

import "../styles/dashboard.css";


function Profile() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =====================================================
  // Load Current User
  // =====================================================

  useEffect(() => {

    loadProfile();

  }, []);


  const loadProfile = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await getCurrentUser();

      setUser(response.data);

    } catch (error) {

      console.error(
        "Failed to load profile:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load profile."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // Logout
  // =====================================================

  const handleLogout = () => {

    clearAuthData();

    navigate("/login");

  };


  // =====================================================
  // Render
  // =====================================================

  return (

    <div className="dashboard-container">

      <Sidebar />


      <div className="main-content">

        <Navbar />


        <div className="dashboard-body">


          {/* =================================================
              Header
          ================================================= */}

          <div className="dashboard-header mb-4">

            <div>

              <h2>
                {user?.role || "User"} Profile
              </h2>

              <p>
                Manage and view your authenticated
                account information.
              </p>

            </div>

          </div>


          {/* =================================================
              Loading
          ================================================= */}

          {loading && (

            <div className="text-center my-5">

              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="mt-3">
                Loading profile...
              </p>

            </div>

          )}


          {/* =================================================
              Error
          ================================================= */}

          {!loading && error && (

            <div
              className="alert alert-danger"
              role="alert"
            >

              <i className="bi bi-exclamation-triangle-fill me-2"></i>

              {error}

            </div>

          )}


          {/* =================================================
              Profile
          ================================================= */}

          {!loading && !error && user && (

            <div className="row">


              {/* =============================================
                  Profile Card
              ============================================= */}

              <div className="col-lg-4 mb-4">

                <div className="card shadow-sm h-100">

                  <div className="card-body text-center">


                    {/* Profile Icon */}

                    <div
                      className="profile-image mx-auto mb-3"
                      style={{
                        width: "90px",
                        height: "90px",
                        fontSize: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >

                      <i className="bi bi-person-fill"></i>

                    </div>


                    {/* Full Name */}

                    <h4 className="mb-1">

                      {user.full_name}

                    </h4>


                    {/* Email */}

                    <p className="text-muted mb-3">

                      {user.email}

                    </p>


                    {/* Role */}

                    <span className="badge bg-primary">

                      <i className="bi bi-shield-check me-1"></i>

                      {user.role}

                    </span>


                    <hr />


                    {/* Account Status */}

                    <div className="text-success">

                      <i className="bi bi-circle-fill me-2"></i>

                      Active Account

                    </div>

                  </div>

                </div>

              </div>


              {/* =============================================
                  Account Information
              ============================================= */}

              <div className="col-lg-8 mb-4">

                <div className="card shadow-sm">


                  {/* Card Header */}

                  <div className="card-header">

                    <h5 className="mb-0">

                      <i className="bi bi-person-vcard me-2"></i>

                      Account Information

                    </h5>

                  </div>


                  <div className="card-body">

                    <div className="row">


                      {/* Full Name */}

                      <div className="col-md-6 mb-4">

                        <label className="form-label text-muted">

                          Full Name

                        </label>

                        <div className="form-control bg-light">

                          {user.full_name}

                        </div>

                      </div>


                      {/* Email */}

                      <div className="col-md-6 mb-4">

                        <label className="form-label text-muted">

                          Email Address

                        </label>

                        <div className="form-control bg-light">

                          {user.email}

                        </div>

                      </div>


                      {/* Role */}

                      <div className="col-md-6 mb-4">

                        <label className="form-label text-muted">

                          Role

                        </label>

                        <div className="form-control bg-light">

                          {user.role}

                        </div>

                      </div>


                      {/* Status */}

                      <div className="col-md-6 mb-4">

                        <label className="form-label text-muted">

                          Account Status

                        </label>

                        <div className="form-control bg-light">

                          <span className="text-success">

                            <i className="bi bi-circle-fill me-2"></i>

                            Active

                          </span>

                        </div>

                      </div>


                    </div>


                    {/* =================================================
                        Security Section
                    ================================================= */}

                    <hr />


                    <h5 className="mb-3">

                      <i className="bi bi-shield-lock me-2"></i>

                      Security

                    </h5>


                    <div className="alert alert-info">

                      <i className="bi bi-info-circle me-2"></i>

                      Your account is protected using
                      JWT-based authentication.

                    </div>


                    {/* Logout */}

                    <button
                      className="btn btn-danger"
                      onClick={handleLogout}
                    >

                      <i className="bi bi-box-arrow-right me-2"></i>

                      Logout

                    </button>

                  </div>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}


export default Profile;