import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
import {
    C,
    Panel,
    Btn,
    Input,
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

const MANAGE_ROLES = ["Administrator"];

const PAGE_SIZE = 50;

export default function Activity() {
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
        // eslint-disable-next-line
    }, [page]);

    async function loadActivities(pageNum) {
        setLoading(true);

        try {
            const skip = pageNum * PAGE_SIZE;

            const res = await fetch(
                `${API_URL}/activity/?skip=${skip}&limit=${PAGE_SIZE}`,
                {
                    headers: authHeaders(),
                }
            );

            const data = await res.json();

            setActivities(data);
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

                throw new Error(
                    err.detail || "Request failed"
                );
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

    function editActivity(a) {
        setEditingId(a.id);

        setForm({
            employee: a.employee,
            activity: a.activity,
            device: a.device,
            ip_address: a.ip_address,
        });

        setShowForm(true);
    }

    async function deleteActivity(id) {
        if (!window.confirm("Delete this activity?")) {
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/activity/${id}`,
                {
                    method: "DELETE",
                    headers: authHeaders(),
                }
            );

            if (!res.ok) {
                const err = await res.json();

                throw new Error(
                    err.detail || "Delete failed"
                );
            }

            loadActivities(page);
        } catch (err) {
            alert(err.message);
        }
    }

    const visible = employeeFilter
        ? activities.filter((a) =>
              a.employee
                  ?.toLowerCase()
                  .includes(employeeFilter.toLowerCase())
          )
        : activities;

    if (loading && activities.length === 0) {
        return (
            <p style={{ color: C.dim }}>
                Loading Activity Logs...
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
                    Activity Monitor{" "}
                    <span
                        style={{
                            color: C.dim,
                            fontWeight: 400,
                            fontSize: 12,
                        }}
                    >
                        (activity.py + CERT CSVs)
                    </span>
                </div>

                {ANALYST_ROLES.includes(role) && (
                    <Btn
                        variant="primary"
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                        }}
                    >
                        {showForm
                            ? "Cancel"
                            : "+ Add Activity"}
                    </Btn>
                )}
            </div>

            <p
                style={{
                    color: C.muted,
                    fontSize: 11,
                }}
            >
                Showing page {page + 1} (
                {activities.length} records). Search filters
                only the loaded page — use pagination to browse
                further.
            </p>

            <Input
                placeholder="Filter this page by Employee..."
                value={employeeFilter}
                onChange={(e) =>
                    setEmployeeFilter(e.target.value)
                }
                style={{ maxWidth: 320 }}
            />

            {showForm && (
                <Panel>
                    <form
                        onSubmit={saveActivity}
                        style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            alignItems: "flex-end",
                        }}
                    >
                        <Input
                            name="employee"
                            placeholder="Employee"
                            value={form.employee}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="activity"
                            placeholder="Activity"
                            value={form.activity}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="device"
                            placeholder="Device"
                            value={form.device}
                            onChange={handleChange}
                        />

                        <Input
                            name="ip_address"
                            placeholder="IP Address"
                            value={form.ip_address}
                            onChange={handleChange}
                        />

                        <Btn
                            type="submit"
                            variant="primary"
                        >
                            {editingId ? "Update" : "Add"}
                        </Btn>
                    </form>
                </Panel>
            )}

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
                            <th style={thStyle}>Activity</th>
                            <th style={thStyle}>Device</th>
                            <th style={thStyle}>IP Address</th>
                            <th style={thStyle}>Timestamp</th>

                            {MANAGE_ROLES.includes(role) && (
                                <th style={thStyle}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {visible.length === 0 ? (
                            <tr>
                                <td
                                    style={tdStyle}
                                    colSpan={
                                        MANAGE_ROLES.includes(
                                            role
                                        )
                                            ? 7
                                            : 6
                                    }
                                >
                                    No Activity Logs Found
                                </td>
                            </tr>
                        ) : (
                            visible.map((a) => (
                                <tr key={a.id}>
                                    <td style={tdStyle}>
                                        {a.id}
                                    </td>

                                    <td style={tdStyle}>
                                        {a.employee}
                                    </td>

                                    <td style={tdStyle}>
                                        {a.activity}
                                    </td>

                                    <td style={tdStyle}>
                                        {a.device}
                                    </td>

                                    <td style={tdStyle}>
                                        {a.ip_address}
                                    </td>

                                    <td style={tdStyle}>
                                        {new Date(
                                            a.timestamp
                                        ).toLocaleString()}
                                    </td>

                                    {MANAGE_ROLES.includes(
                                        role
                                    ) && (
                                        <td style={tdStyle}>
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap: 6,
                                                }}
                                            >
                                                <Btn
                                                    onClick={() =>
                                                        editActivity(
                                                            a
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </Btn>

                                                <Btn
                                                    variant="danger"
                                                    onClick={() =>
                                                        deleteActivity(
                                                            a.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </Btn>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </Panel>

            <div
                style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                }}
            >
                <Btn
                    disabled={page === 0}
                    onClick={() =>
                        setPage((p) => Math.max(0, p - 1))
                    }
                >
                    Previous
                </Btn>

                <span
                    style={{
                        color: C.dim,
                        fontSize: 12,
                    }}
                >
                    Page {page + 1}
                </span>

                <Btn
                    disabled={!hasMore}
                    onClick={() =>
                        setPage((p) => p + 1)
                    }
                >
                    Next
                </Btn>
            </div>
        </div>
    );
}