import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../services/api";
import { fetchAnomalies } from "../services/behaviorservice";
import "../styles/Dashboard.css";
import RiskDistributionChart from "./RiskDistributionChart.jsx";

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
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li><Link to="/employees">Employees</Link></li>
                        {role === "Administrator" && (
                            <li><Link to="/users">User Management</Link></li>
                        )}
                        {(role === "Administrator" || role === "Security Manager") && (
                            <li><Link to="/reports">Reports</Link></li>
                        )}
                        {(role === "Administrator" ||
                            role === "Security Manager" ||
                            role === "SOC Engineer" ||
                            role === "Security Analyst") && (
                                <li><Link to="/alerts">Alerts</Link></li>
                            )}
                        <li><Link to="/profile">Profile</Link></li>
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
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/dashboard`)
            .then((res) => {
                if (!res.ok) throw new Error(`Status ${res.status}`);
                return res.json();
            })
            .then((data) => setStats(data))
            .catch((err) => {
                console.error("Dashboard fetch failed:", err);
                setError(err.message);
            });
    }, []);

    if (error) {
        return <p style={{ color: "red" }}>Failed to load dashboard data: {error}</p>;
    }

    if (!stats) {
        return <p>Loading dashboard...</p>;
    }

    return (
        <>
            <div className="overview-cards">
                <div className="card">
                    <span>Total Users</span>
                    <h2>{stats.total_users}</h2>
                </div>
                <div className="card">
                    <span>High Risk Users</span>
                    <h2 className="red">{stats.high_risk_users}</h2>
                </div>
                <div className="card">
                    <span>Low Risk Users</span>
                    <h2 className="green">{stats.low_risk_users}</h2>
                </div>
                <div className="card">
                    <span>System Status</span>
                    <h2 className="green">{stats.system_status}</h2>
                </div>
            </div>
            <div style={{ marginTop: "30px" }}>
                <h3>Risk Distribution</h3>
                <RiskDistributionChart />
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
            <div className="card"><span>Risk Trend (7d)</span><h2 className="red">4%</h2></div>
        </div>
    );
}

function SOCOverview() {
    const [anomalies, setAnomalies] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnomalies()
            .then((data) => setAnomalies(data))
            .catch((err) => {
                console.error("Anomalies fetch failed:", err);
                setError(err.message);
            });
    }, []);

    if (error) {
        return <p style={{ color: "red" }}>Failed to load SOC data: {error}</p>;
    }

    if (!anomalies) {
        return <p>Loading SOC data...</p>;
    }

    const highRiskCount = anomalies.filter(
        (a) => a.severity === "High" || a.severity === "Critical"
    ).length;

    return (
        <div className="overview-cards">
            <div className="card"><span>Live Alerts</span><h2 className="red">{highRiskCount}</h2></div>
            <div className="card"><span>Behavioral Anomalies</span><h2>{anomalies.length}</h2></div>
            <div className="card"><span>Active Investigations</span><h2>3</h2></div>
            <div className="card"><span>Threat Intel Feed</span><h2 className="green">Updated</h2></div>
        </div>
    );
}

function AnalystOverview() {
    const [anomalies, setAnomalies] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnomalies()
            .then((data) => setAnomalies(data))
            .catch((err) => {
                console.error("Anomalies fetch failed:", err);
                setError(err.message);
            });
    }, []);

    if (error) {
        return <p style={{ color: "red" }}>Failed to load analyst data: {error}</p>;
    }

    if (!anomalies) {
        return <p>Loading analyst data...</p>;
    }

    const avgRisk = anomalies.length
        ? (anomalies.reduce((sum, a) => sum + a.risk_score, 0) / anomalies.length).toFixed(1)
        : 0;

    const assignedAlerts = anomalies.filter(
        (a) => a.severity === "High" || a.severity === "Critical"
    ).length;

    return (
        <div className="overview-cards">
            <div className="card"><span>Assigned Alerts</span><h2>{assignedAlerts}</h2></div>
            <div className="card"><span>Insider Risk Scores</span><h2>Avg {avgRisk}</h2></div>
            <div className="card"><span>Investigation Queue</span><h2>7</h2></div>
            <div className="card"><span>Incidents Closed (30d)</span><h2 className="green">15</h2></div>
        </div>
    );
}

export default Dashboard;