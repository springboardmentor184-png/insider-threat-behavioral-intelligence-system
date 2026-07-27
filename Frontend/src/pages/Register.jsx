import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    employee_id: "",
    email: "",
    department: "",
    role: "Employee",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await registerUser({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });

      alert("Registration Successful!");

      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.detail || "Registration Failed");
    }
  };

  return (
    <div className="container-fluid login-page">
      <div className="row min-vh-100">

        {/* Left Panel */}

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

        {/* Right Panel */}

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

              {/* Full Name */}

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
                    required
                  />

                </div>

              </div>

              {/* Employee ID */}

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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* Department */}

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

                  <option value="">Select Department</option>
                  <option>IT</option>
                  <option>Cyber Security</option>
                  <option>HR</option>
                  <option>Finance</option>
                  <option>Operations</option>

                </select>

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
                    placeholder="Create Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
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

              {/* Confirm Password */}

              <div className="mb-3">

                <label className="form-label">
                  Confirm Password
                </label>

                <div className="input-group">

                  <span className="input-group-text">
                    <i className="bi bi-lock-fill"></i>
                  </span>

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
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

              {/* Role */}

              <div className="mb-3">

                <label className="form-label">
                  Role
                </label>

                <select
                  className="form-select"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option>Employee</option>
                  <option>Admin</option>
                </select>

              </div>

              {/* Terms */}

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

              <button
                type="submit"
                className="btn btn-primary login-btn w-100"
              >
                <i className="bi bi-person-plus-fill me-2"></i>
                Create Account
              </button>

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