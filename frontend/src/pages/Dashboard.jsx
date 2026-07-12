import React from "react";
import "../styles/Dashboard.css";

function Dashboard() {
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Insider Threat Behavioral Intelligence System</h1>
                <div className="user-info">
                    <span>{name}</span>
                    <span className="role-badge">{role}</span>
                </div>
            </header>

            <div className="dashboard-body">
                <nav className="sidebar">
                    <ul>
                        <li>Dashboard</li>
                        {(role === "Administrator") && <li>User Management</li>}
                        {(role === "Administrator" || role === "Security Manager") && <li>Reports</li>}
                        {(role === "Administrator" || role === "Security Manager" || role === "SOC Engineer") && <li>Alerts</li>}
                        {role === "SOC Engineer" && <li>Incident Response</li>}
                        {role === "Security Analyst" && <li>My Investigations</li>}
                        {role === "Administrator" && <li>System Settings</li>}
                        <li>Profile</li>
                    </ul>
                </nav>

                <main className="dashboard-content">
                    <h2 className="panel-title">
                        {role === "Administrator" && "Administrator Control Panel"}
                        {role === "Security Manager" && "Security Manager Overview"}
                        {role === "SOC Engineer" && "SOC Operations Dashboard"}
                        {role === "Security Analyst" && "Security Analyst Workspace"}
                    </h2>
                    <p className="panel-subtitle">
                        System views custom-tailored to authorization clearance: <b>{role}</b>
                    </p>

                    {role === "Administrator" && <AdminOverview />}
                    {role === "Security Manager" && <ManagerOverview />}
                    {role === "SOC Engineer" && <SOCOverview />}
                    {role === "Security Analyst" && <AnalystOverview />}
                </main>
            </div>
        </div>
    );
}


function AdminOverview() {
    return (
        <>
            <div className="overview-cards">
                <div className="card">
                    <span>System Health</span>
                    <h2 className="green">99.9%</h2>
                </div>
                <div className="card">
                    <span>Total Users</span>
                    <h2>24</h2>
                </div>
                <div className="card">
                    <span>Active Sessions</span>
                    <h2>3</h2>
                </div>
                <div className="card">
                    <span>Database Status</span>
                    <h2 className="green">ONLINE</h2>
                </div>
            </div>

            <div className="panel-split">
                <div className="panel-box">
                    <h3>System Audit Logs</h3>
                    <table className="log-table">
                        <thead>
                            <tr><th>Time</th><th>Operator</th><th>Action</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>5:41:35 PM</td><td>admin_operator</td>
                                <td>Accessed Settings Panel</td>
                                <td><span className="badge success">SUCCESS</span></td>
                            </tr>
                            <tr>
                                <td>5:40:45 PM</td><td>sec_analyst</td>
                                <td>Generated Security Report</td>
                                <td><span className="badge success">SUCCESS</span></td>
                            </tr>
                            <tr>
                                <td>5:39:35 PM</td><td>soc_engineer</td>
                                <td>Triggered Log Ingestion</td>
                                <td><span className="badge success">SUCCESS</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="panel-box">
                    <h3>Quick Controls</h3>
                    <button className="control-btn primary">User Management</button>
                    <button className="control-btn secondary">System Personnel Directory</button>
                    <button className="control-btn secondary">Platform Analytics</button>
                </div>
            </div>
        </>
    );
}

function ManagerOverview() {
    return (
        <div className="overview-cards">
            <div className="card"><span>Organizational Risk</span><h2 className="amber">Medium</h2></div>
            <div className="card"><span>Open Insider Reports</span><h2>6</h2></div>
            <div className="card"><span>Compliance Score</span><h2 className="green">92%</h2></div>
            <div className="card"><span>Risk Trend (7d)</span><h2 className="red">↑ 4%</h2></div>
        </div>
    );
}

function SOCOverview() {
    return (
        <div className="overview-cards">
            <div className="card"><span>Live Alerts</span><h2 className="red">5</h2></div>
            <div className="card"><span>Behavioral Anomalies</span><h2>12</h2></div>
            <div className="card"><span>Active Investigations</span><h2>3</h2></div>
            <div className="card"><span>Threat Intel Feed</span><h2 className="green">Updated</h2></div>
        </div>
    );
}

function AnalystOverview() {
    return (
        <div className="overview-cards">
            <div className="card"><span>Assigned Alerts</span><h2>4</h2></div>
            <div className="card"><span>Insider Risk Scores</span><h2>Avg 38</h2></div>
            <div className="card"><span>Investigation Queue</span><h2>7</h2></div>
            <div className="card"><span>Incidents Closed (30d)</span><h2 className="green">15</h2></div>
        </div>
    );
}

export default Dashboard;