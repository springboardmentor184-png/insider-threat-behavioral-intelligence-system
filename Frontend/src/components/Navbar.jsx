import { useState } from "react";

function Navbar() {

  const [search, setSearch] = useState("");

  return (
    <nav className="navbar">

      {/* Left Section */}

      <div className="navbar-left">

        <h3>Dashboard</h3>

        <p>Welcome back, Darshan 👋</p>

      </div>

      {/* Right Section */}

      <div className="navbar-right">

        {/* Search */}

        <div className="search-box">

          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* Notification */}

        <div className="icon-box">

          <i className="bi bi-bell-fill"></i>

        </div>

        {/* User */}

        <div className="profile-box">

          <div className="profile-image">

            <i className="bi bi-person-fill"></i>

          </div>

          <div>

            <h6>Darshan</h6>

            <small>Administrator</small>

          </div>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;