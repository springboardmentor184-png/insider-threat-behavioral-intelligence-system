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

const VALID_STATUSES = [
    "Open",
    "Investigating",
    "Resolved",
    "Closed",
];

function badgeClass(category) {
    if (category === "Critical" || category === "High") {
        return "danger";
    }

    if (category === "Medium") {
        return "warning";
    }

    return "success";
}

function Investigations() {
    const { user } = useAuth();
    const role = user?.role;

    const [incidents, setIncidents] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadIncidents = async () => {
        try {
            const res = await fetch(
                `${API_URL}/investigations/`,
                {
                    headers: authHeaders(),
                }
            );

            const data = await res.json();
            setIncidents(data);
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadIncidents();
    }, []);

    async function generateIncidents() {
        await fetch(
            `${API_URL}/investigations/generate-for-high-risk`,
            {
                method: "POST",
                headers: authHeaders(),
            }
        );

        loadIncidents();
    }

    async function changeStatus(id, newStatus) {
        await fetch(
            `${API_URL}/investigations/${id}/status?new_status=${encodeURIComponent(
                newStatus
            )}`,
            {
                method: "PUT",
                headers: authHeaders(),
            }
        );

        loadIncidents();
    }

    async function assignAnalyst(id) {
        const analyst = prompt("Enter Analyst Name");

        if (!analyst) {
            return;
        }

        await fetch(
            `${API_URL}/investigations/${id}/assign?analyst_name=${encodeURIComponent(
                analyst
            )}`,
            {
                method: "PUT",
                headers: authHeaders(),
            }
        );

        loadIncidents();
    }

    async function viewTimeline(id) {
        const res = await fetch(
            `${API_URL}/investigations/${id}/timeline`,
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();

        setSelectedIncident(id);
        setTimeline(data.timeline);
    }

    if (loading) {
        return <h2>Loading Investigations...</h2>;
    }

    return (
        <div className="dashboard-container">

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                }}
            >
                <h2>Threat Investigations</h2>

                {ANALYST_ROLES.includes(role) && (
                    <button onClick={generateIncidents}>
                        Generate High Risk Incidents
                    </button>
                )}
            </div>

            <table className="log-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Risk Score</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Assigned Analyst</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {incidents.length === 0 ? (
                        <tr>
                            <td
                                colSpan="8"
                                style={{ textAlign: "center" }}
                            >
                                No Incidents Found
                            </td>
                        </tr>
                    ) : (
                        incidents.map((incident) => (
                            <tr key={incident.id}>

                                <td>{incident.id}</td>

                                <td>{incident.employee_id}</td>

                                <td>
                                    {incident.risk_score_at_creation}
                                </td>

                                <td>
                                    <span
                                        className={`badge ${badgeClass(
                                            incident.risk_category
                                        )}`}
                                    >
                                        {incident.risk_category}
                                    </span>
                                </td>

                                <td>{incident.status}</td>

                                <td>
                                    {incident.assigned_analyst ||
                                        "Not Assigned"}
                                </td>

                                <td>
                                    {new Date(
                                        incident.created_at
                                    ).toLocaleString()}
                                </td>

                                <td
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            viewTimeline(incident.id)
                                        }
                                    >
                                        Timeline
                                    </button>

                                    {ASSIGN_ROLES.includes(role) && (
                                        <button
                                            onClick={() =>
                                                assignAnalyst(incident.id)
                                            }
                                        >
                                            Assign
                                        </button>
                                    )}

                                    {ANALYST_ROLES.includes(role) && (
                                        <select
                                            defaultValue=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    changeStatus(
                                                        incident.id,
                                                        e.target.value
                                                    );

                                                    e.target.value = "";
                                                }
                                            }}
                                        >
                                            <option
                                                value=""
                                                disabled
                                            >
                                                Update Status
                                            </option>

                                            {VALID_STATUSES.map(
                                                (status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {selectedIncident && (
                <div style={{ marginTop: "40px" }}>

                    <h3>
                        Timeline - Incident #{selectedIncident}
                    </h3>

                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Activity</th>
                                <th>Device</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>

                        <tbody>
                            {timeline.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="4"
                                        style={{
                                            textAlign: "center",
                                        }}
                                    >
                                        No Timeline Available
                                    </td>
                                </tr>
                            ) : (
                                timeline.map((event, index) => (
                                    <tr key={index}>
                                        <td>
                                            {new Date(
                                                event.timestamp
                                            ).toLocaleString()}
                                        </td>

                                        <td>{event.activity}</td>

                                        <td>{event.device}</td>

                                        <td>{event.ip_address}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}

export default Investigations;