import React from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isAdmin = user?.role === "Administrator";

    const isAnalystRole =
        user &&
        [
            "Administrator",
            "Security Manager",
            "SOC Engineer",
            "Security Analyst",
        ].includes(user.role);

    return (
        <nav className="navbar">
            <div className="navbar-title">
                Insider Threat Behavioral Intelligence System
            </div>

            <ul className="nav-links">
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>

                <li>
                    <Link to="/profile">Profile</Link>
                </li>

                {isAnalystRole && (
                    <>
                        <li>
                            <Link to="/alerts">Alerts</Link>
                        </li>

                        <li>
                            <Link to="/employees">Employees</Link>
                        </li>

                        <li>
                            <Link to="/investigations">
                                Investigations
                            </Link>
                        </li>

                        <li>
                            <Link to="/ueba">UEBA</Link>
                        </li>

                        <li>
                            <Link to="/risk">Risk</Link>
                        </li>

                        <li>
                            <Link to="/activity">Activity</Link>
                        </li>

                        <li>
                            <Link to="/reports">Reports</Link>
                        </li>
                    </>
                )}

                <li>
                    <Link to="/notifications">
                        Notifications
                    </Link>
                </li>

                {isAdmin && (
                    <li>
                        <Link to="/users">Users</Link>
                    </li>
                )}

                <li>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;