import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
import "../styles/Dashboard.css";
import RiskDistributionChart from "./RiskDistributionChart.jsx";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
    };
}

const ANALYST_ROLES = [
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst",
];

function Dashboard() {
    const { user } = useAuth();

    const role = user?.role;
    const name = user?.name;

    return (
        <div className="dashboard-container">

            {/* ================= HEADER ================= */}

            <header className="dashboard-header">

                <h1>
                    Insider Threat Behavioral Intelligence System
                </h1>

                <div className="user-info">
                    <span>{name}</span>

                    <span className="role-badge">
                        {role}
                    </span>
                </div>

            </header>


            {/* ================= DASHBOARD BODY ================= */}

            <div className="dashboard-body">

                {/* ================= SIDEBAR ================= */}

                <nav className="sidebar">

                    <ul>

                        <li>
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>

                        <li>
                            <Link to="/employees">
                                Employees
                            </Link>
                        </li>

                        <li>
                            <Link to="/notifications">
                                Notification
                            </Link>
                        </li>

                        <li>
                            <Link to="/investigations">
                                Investigations
                            </Link>
                        </li>

                        <li>
                            <Link to="/ueba">
                                UEBA Analytics
                            </Link>
                        </li>

                        <li>
                            <Link to="/risk">
                                Risk Analysis
                            </Link>
                        </li>

                        <li>
                            <Link to="/activity">
                                Activity Logs
                            </Link>
                        </li>

                        {/* Administrator only */}

                        {role === "Administrator" && (
                            <li>
                                <Link to="/users">
                                    User Management
                                </Link>
                            </li>
                        )}

                        {/* Analyst-level roles */}

                        {ANALYST_ROLES.includes(role) && (
                            <li>
                                <Link to="/reports">
                                    Reports
                                </Link>
                            </li>
                        )}

                        {ANALYST_ROLES.includes(role) && (
                            <li>
                                <Link to="/alerts">
                                    Alerts
                                </Link>
                            </li>
                        )}

                        <li>
                            <Link to="/profile">
                                Profile
                            </Link>
                        </li>

                    </ul>

                </nav>


                {/* ================= MAIN CONTENT ================= */}

                <main className="dashboard-content">

                    <h2 className="panel-title">

                        {role === "Administrator" &&
                            "Administrator Control Panel"}

                        {role === "Security Manager" &&
                            "Security Manager Overview"}

                        {role === "SOC Engineer" &&
                            "SOC Operations Dashboard"}

                        {role === "Security Analyst" &&
                            "Security Analyst Workspace"}

                    </h2>


                    <p className="panel-subtitle">
                        System views custom-tailored to authorization
                        clearance: <b>{role}</b>
                    </p>


                    {/* ROLE-SPECIFIC DASHBOARDS */}

                    {role === "Administrator" && (
                        <AdminOverview />
                    )}

                    {role === "Security Manager" && (
                        <ManagerOverview />
                    )}

                    {role === "SOC Engineer" && (
                        <SOCOverview />
                    )}

                    {role === "Security Analyst" && (
                        <AnalystOverview />
                    )}

                </main>

            </div>

        </div>
    );
}


/* =========================================================
   DASHBOARD DATA HOOK
========================================================= */

function useDashboardData(endpoint) {

    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {

        fetch(`${API_URL}${endpoint}`, {
            headers: authHeaders(),
        })

            .then((res) => {

                if (!res.ok) {
                    throw new Error(`Status ${res.status}`);
                }

                return res.json();
            })

            .then((data) => {
                setStats(data);
            })

            .catch((err) => {
                setError(err.message);
            });

    }, [endpoint]);

    return {
        stats,
        error,
    };
}


/* =========================================================
   ADMINISTRATOR OVERVIEW
========================================================= */

function AdminOverview() {

    const {
        stats,
        error,
    } = useDashboardData("/dashboard/admin-summary");


    if (error) {
        return (
            <p style={{ color: "red" }}>
                Failed to load dashboard data: {error}
            </p>
        );
    }


    if (!stats) {
        return (
            <p>
                Loading dashboard...
            </p>
        );
    }


    return (
        <>

            {/* ================= DASHBOARD CARDS ================= */}

            <div className="overview-cards">

                <div className="card">

                    <span>
                        Total Users
                    </span>

                    <h2>
                        {stats.user_management.total_users}
                    </h2>

                </div>


                <div className="card">

                    <span>
                        Active Users
                    </span>

                    <h2 className="green">
                        {stats.user_management.active_users}
                    </h2>

                </div>


                <div className="card">

                    <span>
                        Employee Profiles
                    </span>

                    <h2>
                        {
                            stats.platform_analytics
                                .total_employee_profiles
                        }
                    </h2>

                </div>


                <div className="card">

                    <span>
                        System Status
                    </span>

                    <h2 className="green">
                        {stats.system_monitoring.api_status}
                    </h2>

                </div>

            </div>


            {/* ================= RISK DISTRIBUTION ================= */}

            <div style={{ marginTop: "30px" }}>

                <h3>
                    Risk Distribution
                </h3>

                <RiskDistributionChart />

            </div>


            {/* ================= RECENT ALERTS ================= */}

            <div style={{ marginTop: "35px" }}>

                <h3>
                    Recent Alerts
                </h3>


                <table className="log-table">

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Severity</th>
                            <th>Status</th>
                        </tr>

                    </thead>


                    <tbody>

                        {stats.recent_alerts?.map((alert) => (

                            <tr key={alert.id}>

                                <td>
                                    {alert.id}
                                </td>

                                <td>
                                    {alert.employee}
                                </td>

                                <td>
                                    {alert.severity}
                                </td>

                                <td>
                                    {alert.status}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>


            {/* ================= RECENT NOTIFICATIONS ================= */}

            <div style={{ marginTop: "35px" }}>

                <h3>
                    Recent Notifications
                </h3>


                <table className="log-table">

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Severity</th>
                            <th>Read</th>
                        </tr>

                    </thead>


                    <tbody>

                        {stats.recent_notifications?.map(
                            (notification) => (

                                <tr key={notification.id}>

                                    <td>
                                        {notification.id}
                                    </td>

                                    <td>
                                        {notification.title}
                                    </td>

                                    <td>
                                        {notification.severity}
                                    </td>

                                    <td>
                                        {notification.is_read
                                            ? "Yes"
                                            : "No"}
                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>


            {/* ================= RECENT INCIDENTS ================= */}

            <div style={{ marginTop: "35px" }}>

                <h3>
                    Recent Incidents
                </h3>


                <table className="log-table">

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Employee</th>
                            <th>Risk</th>
                            <th>Status</th>
                        </tr>

                    </thead>


                    <tbody>

                        {stats.recent_incidents?.map(
                            (incident) => (

                                <tr key={incident.id}>

                                    <td>
                                        {incident.id}
                                    </td>

                                    <td>
                                        {incident.employee_id}
                                    </td>

                                    <td>
                                        {incident.risk_category}
                                    </td>

                                    <td>
                                        {incident.status}
                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>


            {/* ================= HIGH RISK EMPLOYEES ================= */}

            <div style={{ marginTop: "35px" }}>

                <h3>
                    Top High Risk Employees
                </h3>


                <table className="log-table">

                    <thead>

                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Risk Score</th>
                        </tr>

                    </thead>


                    <tbody>

                        {stats.high_risk_employees?.map(
                            (employee) => (

                                <tr key={employee.employee_id}>

                                    <td>
                                        {employee.employee_id}
                                    </td>

                                    <td>
                                        {employee.department}
                                    </td>

                                    <td>
                                        {employee.risk_score}
                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>

        </>
    );
}


/* =========================================================
   SECURITY MANAGER OVERVIEW
========================================================= */

function ManagerOverview() {

    const {
        stats,
        error,
    } = useDashboardData("/dashboard/manager-summary");


    if (error) {
        return (
            <p style={{ color: "red" }}>
                Failed to load manager data: {error}
            </p>
        );
    }


    if (!stats) {
        return (
            <p>
                Loading manager data...
            </p>
        );
    }


    return (
        <>

            <div className="overview-cards">

                <div className="card">

                    <span>
                        Organizational Avg Risk
                    </span>

                    <h2 className="amber">
                        {stats.organizational_avg_risk_score}
                    </h2>

                </div>


                <div className="card">

                    <span>
                        Open Incidents
                    </span>

                    <h2>
                        {stats.compliance_metrics.open_incidents}
                    </h2>

                </div>


                <div className="card">

                    <span>
                        Resolution Rate
                    </span>

                    <h2 className="green">
                        {
                            stats.compliance_metrics
                                .resolution_rate_percent
                        }%
                    </h2>

                </div>


                <div className="card">

                    <span>
                        Total Employees
                    </span>

                    <h2>
                        {stats.total_employees}
                    </h2>

                </div>

            </div>


            <div style={{ marginTop: "30px" }}>

                <h3>
                    Risk Distribution
                </h3>

                <RiskDistributionChart />

            </div>

        </>
    );
}


/* =========================================================
   SOC ENGINEER OVERVIEW
========================================================= */

function SOCOverview() {

    const {
        stats,
        error,
    } = useDashboardData("/dashboard/soc-summary");


    if (error) {
        return (
            <p style={{ color: "red" }}>
                Failed to load SOC data: {error}
            </p>
        );
    }


    if (!stats) {
        return (
            <p>
                Loading SOC data...
            </p>
        );
    }


    return (

        <div className="overview-cards">

            <div className="card">

                <span>
                    Total Security Events
                </span>

                <h2>
                    {stats.total_security_events}
                </h2>

            </div>


            <div className="card">

                <span>
                    Behavioral Anomalies
                </span>

                <h2 className="red">
                    {stats.behavioral_anomalies_flagged}
                </h2>

            </div>


            <div className="card">

                <span>
                    Active Investigations
                </span>

                <h2>
                    {stats.active_investigations.count}
                </h2>

            </div>


            <div className="card">

                <span>
                    Threat Intel Feed
                </span>

                <h2 className="green">
                    Updated
                </h2>

            </div>

        </div>

    );
}


/* =========================================================
   SECURITY ANALYST OVERVIEW
========================================================= */

function AnalystOverview() {

    const {
        stats,
        error,
    } = useDashboardData("/dashboard/analyst-summary");


    if (error) {
        return (
            <p style={{ color: "red" }}>
                Failed to load analyst data: {error}
            </p>
        );
    }


    if (!stats) {
        return (
            <p>
                Loading analyst data...
            </p>
        );
    }


    return (

        <div className="overview-cards">

            <div className="card">

                <span>
                    Open Incidents
                </span>

                <h2>
                    {stats.investigation_queue.open_incidents}
                </h2>

            </div>


            <div className="card">

                <span>
                    Total Alerts
                </span>

                <h2>
                    {stats.total_alerts}
                </h2>

            </div>


            <div className="card">

                <span>
                    High Risk Employees
                </span>

                <h2 className="red">

                    {
                        stats.risk_distribution.High +
                        stats.risk_distribution.Critical
                    }

                </h2>

            </div>


            <div className="card">

                <span>
                    Total Employees Monitored
                </span>

                <h2>
                    {stats.total_employees_monitored}
                </h2>

            </div>

        </div>

    );
}


export default Dashboard;