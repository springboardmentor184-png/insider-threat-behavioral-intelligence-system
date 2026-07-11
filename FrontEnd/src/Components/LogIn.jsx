import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

const LogIn = () => {
  const [email, setEmail] = useState("");   // Gmail field
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page reload
    try {
      const params = new URLSearchParams();
      params.append("username", email);   // backend expects "username", but we send Gmail here
      params.append("password", password);

      const res = await axios.post("http://127.0.0.1:8000/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);

      alert("Logged in!");
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data.detail === "Invalid credentials") {
        alert("Account not found. Redirecting to Register...");
        navigate("/register");
      } else {
        alert("Login failed: " + err.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Gmail"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>

        <p className="account-text">
          Don’t have an account?{" "}
          <Link to="/register">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default LogIn;
