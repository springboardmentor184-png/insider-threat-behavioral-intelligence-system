import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
import "../styles/Dashboard.css";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

const ANALYST_ROLES = [
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst",
];

const ASSIGN_ROLES = [
    "Administrator",
    "Security Manager",
];

function badgeClass(severity) {
    if (severity === "Critical" || severity === "High") {
        return "danger";
    }

    if (severity === "Medium") {
        return "warning";
    }

    return "success";
}

function Alerts() {
    const { user } = useAuth();
    const role = user?.role;

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [severityFilter, setSeverityFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const loadAlerts = async () => {
        try {
            const res = await fetch(`${API_URL}/alerts/`, {
                headers: authHeaders(),
            });

            const data = await res.json();

            setAlerts(data);
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadAlerts();
    }, []);

    async function generateAlerts() {
        await fetch(`${API_URL}/alerts/generate`, {
            method: "POST",
            headers: authHeaders(),
        });

        loadAlerts();
    }

    async function escalateAlert(id) {
        await fetch(`${API_URL}/alerts/${id}/escalate`, {
            method: "PUT",
            headers: authHeaders(),
        });

        loadAlerts();
    }

    async function resolveAlert(id) {
        const notes =
            prompt("Resolution notes (optional):") || "";

        await fetch(
            `${API_URL}/alerts/${id}/resolve?resolution_notes=${encodeURIComponent(
                notes
            )}`,
            {
                method: "PUT",
                headers: authHeaders(),
            }
        );

        loadAlerts();
    }

    async function createIncident(id) {
        await fetch(`${API_URL}/alerts/${id}/create-incident`, {
            method: "POST",
            headers: authHeaders(),
        });

        alert("Incident Created");

        loadAlerts();
    }

    async function assignAnalyst(id) {
        const analyst = prompt("Enter Analyst Name");

        if (!analyst) {
            return;
        }

        await fetch(
            `${API_URL}/alerts/${id}/assign?analyst_name=${encodeURIComponent(
                analyst
            )}`,
            {
                method: "PUT",
                headers: authHeaders(),
            }
        );

        loadAlerts();
    }

    if (loading) {
        return <h2>Loading Alerts...</h2>;
    }

    // Summary counts by severity
    const severityCounts = alerts.reduce((acc, alert) => {
        acc[alert.severity] =
            (acc[alert.severity] || 0) + 1;

        return acc;
    }, {});

    // Apply severity and status filters
    const filteredAlerts = alerts.filter((alert) => {
        const severityMatch =
            severityFilter === "All" ||
            alert.severity === severityFilter;

        const statusMatch =
            statusFilter === "All" ||
            alert.status === statusFilter;

        return severityMatch && statusMatch;
    });

    return (
        <div className="dashboard-container">

            {/* Page Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                }}
            >
                <h2>Threat Alerts</h2>

                {ANALYST_ROLES.includes(role) && (
                    <button onClick={generateAlerts}>
                        Generate Alerts
                    </button>
                )}
            </div>

            {/* Severity Summary Cards */}
            <div
                className="overview-cards"
                style={{ marginBottom: "20px" }}
            >
                {[
                    "Informational",
                    "Low",
                    "Medium",
                    "High",
                    "Critical",
                ].map((severity) => (
                    <div
                        className="card"
                        key={severity}
                    >
                        <span>{severity}</span>

                        <h2
                            className={
                                badgeClass(severity) ===
                                "danger"
                                    ? "red"
                                    : ""
                            }
                        >
                            {severityCounts[severity] || 0}
                        </h2>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div
                style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "16px",
                }}
            >
                <select
                    value={severityFilter}
                    onChange={(e) =>
                        setSeverityFilter(e.target.value)
                    }
                >
                    <option value="All">
                        All Severities
                    </option>

                    <option value="Informational">
                        Informational
                    </option>

                    <option value="Low">
                        Low
                    </option>

                    <option value="Medium">
                        Medium
                    </option>

                    <option value="High">
                        High
                    </option>

                    <option value="Critical">
                        Critical
                    </option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >
                    <option value="All">
                        All Statuses
                    </option>

                    <option value="Open">
                        Open
                    </option>

                    <option value="Investigating">
                        Investigating
                    </option>

                    <option value="Escalated">
                        Escalated
                    </option>

                    <option value="Resolved">
                        Resolved
                    </option>
                </select>
            </div>

            {/* Alerts Table */}
            <table className="log-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Description</th>
                        <th>Analyst</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredAlerts.length === 0 ? (
                        <tr>
                            <td
                                colSpan="7"
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                No Alerts Found
                            </td>
                        </tr>
                    ) : (
                        filteredAlerts.map((alert) => (
                            <tr key={alert.id}>
                                <td>{alert.id}</td>

                                <td>
                                    {alert.employee}
                                </td>

                                <td>
                                    <span
                                        className={`badge ${badgeClass(
                                            alert.severity
                                        )}`}
                                    >
                                        {alert.severity}
                                    </span>
                                </td>

                                <td>{alert.status}</td>

                                <td>
                                    {alert.description}
                                </td>

                                <td>
                                    {alert.assigned_analyst ||
                                        "Not Assigned"}
                                </td>

                                <td
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {/* Assign Analyst */}
                                    {ASSIGN_ROLES.includes(role) && (
                                        <button
                                            onClick={() =>
                                                assignAnalyst(
                                                    alert.id
                                                )
                                            }
                                        >
                                            Assign
                                        </button>
                                    )}

                                    {/* Analyst Actions */}
                                    {ANALYST_ROLES.includes(role) && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    escalateAlert(
                                                        alert.id
                                                    )
                                                }
                                            >
                                                Escalate
                                            </button>

                                            <button
                                                onClick={() =>
                                                    createIncident(
                                                        alert.id
                                                    )
                                                }
                                            >
                                                Incident
                                            </button>

                                            <button
                                                onClick={() =>
                                                    resolveAlert(
                                                        alert.id
                                                    )
                                                }
                                            >
                                                Resolve
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Alerts;