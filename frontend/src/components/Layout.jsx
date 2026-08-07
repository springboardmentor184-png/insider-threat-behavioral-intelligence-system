import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/employees", label: "Employees", icon: "👥" },
    { path: "/anomalies", label: "Anomalies", icon: "⚠️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-dark)" }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: 260,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-color)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: 32, paddingLeft: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            boxShadow: "0 0 15px rgba(0,242,254,0.4)"
          }}>
            🛡️
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.05em" }}>
              ITBIS
            </div>
            <div style={{ fontSize: 11, color: "var(--accent-cyan)", fontWeight: 500 }}>
              Insider Threat Intel
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  textDecoration: "none",
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: isActive ? "var(--accent-cyan)" : "var(--text-secondary)",
                  background: isActive ? "var(--accent-glow)" : "transparent",
                  border: isActive ? "1px solid var(--border-accent)" : "1px solid transparent",
                  transition: "all 0.2s ease"
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Security System Info Card */}
        <div className="glass-panel" style={{ marginTop: "auto", padding: "14px", borderRadius: 10, marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Engine Status
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              UEBA Real-Time Monitor
            </span>
          </div>
        </div>

        {/* User Info & Logout */}
        <div style={{ borderTop: "1px solid var(--border-color)", pt: 16, paddingTop: 16 }}>
          {user && (
            <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                {user.username}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Role: <span className="badge badge-accent" style={{ textTransform: "capitalize" }}>{user.role ? user.role.replace("_", " ") : "Analyst"}</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: "100%" }}>
            🚪 Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Navigation Bar */}
        <header
          style={{
            height: 64,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            position: "sticky",
            top: 0,
            zIndex: 100
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.08em", fontWeight: 600 }}>
              System Clock
            </span>
            <span className="mono" style={{ fontSize: 14, color: "var(--accent-cyan)", background: "rgba(0, 242, 254, 0.08)", padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(0, 242, 254, 0.2)" }}>
              {time.toLocaleTimeString()} UTC
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="badge badge-accent">SOC Level 3 Operational</span>
          </div>
        </header>

        {/* Main Body */}
        <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>{children}</main>
      </div>
    </div>
  );
}
