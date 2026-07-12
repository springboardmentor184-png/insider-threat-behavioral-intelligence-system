import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <aside className="sidebar">
            <h3>Menu</h3>

            <ul>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/profile">Employee Profile</Link></li>
                <li><Link to="/alerts">Threat Alerts</Link></li>
                <li><Link to="/users">Users</Link></li>
                <li><Link to="/reports">Reports</Link></li>
            </ul>
        </aside>
    );
}


export default Sidebar;