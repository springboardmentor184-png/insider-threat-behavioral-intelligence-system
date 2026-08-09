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

const GENERATE_ROLES = [
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst",
];

function Notifications() {
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

            const data = await res.json();

            setNotifications(data);

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

        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        return <h2>Loading Notifications...</h2>;
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
                <h2>
                    Notifications ({unreadCount} Unread)
                </h2>

                {GENERATE_ROLES.includes(role) && (
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                        }}
                    >
                        <button
                            onClick={generateAlertNotifications}
                        >
                            Generate Alert Notifications
                        </button>

                        <button
                            onClick={generateIncidentNotifications}
                        >
                            Generate Incident Notifications
                        </button>
                    </div>
                )}
            </div>

            <label
                style={{
                    display: "block",
                    marginBottom: "16px",
                }}
            >
                <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(e) =>
                        setUnreadOnly(e.target.checked)
                    }
                />{" "}
                Show unread only
            </label>

            <table className="log-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Severity</th>
                        <th>Employee</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {notifications.length === 0 ? (
                        <tr>
                            <td
                                colSpan="8"
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                No Notifications
                            </td>
                        </tr>
                    ) : (
                        notifications.map((n) => (
                            <tr key={n.id}>
                                <td>{n.id}</td>

                                <td>
                                    {n.notification_type}
                                </td>

                                <td>{n.title}</td>

                                <td>{n.severity}</td>

                                <td>
                                    {n.related_employee_id}
                                </td>

                                <td>
                                    {n.is_read
                                        ? "Read"
                                        : "Unread"}
                                </td>

                                <td>
                                    {new Date(
                                        n.created_at
                                    ).toLocaleString()}
                                </td>

                                <td>
                                    {!n.is_read && (
                                        <button
                                            onClick={() =>
                                                markRead(n.id)
                                            }
                                        >
                                            Mark Read
                                        </button>
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

export default Notifications;