import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, fetchProfile, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile().finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return <div className="loading-screen">Loading your dashboard...</div>;
  }

  const initials = user
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const roleLabel = user ? user.role.replace(/_/g, " ") : "";
  const isAdmin = user?.role === "administrator";

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-topbar">
          <div className="dashboard-brand">
            <div className="dashboard-brand-icon">IT</div>
            <div>
              <h1>Insider Threat Intelligence</h1>
              <p>Behavioral Security Platform</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>

        <div className="welcome-banner">
          <h2>Welcome back, {user?.full_name?.split(" ")[0]}</h2>
          <p>Here's a quick overview of your account and system status.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-top">
              <div>
                <p className="stat-value">Active</p>
                <p className="stat-label">Account Status</p>
              </div>
              <div className="stat-icon green">OK</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div>
                <p
                  className="stat-value"
                  style={{ textTransform: "capitalize" }}
                >
                  {roleLabel}
                </p>
                <p className="stat-label">Access Role</p>
              </div>
              <div className="stat-icon blue">ROLE</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div>
                <p className="stat-value">0</p>
                <p className="stat-label">Open Alerts</p>
              </div>
              <div className="stat-icon amber">!</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-top">
              <div>
                <p className="stat-value">0</p>
                <p className="stat-label">High Risk Users</p>
              </div>
              <div className="stat-icon red">RISK</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {user && (
            <div className="profile-card">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-name">{user.full_name}</div>
              <div className="role-badge">{roleLabel}</div>

              <div>
                <div className="profile-row">
                  <span className="profile-row-label">Email</span>
                  <span className="profile-row-value">{user.email}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-row-label">User ID</span>
                  <span className="profile-row-value">#{user.id}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-row-label">Joined</span>
                  <span className="profile-row-value">
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="profile-row">
                  <span className="profile-row-label">Access Level</span>
                  <span
                    className="profile-row-value"
                    style={{ textTransform: "capitalize" }}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="panel-card">
              <h3>Recent Activity</h3>
              <p className="sub">Your latest account events</p>

              <div className="activity-item">
                <div className="activity-dot green"></div>
                <div className="activity-text">Successful login</div>
                <div className="activity-time">Just now</div>
              </div>
              <div className="activity-item">
                <div className="activity-dot blue"></div>
                <div className="activity-text">Account registered</div>
                <div className="activity-time">
                  {new Date(user?.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="panel-card">
              <h3>Behavioral Monitoring</h3>
              <p className="sub">Anomaly detection &amp; risk scoring</p>
              <div className="empty-note">
                No behavioral data yet — this module activates once activity
                monitoring (Module 3) is connected.
              </div>
            </div>

            {isAdmin && (
              <div className="panel-card">
                <h3>Admin Tools</h3>
                <p className="sub">Available only to Administrators</p>
                <a
                  href="/employees"
                  className="btn-primary"
                  style={{
                    display: "inline-block",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Manage Employees
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
