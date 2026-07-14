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

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>

        {user ? (
          <div className="profile-card">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-name">{user.full_name}</div>
            <div className="role-badge">{roleLabel}</div>

            <div className="profile-grid">
              <div>
                <div className="profile-field-label">Email</div>
                <div className="profile-field-value">{user.email}</div>
              </div>
              <div>
                <div className="profile-field-label">User ID</div>
                <div className="profile-field-value">#{user.id}</div>
              </div>
              <div>
                <div className="profile-field-label">Joined</div>
                <div className="profile-field-value">
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div>
                <div className="profile-field-label">Access Level</div>
                <div className="profile-field-value">{roleLabel}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="profile-card">Could not load profile.</div>
        )}
      </div>
    </div>
  );
}
