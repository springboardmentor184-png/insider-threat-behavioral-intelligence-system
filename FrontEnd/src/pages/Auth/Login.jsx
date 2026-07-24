import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      const token = response.data.access_token;

      if (!token) {
        setError("Login successful but token was not received");
        return;
      }

      localStorage.setItem("access_token", token);

      localStorage.setItem(
        "token_type",
        response.data.token_type || "bearer"
      );

      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "Login Error:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Unable to connect to server");
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
            Behavioral Intelligence System
          </p>

        </div>

        <form onSubmit={handleLogin}>

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

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              autoComplete="current-password"
            />

          </div>

          {error && (
            <p className="register-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <div className="register-footer">

          <p>
            Don't have an account?{" "}

            <span
              onClick={() => navigate("/register")}
            >
              Create Account
            </span>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;