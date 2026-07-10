import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container-fluid login-page">
      <div className="row min-vh-100">

        {/* Left Section */}
        <div className="col-lg-6 left-panel d-none d-lg-flex">

          <div className="left-content">

            <div className="logo-circle">
              <i className="bi bi-shield-lock-fill"></i>
            </div>

            <h1 className="project-title">
              AI Insider Threat
            </h1>

            <h3 className="project-subtitle">
              Behavioral Intelligence System
            </h3>

            <p className="project-text">
              Protect your organization with
              AI-powered behavioral analytics,
              insider threat detection and
              secure employee authentication.
            </p>

            <div className="feature-box">

              <div className="feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>AI Behavior Monitoring</span>
              </div>

              <div className="feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>Real-Time Threat Detection</span>
              </div>

              <div className="feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>Employee Risk Analysis</span>
              </div>

              <div className="feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>Secure Authentication</span>
              </div>

            </div>

          </div>

        </div>

        {/* Right Section */}

        <div className="col-lg-6 d-flex justify-content-center align-items-center">

          <div className="login-card shadow-lg">

            <span className="badge bg-primary mb-3 px-3 py-2">
              <i className="bi bi-shield-check me-2"></i>
              Enterprise Security Portal
            </span>

            <h2 className="mb-2 fw-bold">
              Welcome Back 
            </h2>

            <p className="text-muted mb-4">
              Sign in to continue to your dashboard.
            </p>

            <form>

              {/* Email */}

              <div className="mb-3">

                <label className="form-label">
                  Email Address
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <i className="bi bi-envelope-fill"></i>
                  </span>

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                  />

                </div>

              </div>

              {/* Password */}

              <div className="mb-3">

                <label className="form-label">
                  Password
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <i className="bi bi-lock-fill"></i>
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={togglePassword}
                  >
                    <i
                      className={
                        showPassword
                          ? "bi bi-eye-slash-fill"
                          : "bi bi-eye-fill"
                      }
                    ></i>
                  </button>

                </div>

              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">

                <div className="form-check">

                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="remember"
                  />

                  <label
                    className="form-check-label"
                    htmlFor="remember"
                  >
                    Remember Me
                  </label>

                </div>

                <a href="#" className="forgot-link">
                  Forgot Password?
                </a>

              </div>

              <button
                type="submit"
                className="btn btn-primary login-btn w-100"
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Sign In Securely
              </button>

              <div className="text-center mt-4">

                <p>

                  Don't have an account?

                  <Link to="/register"className="register-link ms-2">Register</Link>

                </p>

              </div>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;