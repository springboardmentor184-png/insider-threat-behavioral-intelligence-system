import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
import {
    C,
    Panel,
    Btn,
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

const GENERATE_ROLES = [
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst",
];

export default function Notifications() {
    const { user } = useAuth();
    const role = user?.role;

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [unreadOnly, setUnreadOnly] = useState(false);

    const loadNotifications = async () => {
        try {
            const res = await fetch(
                `${API_URL}/notifications/${
                    unreadOnly ? "?unread_only=true" : ""
                }`,
                {
                    headers: authHeaders(),
                }
            );

            setNotifications(await res.json());

            const countRes = await fetch(
                `${API_URL}/notifications/summary/unread-count`,
                {
                    headers: authHeaders(),
                }
            );

            const countData = await countRes.json();

            setUnreadCount(countData.unread_count);
        } catch (err) {
            console.error(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadNotifications();

        // eslint-disable-next-line
    }, [unreadOnly]);

    async function generateAlertNotifications() {
        await fetch(
            `${API_URL}/notifications/generate-from-alerts`,
            {
                method: "POST",
                headers: authHeaders(),
            }
        );

        loadNotifications();
    }

    async function generateIncidentNotifications() {
        await fetch(
            `${API_URL}/notifications/generate-from-incidents`,
            {
                method: "POST",
                headers: authHeaders(),
            }
        );

        loadNotifications();
    }

    async function markRead(id) {
        await fetch(
            `${API_URL}/notifications/${id}/mark-read`,
            {
                method: "PUT",
                headers: authHeaders(),
            }
        );

        loadNotifications();
    }

    if (loading) {
        return (
            <p style={{ color: C.dim }}>
                Loading Notifications...
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
                    Notifications ({unreadCount} Unread)
                </div>

                {GENERATE_ROLES.includes(role) && (
                    <div
                        style={{
                            display: "flex",
                            gap: 10,
                        }}
                    >
                        <Btn
                            onClick={
                                generateAlertNotifications
                            }
                        >
                            Generate Alert Notifications
                        </Btn>

                        <Btn
                            onClick={
                                generateIncidentNotifications
                            }
                        >
                            Generate Incident Notifications
                        </Btn>
                    </div>
                )}
            </div>

            <label
                style={{
                    color: C.dim,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                }}
            >
                <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(e) =>
                        setUnreadOnly(e.target.checked)
                    }
                />

                Show unread only
            </label>

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
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Title</th>
                            <th style={thStyle}>Severity</th>
                            <th style={thStyle}>Employee</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Created</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {notifications.length === 0 ? (
                            <tr>
                                <td
                                    style={tdStyle}
                                    colSpan={8}
                                >
                                    No Notifications
                                </td>
                            </tr>
                        ) : (
                            notifications.map((n) => (
                                <tr key={n.id}>
                                    <td style={tdStyle}>
                                        {n.id}
                                    </td>

                                    <td style={tdStyle}>
                                        {n.notification_type}
                                    </td>

                                    <td style={tdStyle}>
                                        {n.title}
                                    </td>

                                    <td style={tdStyle}>
                                        {n.severity}
                                    </td>

                                    <td style={tdStyle}>
                                        {n.related_employee_id}
                                    </td>

                                    <td style={tdStyle}>
                                        {n.is_read
                                            ? "Read"
                                            : "Unread"}
                                    </td>

                                    <td style={tdStyle}>
                                        {new Date(
                                            n.created_at
                                        ).toLocaleString()}
                                    </td>

                                    <td style={tdStyle}>
                                        {!n.is_read && (
                                            <Btn
                                                onClick={() =>
                                                    markRead(
                                                        n.id
                                                    )
                                                }
                                            >
                                                Mark Read
                                            </Btn>
                                        )}
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