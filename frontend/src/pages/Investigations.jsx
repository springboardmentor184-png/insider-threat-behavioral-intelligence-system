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

const VALID_STATUSES = [
    "Open",
    "Investigating",
    "Resolved",
    "Closed",
];

const catColor = (c) =>
    ({
        Critical: C.accent,
        High: C.amber,
        Medium: C.blue,
        Low: C.green,
    }[c] || C.muted);

export default function Investigations() {
    const { user } = useAuth();
    const role = user?.role;

    const [incidents, setIncidents] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadIncidents = async () => {
        try {
            const res = await fetch(
                `${API_URL}/investigations/`,
                {
                    headers: authHeaders(),
                }
            );

            setIncidents(await res.json());
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

        setSelected(id);
        setTimeline(data.timeline);
    }

    if (loading) {
        return (
            <p style={{ color: C.dim }}>
                Loading Investigations...
            </p>
        );
    }

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
                    Threat Investigations{" "}
                    <span
                        style={{
                            color: C.dim,
                            fontWeight: 400,
                            fontSize: 12,
                        }}
                    >
                        (investigations.py)
                    </span>
                </div>

                {ANALYST_ROLES.includes(role) && (
                    <Btn
                        variant="primary"
                        onClick={generateIncidents}
                    >
                        Generate High Risk Incidents
                    </Btn>
                )}
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
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Employee</th>
                            <th style={thStyle}>Risk</th>
                            <th style={thStyle}>Category</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Analyst</th>
                            <th style={thStyle}>Created</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {incidents.length === 0 ? (
                            <tr>
                                <td
                                    style={tdStyle}
                                    colSpan={8}
                                >
                                    No Incidents Found
                                </td>
                            </tr>
                        ) : (
                            incidents.map((i) => (
                                <tr key={i.id}>
                                    <td style={tdStyle}>
                                        {i.id}
                                    </td>

                                    <td style={tdStyle}>
                                        {i.employee_id}
                                    </td>

                                    <td style={tdStyle}>
                                        {
                                            i.risk_score_at_creation
                                        }
                                    </td>

                                    <td style={tdStyle}>
                                        <Pill
                                            label={
                                                i.risk_category
                                            }
                                            color={catColor(
                                                i.risk_category
                                            )}
                                        />
                                    </td>

                                    <td style={tdStyle}>
                                        {i.status}
                                    </td>

                                    <td style={tdStyle}>
                                        {i.assigned_analyst ||
                                            "Not Assigned"}
                                    </td>

                                    <td style={tdStyle}>
                                        {new Date(
                                            i.created_at
                                        ).toLocaleString()}
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
                                            <Btn
                                                onClick={() =>
                                                    viewTimeline(
                                                        i.id
                                                    )
                                                }
                                            >
                                                Timeline
                                            </Btn>

                                            {ASSIGN_ROLES.includes(
                                                role
                                            ) && (
                                                <Btn
                                                    onClick={() =>
                                                        assignAnalyst(
                                                            i.id
                                                        )
                                                    }
                                                >
                                                    Assign
                                                </Btn>
                                            )}

                                            {ANALYST_ROLES.includes(
                                                role
                                            ) && (
                                                <Select
                                                    defaultValue=""
                                                    onChange={(
                                                        e
                                                    ) => {
                                                        if (
                                                            e
                                                                .target
                                                                .value
                                                        ) {
                                                            changeStatus(
                                                                i.id,
                                                                e
                                                                    .target
                                                                    .value
                                                            );

                                                            e.target.value =
                                                                "";
                                                        }
                                                    }}
                                                >
                                                    <option
                                                        value=""
                                                        disabled
                                                    >
                                                        Status
                                                    </option>

                                                    {VALID_STATUSES.map(
                                                        (s) => (
                                                            <option
                                                                key={
                                                                    s
                                                                }
                                                                value={
                                                                    s
                                                                }
                                                            >
                                                                {s}
                                                            </option>
                                                        )
                                                    )}
                                                </Select>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Panel>

            {selected && (
                <Panel
                    title={`Timeline — Incident #${selected}`}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={thStyle}>
                                    Timestamp
                                </th>

                                <th style={thStyle}>
                                    Activity
                                </th>

                                <th style={thStyle}>
                                    Device
                                </th>

                                <th style={thStyle}>
                                    IP Address
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {timeline.length === 0 ? (
                                <tr>
                                    <td
                                        style={tdStyle}
                                        colSpan={4}
                                    >
                                        No Timeline Available
                                    </td>
                                </tr>
                            ) : (
                                timeline.map((e, idx) => (
                                    <tr key={idx}>
                                        <td style={tdStyle}>
                                            {new Date(
                                                e.timestamp
                                            ).toLocaleString()}
                                        </td>

                                        <td style={tdStyle}>
                                            {e.activity}
                                        </td>

                                        <td style={tdStyle}>
                                            {e.device}
                                        </td>

                                        <td style={tdStyle}>
                                            {e.ip_address}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Panel>
            )}
        </div>
    );
}