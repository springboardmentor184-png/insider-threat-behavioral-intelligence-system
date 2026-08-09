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

const MANAGE_ROLES = ["Administrator"];

const PAGE_SIZE = 50;

function Activity() {
    const { user } = useAuth();
    const role = user?.role;

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const [employeeFilter, setEmployeeFilter] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        employee: "",
        activity: "",
        device: "",
        ip_address: "",
    });

    useEffect(() => {
        loadActivities(page);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    async function loadActivities(pageNum) {
        setLoading(true);

        try {
            const skip = pageNum * PAGE_SIZE;

            const response = await fetch(
                `${API_URL}/activity/?skip=${skip}&limit=${PAGE_SIZE}`,
                {
                    headers: authHeaders(),
                }
            );

            const data = await response.json();

            setActivities(data);

            // If a full page is returned, there may be more records.
            setHasMore(data.length === PAGE_SIZE);
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    }

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function saveActivity(e) {
        e.preventDefault();

        // Backend route:
        // POST /activity/
        // PUT  /activity/{id}
        const url = editingId
            ? `${API_URL}/activity/${editingId}`
            : `${API_URL}/activity/`;

        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Request failed");
            }

            setForm({
                employee: "",
                activity: "",
                device: "",
                ip_address: "",
            });

            setEditingId(null);
            setShowForm(false);

            loadActivities(page);
        } catch (err) {
            alert(err.message);
        }
    }

    function editActivity(activity) {
        setEditingId(activity.id);

        setForm({
            employee: activity.employee,
            activity: activity.activity,
            device: activity.device,
            ip_address: activity.ip_address,
        });

        setShowForm(true);
    }

    async function deleteActivity(id) {
        if (!window.confirm("Delete this activity?")) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/activity/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Delete failed");
            }

            loadActivities(page);
        } catch (err) {
            alert(err.message);
        }
    }

    // Filters only the currently loaded page.
    const visibleActivities = employeeFilter
        ? activities.filter((item) =>
              item.employee
                  ?.toLowerCase()
                  .includes(employeeFilter.toLowerCase())
          )
        : activities;

    if (loading && activities.length === 0) {
        return <h2>Loading Activity Logs...</h2>;
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
                <h2>Activity Logs</h2>

                {ANALYST_ROLES.includes(role) && (
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                        }}
                    >
                        {showForm ? "Cancel" : "+ Add Activity"}
                    </button>
                )}
            </div>

            <p
                style={{
                    color: "#666",
                    fontSize: "0.9rem",
                }}
            >
                Showing page {page + 1} ({activities.length} records this
                page). Search filters only the currently loaded page — use
                pagination to browse further.
            </p>

            <input
                type="text"
                placeholder="Filter this page by Employee..."
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                style={{
                    width: "300px",
                    marginBottom: "16px",
                }}
            />

            {showForm && (
                <form
                    onSubmit={saveActivity}
                    className="add-employee-form"
                >
                    <input
                        name="employee"
                        placeholder="Employee"
                        value={form.employee}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="activity"
                        placeholder="Activity"
                        value={form.activity}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="device"
                        placeholder="Device"
                        value={form.device}
                        onChange={handleChange}
                    />

                    <input
                        name="ip_address"
                        placeholder="IP Address"
                        value={form.ip_address}
                        onChange={handleChange}
                    />

                    <button type="submit">
                        {editingId
                            ? "Update Activity"
                            : "Add Activity"}
                    </button>
                </form>
            )}

            <table className="log-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Activity</th>
                        <th>Device</th>
                        <th>IP Address</th>
                        <th>Timestamp</th>

                        {MANAGE_ROLES.includes(role) && (
                            <th>Actions</th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {visibleActivities.length === 0 ? (
                        <tr>
                            <td
                                colSpan={
                                    MANAGE_ROLES.includes(role)
                                        ? 7
                                        : 6
                                }
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                No Activity Logs Found
                            </td>
                        </tr>
                    ) : (
                        visibleActivities.map((activity) => (
                            <tr key={activity.id}>
                                <td>{activity.id}</td>
                                <td>{activity.employee}</td>
                                <td>{activity.activity}</td>
                                <td>{activity.device}</td>
                                <td>{activity.ip_address}</td>
                                <td>
                                    {new Date(
                                        activity.timestamp
                                    ).toLocaleString()}
                                </td>

                                {MANAGE_ROLES.includes(role) && (
                                    <td>
                                        <button
                                            onClick={() =>
                                                editActivity(activity)
                                            }
                                            style={{
                                                marginRight: "8px",
                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                deleteActivity(
                                                    activity.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "16px",
                }}
            >
                <button
                    disabled={page === 0}
                    onClick={() =>
                        setPage((p) => Math.max(0, p - 1))
                    }
                >
                    Previous
                </button>

                <span>Page {page + 1}</span>

                <button
                    disabled={!hasMore}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Activity;