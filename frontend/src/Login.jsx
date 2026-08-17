import { useState } from "react";
import { login } from "./api";

export default function Login({ onLoginSuccess, onShowRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);

      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      localStorage.setItem("email", payload.email);
      localStorage.setItem("role", payload.role);

      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-bg-fx">
        <div className="scan-ring"></div>
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="orb"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${6 + (i % 5)}s`,
            }}
          ></span>
        ))}
      </div>

      <div className="login-box bracket">
        <h1>Insider Threat Intelligence</h1>
        <p className="sub">Behavioral Analytics &amp; SOC Console</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />

          <button type="submit" className="primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {error && <div className="login-error">{error}</div>}
        </form>

        <p
          className="sub"
          style={{ marginTop: "18px", cursor: "pointer" }}
          onClick={onShowRegister}
        >
          New here? Create an account &rarr;
        </p>
      </div>
    </div>
  );
}