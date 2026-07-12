import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav className="navbar">
            <h2>Insider Threat Behavioral Intelligence System</h2>

            <ul className="nav-links">
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/alerts">Alerts</Link></li>
                <li><Link to="/users">Users</Link></li>
                <li><Link to="/reports">Reports</Link></li>
                <li><Link to="/login">Logout</Link></li>
            </ul>
        </nav>
    );
}


export default Navbar;