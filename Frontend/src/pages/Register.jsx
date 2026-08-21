import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { registerUser } from "../services/authService";

import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    employee_id: "",
    email: "",
    department: "",
    role: "Security Analyst",
    password: "",
    confirmPassword: "",
  });

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
  // Validate Registration
  // ==========================

  const validateForm = () => {
    const fullName = formData.full_name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Full Name
    if (!fullName) {
      toast.error("Full name is required.");
      return false;
    }

    if (fullName.length < 2) {
      toast.error(
        "Full name must contain at least 2 characters."
      );
      return false;
    }

    if (fullName.length > 100) {
      toast.error(
        "Full name cannot exceed 100 characters."
      );
      return false;
    }

    if (!/^[A-Za-z ]+$/.test(fullName)) {
      toast.error(
        "Full name must contain only letters and spaces."
      );
      return false;
    }

    // Email
    if (!email) {
      toast.error("Email address is required.");
      return false;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      toast.error(
        "Please enter a valid email address."
      );
      return false;
    }

    // Password
    if (!password) {
      toast.error("Password is required.");
      return false;
    }

    if (password.length < 8) {
      toast.error(
        "Password must contain at least 8 characters."
      );
      return false;
    }

    if (password.length > 72) {
      toast.error(
        "Password cannot exceed 72 characters."
      );
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      toast.error(
        "Password must contain at least one uppercase letter."
      );
      return false;
    }

    if (!/[a-z]/.test(password)) {
      toast.error(
        "Password must contain at least one lowercase letter."
      );
      return false;
    }

    if (!/\d/.test(password)) {
      toast.error(
        "Password must contain at least one number."
      );
      return false;
    }

    if (
      !/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(
        password
      )
    ) {
      toast.error(
        "Password must contain at least one special character."
      );
      return false;
    }

    // Confirm Password
    if (!confirmPassword) {
      toast.error(
        "Please confirm your password."
      );
      return false;
    }

    if (password !== confirmPassword) {
      toast.error(
        "Passwords do not match."
      );
      return false;
    }

    return true;
  };

  // ==========================
  // Register User
  // ==========================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success(
        "Registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 800);

    } catch (error) {
      console.error(
        "Registration Error:",
        error
      );

      const detail =
        error.response?.data?.detail;

      // FastAPI validation errors
      if (Array.isArray(detail)) {
        const messages = detail
          .map((item) => item.msg)
          .filter(Boolean);

        if (messages.length > 0) {
          toast.error(messages.join(" "));
        } else {
          toast.error(
            "Please check your registration details."
          );
        }

      } else if (typeof detail === "string") {

        toast.error(detail);

      } else {

        toast.error(
          "Registration failed. Please try again."
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
            Left Panel
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
              Create your secure account to access AI-powered
              insider threat monitoring and behavioral analytics.
            </p>

            <div className="feature-box">

              <div className="feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>AI Behavior Monitoring</span>
              </div>

              <div className="feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>Secure Employee Registration</span>
              </div>

              <div className="feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>Role-Based Access Control</span>
              </div>

              <div className="feature">
                <i className="bi bi-check-circle-fill"></i>
                <span>Enterprise Security</span>
              </div>

            </div>

          </div>

        </div>

        {/* ======================================
            Right Panel
        ====================================== */}

        <div className="col-lg-6 d-flex justify-content-center align-items-center">

          <div className="login-card shadow-lg">

            <span className="badge bg-primary mb-3 px-3 py-2">

              <i className="bi bi-person-plus-fill me-2"></i>

              Employee Registration

            </span>

            <h2 className="fw-bold mb-2">
              Create Account
            </h2>

            <p className="text-muted mb-4">
              Register to access the security dashboard.
            </p>

            <form onSubmit={handleRegister}>

              {/* ======================================
                  Full Name
              ====================================== */}

              <div className="mb-3">

                <label className="form-label">
                  Full Name
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <i className="bi bi-person-fill"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your full name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />

                </div>

              </div>

              {/* ======================================
                  Employee ID
              ====================================== */}

              <div className="mb-3">

                <label className="form-label">
                  Employee ID
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <i className="bi bi-person-badge-fill"></i>
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Employee ID"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                  />

                </div>

              </div>

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
                  Department
              ====================================== */}

              <div className="mb-3">

                <label className="form-label">
                  Department
                </label>

                <select
                  className="form-select"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >

                  <option value="">
                    Select Department
                  </option>

                  <option>IT</option>
                  <option>Cyber Security</option>
                  <option>HR</option>
                  <option>Finance</option>
                  <option>Operations</option>

                </select>

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
                    placeholder="Create Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
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
                  Confirm Password
              ====================================== */}

              <div className="mb-3">

                <label className="form-label">
                  Confirm Password
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <i className="bi bi-lock-fill"></i>
                  </span>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    className="form-control"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >

                    <i
                      className={
                        showConfirmPassword
                          ? "bi bi-eye-slash-fill"
                          : "bi bi-eye-fill"
                      }
                    ></i>

                  </button>

                </div>

              </div>

              {/* ======================================
    System Role
====================================== */}

<div className="mb-3">

  <label className="form-label">
    System Role
  </label>

  <input
    type="text"
    className="form-control"
    value="Security Analyst"
    readOnly
  />

  <small className="text-muted">
    New accounts are registered with the Security Analyst role.
  </small>

</div>

              {/* ======================================
                  Terms
              ====================================== */}

              <div className="form-check mb-4">

                <input
                  className="form-check-input"
                  type="checkbox"
                  id="terms"
                  required
                />

                <label
                  className="form-check-label"
                  htmlFor="terms"
                >
                  I agree to the Terms & Conditions
                </label>

              </div>

              {/* ======================================
                  Submit
              ====================================== */}

              <button
                type="submit"
                className="btn btn-primary login-btn w-100"
                disabled={loading}
              >

                <i className="bi bi-person-plus-fill me-2"></i>

                {loading
                  ? "Creating Account..."
                  : "Create Account"}

              </button>

              {/* ======================================
                  Login Link
              ====================================== */}

              <div className="text-center mt-4">

                <p>

                  Already have an account?

                  <Link
                    to="/login"
                    className="register-link ms-2"
                  >
                    Login
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

export default Register;