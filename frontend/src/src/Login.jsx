import { useState } from "react";
import api from "./api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const response = await api.post("/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      setToken(response.data.access_token);
      localStorage.setItem("token", response.data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", fontFamily: "sans-serif" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: "8px 16px" }}>
          Log In
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {token && (
        <div style={{ marginTop: 20, wordBreak: "break-all" }}>
          <strong>Logged in! Token:</strong>
          <p>{token}</p>
        </div>
      )}
    </div>
  );
}