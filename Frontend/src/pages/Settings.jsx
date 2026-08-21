import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import { getCurrentUser } from "../services/authService";

import "../styles/dashboard.css";

function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // Load Current User
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
        "Failed to load user settings:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="dashboard-body">

          {/* =====================================================
              Page Header
          ===================================================== */}

          <div className="mb-4">

            <h2 className="fw-bold">
              Settings
            </h2>

            <p className="text-muted">
              Manage application information, account and security preferences.
            </p>

          </div>


          {/* =====================================================
              Account Information
          ===================================================== */}

          <div className="card shadow-sm mb-4">

            <div className="card-header bg-primary text-white">

              <h5 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Account Information
              </h5>

            </div>

            <div className="card-body">

              {loading ? (

                <div className="text-center py-3">

                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>

                  <p className="mt-2 text-muted">
                    Loading account information...
                  </p>

                </div>

              ) : user ? (

                <div className="row">

                  <div className="col-md-6 mb-3">

                    <strong>
                      Full Name
                    </strong>

                    <p className="text-muted mb-0">
                      {user.full_name}
                    </p>

                  </div>


                  <div className="col-md-6 mb-3">

                    <strong>
                      Email
                    </strong>

                    <p className="text-muted mb-0">
                      {user.email}
                    </p>

                  </div>


                  <div className="col-md-6 mb-3">

                    <strong>
                      System Role
                    </strong>

                    <p className="mb-0">

                      <span className="badge bg-danger">
                        {user.role}
                      </span>

                    </p>

                  </div>


                  <div className="col-md-6 mb-3">

                    <strong>
                      Authentication Status
                    </strong>

                    <p className="mb-0">

                      <span className="badge bg-success">

                        <i className="bi bi-check-circle me-1"></i>

                        Authenticated

                      </span>

                    </p>

                  </div>

                </div>

              ) : (

                <div className="alert alert-warning mb-0">

                  Unable to load account information.

                </div>

              )}

            </div>

          </div>


          {/* =====================================================
              Application Settings
          ===================================================== */}

          <div className="card shadow-sm mb-4">

            <div className="card-header">

              <h5 className="mb-0">

                <i className="bi bi-sliders me-2"></i>

                Application Settings

              </h5>

            </div>

            <div className="card-body">

              <div className="row">

                <div className="col-md-6 mb-3">

                  <div className="border rounded p-3">

                    <h6 className="fw-bold">

                      <i className="bi bi-shield-check text-primary me-2"></i>

                      Security Monitoring

                    </h6>

                    <p className="text-muted mb-0">

                      AI-powered insider threat monitoring is enabled.

                    </p>

                  </div>

                </div>


                <div className="col-md-6 mb-3">

                  <div className="border rounded p-3">

                    <h6 className="fw-bold">

                      <i className="bi bi-cpu text-primary me-2"></i>

                      AI Threat Detection

                    </h6>

                    <p className="text-muted mb-0">

                      Behavioral anomaly detection is available.

                    </p>

                  </div>

                </div>


                <div className="col-md-6 mb-3">

                  <div className="border rounded p-3">

                    <h6 className="fw-bold">

                      <i className="bi bi-bell text-primary me-2"></i>

                      Threat Alerts

                    </h6>

                    <p className="text-muted mb-0">

                      Security alerts are enabled for detected threats.

                    </p>

                  </div>

                </div>


                <div className="col-md-6 mb-3">

                  <div className="border rounded p-3">

                    <h6 className="fw-bold">

                      <i className="bi bi-file-earmark-bar-graph text-primary me-2"></i>

                      Reports & Export

                    </h6>

                    <p className="text-muted mb-0">

                      Security reports and risk information can be exported.

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =====================================================
              Security Information
          ===================================================== */}

          <div className="card shadow-sm mb-4">

            <div className="card-header">

              <h5 className="mb-0">

                <i className="bi bi-lock-fill me-2"></i>

                Security

              </h5>

            </div>

            <div className="card-body">

              <div className="alert alert-success">

                <i className="bi bi-shield-check me-2"></i>

                Your account is protected using secure authentication.

              </div>


              <div className="row">

                <div className="col-md-4 mb-3">

                  <div className="border rounded p-3 text-center">

                    <i className="bi bi-key-fill fs-3 text-primary"></i>

                    <h6 className="mt-2">
                      Password Security
                    </h6>

                    <small className="text-muted">
                      Passwords are securely hashed.
                    </small>

                  </div>

                </div>


                <div className="col-md-4 mb-3">

                  <div className="border rounded p-3 text-center">

                    <i className="bi bi-shield-lock-fill fs-3 text-primary"></i>

                    <h6 className="mt-2">
                      JWT Authentication
                    </h6>

                    <small className="text-muted">
                      Protected API access is enabled.
                    </small>

                  </div>

                </div>


                <div className="col-md-4 mb-3">

                  <div className="border rounded p-3 text-center">

                    <i className="bi bi-envelope-check-fill fs-3 text-primary"></i>

                    <h6 className="mt-2">
                      OTP Recovery
                    </h6>

                    <small className="text-muted">
                      Password recovery uses email OTP verification.
                    </small>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =====================================================
              System Information
          ===================================================== */}

          <div className="card shadow-sm">

            <div className="card-header">

              <h5 className="mb-0">

                <i className="bi bi-info-circle me-2"></i>

                System Information

              </h5>

            </div>

            <div className="card-body">

              <div className="row">

                <div className="col-md-6 mb-3">

                  <strong>
                    Application
                  </strong>

                  <p className="text-muted mb-0">
                    Insider Threat Behavioral Intelligence System
                  </p>

                </div>


                <div className="col-md-6 mb-3">

                  <strong>
                    Environment
                  </strong>

                  <p className="text-muted mb-0">
                    Development / Testing
                  </p>

                </div>


                <div className="col-md-6">

                  <strong>
                    Authentication
                  </strong>

                  <p className="text-muted mb-0">
                    JWT-based Authentication
                  </p>

                </div>


                <div className="col-md-6">

                  <strong>
                    Access Control
                  </strong>

                  <p className="text-muted mb-0">
                    Role-Based Access Control (RBAC)
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Settings;