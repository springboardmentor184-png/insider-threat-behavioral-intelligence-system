import { useState } from "react";
import { registerUser } from "./api";

export default function Register({ onRegistered, onBackToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("security_analyst");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({
        full_name: fullName,
        email,
        password,
        role,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="login-screen">
        <div className="login-box bracket">
          <h1>Account created</h1>
          <p className="sub">You can now sign in with your new credentials.</p>
          <button className="primary" onClick={onBackToLogin}>Go to sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-box bracket">
        <h1>Register New Analyst</h1>
        <p className="sub">Create a system access account</p>

        <form onSubmit={handleSubmit}>
          <label>Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            required
          />

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

          <label>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              background: "var(--panel-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "11px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            <option value="security_analyst">Security Analyst</option>
            <option value="soc_engineer">SOC Engineer</option>
            <option value="security_manager">Security Manager</option>
            <option value="administrator">Administrator</option>
          </select>

          <button type="submit" className="primary" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          {error && <div className="login-error">{error}</div>}
        </form>

        <p className="sub" style={{ marginTop: "18px", cursor: "pointer" }} onClick={onBackToLogin}>
          &larr; Back to sign in
        </p>
      </div>
    </div>
  );
}