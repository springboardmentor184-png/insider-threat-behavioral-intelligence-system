import { Bell, Search, UserCircle2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <ShieldCheck className="logo-icon" />
        <h2>Security Operations Center</h2>
      </div>

      <div className="navbar-center">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search employees, alerts..."
          />
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification">
          <Bell size={20} />
          <span className="badge">5</span>
        </div>

        <div
          className="profile"
          onClick={() => navigate("/profile")}
        >
          <UserCircle2 size={38} />

          <div>
            <h4>{user?.name || "Security User"}</h4>
            <p>{user?.role || "Security Analyst"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;    