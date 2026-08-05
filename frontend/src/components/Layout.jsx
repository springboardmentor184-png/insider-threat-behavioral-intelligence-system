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
  { path: "/dashboard", label: "Dashboard" },
  { path: "/employees", label: "Employees" },
  { path: "/anomalies", label: "Anomalies" },
];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-hairline)",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: 32, paddingLeft: 8 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--accent)", letterSpacing: "0.03em" }}>
            ITBIS
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
            Insider Threat Intel
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                color: location.pathname === item.path ? "var(--accent)" : "var(--text-secondary)",
                background: location.pathname === item.path ? "var(--accent-dim)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: "auto" }}>
          <button onClick={handleLogout} className="btn" style={{ width: "100%" }}>
            Log out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: 56,
            borderBottom: "1px solid var(--border-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="live-dot" />
            <span className="mono" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {time.toLocaleTimeString()}
            </span>
          </div>

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{user.username}</span>
              <span className="badge badge-accent">{user.role.replace("_", " ")}</span>
            </div>
          )}
        </header>

        <main style={{ flex: 1, padding: 32 }}>{children}</main>
      </div>
    </div>
  );
}
