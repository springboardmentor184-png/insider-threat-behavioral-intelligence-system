import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
import {
    C,
    Pill,
    Panel,
    Btn,
    Select,
    thStyle,
    tdStyle,
} from "../assets/components/AppLayout";

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

const sevColor = (s) =>
    ({
        Critical: C.accent,
        High: C.amber,
        Medium: C.blue,
        Low: C.green,
        Informational: C.teal,
    }[s] || C.muted);

export default function Alerts() {
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

            setAlerts(await res.json());
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
        await fetch(
            `${API_URL}/alerts/${id}/create-incident`,
            {
                method: "POST",
                headers: authHeaders(),
            }
        );

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
        return (
            <p style={{ color: C.dim }}>
                Loading Alerts...
            </p>
        );
    }

    const severityCounts = alerts.reduce(
        (acc, a) => {
            acc[a.severity] =
                (acc[a.severity] || 0) + 1;

            return acc;
        },
        {}
    );

    const filtered = alerts.filter(
        (a) =>
            (severityFilter === "All" ||
                a.severity === severityFilter) &&
            (statusFilter === "All" ||
                a.status === statusFilter)
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        color: C.txt,
                        fontWeight: 800,
                        fontSize: 18,
                    }}
                >
                    Threat Alerts{" "}
                    <span
                        style={{
                            color: C.dim,
                            fontWeight: 400,
                            fontSize: 12,
                        }}
                    >
                        (alerts.py)
                    </span>
                </div>

                {ANALYST_ROLES.includes(role) && (
                    <Btn
                        variant="primary"
                        onClick={generateAlerts}
                    >
                        Generate Alerts
                    </Btn>
                )}
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(5, 1fr)",
                    gap: 12,
                }}
            >
                {[
                    "Informational",
                    "Low",
                    "Medium",
                    "High",
                    "Critical",
                ].map((sev) => (
                    <div
                        key={sev}
                        style={{
                            background: C.card,
                            border: `1px solid ${C.border}`,
                            borderRadius: 10,
                            padding: "14px 16px",
                        }}
                    >
                        <div
                            style={{
                                color: C.dim,
                                fontSize: 10,
                                textTransform:
                                    "uppercase",
                                marginBottom: 5,
                            }}
                        >
                            {sev}
                        </div>

                        <div
                            style={{
                                color: sevColor(sev),
                                fontSize: 24,
                                fontWeight: 800,
                            }}
                        >
                            {severityCounts[sev] || 0}
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "flex",
                    gap: 10,
                }}
            >
                <Select
                    value={severityFilter}
                    onChange={(e) =>
                        setSeverityFilter(
                            e.target.value
                        )
                    }
                >
                    <option value="All">
                        All Severities
                    </option>
                    <option>
                        Informational
                    </option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                </Select>

                <Select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >
                    <option value="All">
                        All Statuses
                    </option>
                    <option>Open</option>
                    <option>Investigating</option>
                    <option>Escalated</option>
                    <option>Resolved</option>
                </Select>
            </div>

            <Panel>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={thStyle}>
                                ID
                            </th>

                            <th style={thStyle}>
                                Employee
                            </th>

                            <th style={thStyle}>
                                Severity
                            </th>

                            <th style={thStyle}>
                                Status
                            </th>

                            <th style={thStyle}>
                                Description
                            </th>

                            <th style={thStyle}>
                                Analyst
                            </th>

                            <th style={thStyle}>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td
                                    style={tdStyle}
                                    colSpan={7}
                                >
                                    No Alerts Found
                                </td>
                            </tr>
                        ) : (
                            filtered.map((a) => (
                                <tr
                                    key={a.id}
                                    style={{
                                        borderLeft: `3px solid ${sevColor(
                                            a.severity
                                        )}`,
                                    }}
                                >
                                    <td style={tdStyle}>
                                        {a.id}
                                    </td>

                                    <td style={tdStyle}>
                                        {a.employee}
                                    </td>

                                    <td style={tdStyle}>
                                        <Pill
                                            label={
                                                a.severity
                                            }
                                            color={sevColor(
                                                a.severity
                                            )}
                                        />
                                    </td>

                                    <td style={tdStyle}>
                                        {a.status}
                                    </td>

                                    <td style={tdStyle}>
                                        {a.description}
                                    </td>

                                    <td style={tdStyle}>
                                        {a.assigned_analyst ||
                                            "Not Assigned"}
                                    </td>

                                    <td style={tdStyle}>
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap: 6,
                                                flexWrap:
                                                    "wrap",
                                            }}
                                        >
                                            {ASSIGN_ROLES.includes(
                                                role
                                            ) && (
                                                <Btn
                                                    onClick={() =>
                                                        assignAnalyst(
                                                            a.id
                                                        )
                                                    }
                                                >
                                                    Assign
                                                </Btn>
                                            )}

                                            {ANALYST_ROLES.includes(
                                                role
                                            ) && (
                                                <>
                                                    <Btn
                                                        onClick={() =>
                                                            escalateAlert(
                                                                a.id
                                                            )
                                                        }
                                                    >
                                                        Escalate
                                                    </Btn>

                                                    <Btn
                                                        onClick={() =>
                                                            createIncident(
                                                                a.id
                                                            )
                                                        }
                                                    >
                                                        Incident
                                                    </Btn>

                                                    <Btn
                                                        variant="primary"
                                                        onClick={() =>
                                                            resolveAlert(
                                                                a.id
                                                            )
                                                        }
                                                    >
                                                        Resolve
                                                    </Btn>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Panel>
        </div>
    );
}