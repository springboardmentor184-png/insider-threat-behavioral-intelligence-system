import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { loginUser } from "../services/authService";

import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ==========================
  // Toggle Password
  // ==========================

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // ==========================
  // Handle Input Change
  // ==========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================
  // Login
  // ==========================

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    // ==========================
    // Frontend Validation
    // ==========================

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    // Basic email validation
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password,
      });

      // ==========================
      // Store JWT
      // ==========================

      localStorage.setItem(
        "access_token",
        response.data.access_token
      );

      // ==========================
      // Success Notification
      // ==========================

      toast.success("Login successful!");

      // ==========================
      // Redirect
      // ==========================

      navigate("/dashboard");

    } catch (error) {
      console.error("Login Error:", error);

      const detail = error.response?.data?.detail;

      if (typeof detail === "string") {
        toast.error(detail);
      } else {
        toast.error(
          "Invalid email or password."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid login-page">

      <div className="row min-vh-100">

        {/* ======================================
            Left Section
        ====================================== */}

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

        {/* ======================================
            Right Section
        ====================================== */}

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

            <form onSubmit={handleLogin}>

              {/* ======================================
                  Email
              ====================================== */}

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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                </div>

              </div>

              {/* ======================================
                  Password
              ====================================== */}

              <div className="mb-3">

                <label className="form-label">
                  Password
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <i className="bi bi-lock-fill"></i>
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    className="form-control"
                    placeholder="Enter your password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={togglePassword}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
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

              {/* ======================================
                  Remember Me
              ====================================== */}

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

                <Link
                      to="/forgot-password"
                      className="forgot-link"
                    >
                      Forgot Password?
                </Link>

              </div>

              {/* ======================================
                  Login Button
              ====================================== */}

              <button
                type="submit"
                className="btn btn-primary login-btn w-100"
                disabled={loading}
              >

                <i className="bi bi-box-arrow-in-right me-2"></i>

                {loading
                  ? "Signing In..."
                  : "Sign In Securely"}

              </button>

              {/* ======================================
                  Register Link
              ====================================== */}

              <div className="text-center mt-4">

                <p>

                  Don't have an account?

                  <Link
                    to="/register"
                    className="register-link ms-2"
                  >
                    Register
                  </Link>

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