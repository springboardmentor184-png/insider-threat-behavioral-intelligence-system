import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("security_analyst");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, email, password, role);
        // Login after register
        await login(username, password);
      } else {
        await login(username, password);
      }
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUsername, demoRole) => {
    setError("");
    setLoading(true);
    try {
      // Create account or login with default password
      const defaultPass = "password123";
      try {
        await login(demoUsername, defaultPass);
      } catch (loginErr) {
        // Register if not exists
        await register(demoUsername, `${demoUsername}@security.org`, defaultPass, demoRole);
        await login(demoUsername, defaultPass);
      }
      navigate("/dashboard");
    } catch (err) {
      setError("Demo login failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at top right, #1e293b 0%, #070a12 60%)",
      padding: "20px"
    }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: 460, padding: 36, borderRadius: 16 }}>
        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            boxShadow: "0 0 25px rgba(0,242,254,0.4)",
            marginBottom: 14
          }}>
            🛡️
          </div>
          <h1 className="title-gradient" style={{ fontSize: 24, marginBottom: 6 }}>
            ITBIS Intelligence Portal
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Insider Threat Behavioral Intelligence & Risk Scoring Engine
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", background: "rgba(30, 41, 59, 0.6)", borderRadius: 8, padding: 4, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(""); }}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: 6,
              border: "none",
              background: !isRegister ? "var(--bg-surface)" : "transparent",
              color: !isRegister ? "var(--accent-cyan)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(""); }}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: 6,
              border: "none",
              background: isRegister ? "var(--bg-surface)" : "transparent",
              color: isRegister ? "var(--accent-cyan)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Register Account
          </button>
        </div>

        {error && (
          <div style={{
            background: "var(--risk-critical-bg)",
            border: "1px solid var(--risk-critical)",
            color: "var(--risk-critical)",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. analyst_john"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="analyst@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Assignment</label>
                <select
                  className="input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="security_analyst">Security Analyst</option>
                  <option value="soc_engineer">SOC Engineer</option>
                  <option value="security_manager">Security Manager</option>
                  <option value="administrator">Administrator</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: 12, padding: "12px" }}
          >
            {loading ? "Authenticating..." : isRegister ? "Create Account & Sign In" : "Sign In to Console"}
          </button>
        </form>

        {/* Demo Quick Login Options */}
        <div style={{ marginTop: 24, borderTop: "1px solid var(--border-color)", paddingTop: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Quick Demo Login Roles
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 11, padding: "8px" }}
              onClick={() => handleDemoLogin("analyst_demouser", "security_analyst")}
            >
              🔍 Security Analyst
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 11, padding: "8px" }}
              onClick={() => handleDemoLogin("soc_engineer_demo", "soc_engineer")}
            >
              ⚙️ SOC Engineer
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 11, padding: "8px" }}
              onClick={() => handleDemoLogin("sec_manager_demo", "security_manager")}
            >
              👔 Security Manager
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: 11, padding: "8px" }}
              onClick={() => handleDemoLogin("admin_demo", "administrator")}
            >
              🔑 Administrator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
