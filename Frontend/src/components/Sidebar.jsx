import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  getCurrentUser,
  clearAuthData,
} from "../services/authService";


function Sidebar() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // =====================================================
  // Load Current User
  // =====================================================

  useEffect(() => {

    loadUser();

  }, []);


  const loadUser = async () => {

    try {

      const response = await getCurrentUser();

      setUser(response.data);

      // Keep user information available
      // to other components

      localStorage.setItem(
        "current_user",
        JSON.stringify(response.data)
      );

      localStorage.setItem(
        "user_role",
        response.data.role
      );

    } catch (error) {

      console.error(
        "Failed to load current user:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // Logout
  // =====================================================

  const handleLogout = () => {

    clearAuthData();

    navigate("/login");

  };


  // =====================================================
  // Role
  // =====================================================

  const role = user?.role || "";

  const isAdministrator =
    role === "Administrator";


  // =====================================================
  // Navigation Link Component
  // =====================================================

  const MenuLink = ({
    to,
    icon,
    children,
  }) => {

    return (

      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? "nav-link active"
            : "nav-link"
        }
      >

        <i className={icon}></i>

        <span>
          {children}
        </span>

      </NavLink>

    );

  };


  return (

    <aside className="sidebar">


      {/* =================================================
          Logo
      ================================================= */}

      <div className="sidebar-logo">

        <div className="logo-icon">

          <i className="bi bi-shield-lock-fill"></i>

        </div>


        <div>

          <h4>
            AI Insider
          </h4>

          <p>
            Threat Intelligence
          </p>

        </div>

      </div>


      {/* =================================================
          User Role
      ================================================= */}

      {!loading && user && (

        <div className="px-3 mb-3">

          <div
            className="small text-muted"
            style={{
              fontSize: "12px"
            }}
          >
            Logged in as
          </div>

          <strong
            style={{
              fontSize: "13px"
            }}
          >
            {user.role}
          </strong>

        </div>

      )}


      {/* =================================================
          Navigation
      ================================================= */}

      <nav className="sidebar-menu">


        {/* Dashboard */}

        <MenuLink
          to="/dashboard"
          icon="bi bi-grid-fill"
        >
          Dashboard
        </MenuLink>


        {/* Employees */}

        <MenuLink
          to="/employees"
          icon="bi bi-people-fill"
        >
          Employees
        </MenuLink>


        {/* UEBA Intelligence */}

        <MenuLink
          to="/analytics"
          icon="bi bi-bar-chart-fill"
        >
          UEBA Intelligence
        </MenuLink>


        {/* Threat Investigation */}

        <MenuLink
          to="/investigation"
          icon="bi bi-binoculars-fill"
        >
          Threat Investigation
        </MenuLink>


        {/* Activity Logs */}

        <MenuLink
          to="/activitylogs"
          icon="bi bi-clock-history"
        >
          Activity Logs
        </MenuLink>


        {/* Threat Alerts */}

        <MenuLink
          to="/threatalerts"
          icon="bi bi-shield-exclamation"
        >
          Threat Alerts
        </MenuLink>


        {/* AI Prediction */}

        <MenuLink
          to="/prediction"
          icon="bi bi-cpu-fill"
        >
          AI Prediction
        </MenuLink>


        {/* Reports & Export */}

        <MenuLink
          to="/reports"
          icon="bi bi-file-earmark-bar-graph-fill"
        >
          Reports & Export
        </MenuLink>


        {/* =================================================
            User Management
            Administrator Only
        ================================================= */}

        {isAdministrator && (

          <MenuLink
            to="/users"
            icon="bi bi-person-gear"
          >
            User Management
          </MenuLink>

        )}


        {/* =================================================
            Settings
            Administrator Only
        ================================================= */}

        {isAdministrator && (

          <MenuLink
            to="/settings"
            icon="bi bi-gear-fill"
          >
            Settings
          </MenuLink>

        )}

      </nav>


      {/* =================================================
          Logout
      ================================================= */}

      <div className="sidebar-footer">

        <button
          className="logout-btn"
          onClick={handleLogout}
        >

          <i className="bi bi-box-arrow-right"></i>

          <span>
            Logout
          </span>

        </button>

      </div>

    </aside>

  );

}


export default Sidebar;