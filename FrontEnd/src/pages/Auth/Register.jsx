import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !name.trim() ||
      !email.trim() ||
      !role ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please fill in all fields"
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match"
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/auth/register",
        {
          full_name: name.trim(),
          email: email.trim(),
          password: password,
          role: role
        }
      );

      setSuccess(
        "Account created successfully!"
      );

      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      console.error(
        "Registration Error:",
        error.response?.data ||
        error.message
      );

      if (
        error.response?.data?.detail
      ) {
        setError(
          error.response.data.detail
        );
      } else {
        setError(
          "Registration failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-header">

          <h1>
            Insider<span>AI</span>
          </h1>

          <p>
            Create your security account
          </p>

        </div>

        <form onSubmit={handleRegister}>

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              autoComplete="name"
            />

          </div>

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              autoComplete="email"
            />

          </div>

          <div className="form-group">

            <label htmlFor="role">
              Account Role
            </label>

            <select
              id="role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                setError("");
              }}
            >

              <option
                value=""
                disabled
              >
                Select your role
              </option>

              <option value="Security Analyst">
                Security Analyst
              </option>

              <option value="SOC Engineer">
                SOC Engineer
              </option>

              <option value="Security Manager">
                Security Manager
              </option>

              <option value="Administrator">
                Administrator
              </option>

            </select>

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              autoComplete="new-password"
            />

          </div>

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(
                  event.target.value
                );
                setError("");
              }}
              autoComplete="new-password"
            />

          </div>

          {error && (
            <p className="register-error">
              {error}
            </p>
          )}

          {success && (
            <p className="register-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <div className="register-footer">

          <p>
            Already have an account?{" "}

            <span
              onClick={() =>
                navigate("/")
              }
            >
              Sign In
            </span>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Register;