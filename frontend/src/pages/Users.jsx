import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import {
    C,
    Pill,
    Panel,
    Btn,
    Input,
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

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        role: "Security Analyst",
        department: "",
    });

    const loadUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/users/`, {
                headers: authHeaders(),
            });

            if (!res.ok) {
                throw new Error(`Status ${res.status}`);
            }

            setUsers(await res.json());
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const saveUser = async (e) => {
        e.preventDefault();

        const url = editingId
            ? `${API_URL}/users/${editingId}`
            : `${API_URL}/users/`;

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

            setShowForm(false);
            setEditingId(null);

            setForm({
                full_name: "",
                email: "",
                password: "",
                role: "Security Analyst",
                department: "",
            });

            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const editUser = (user) => {
        setEditingId(user.id);

        setForm({
            full_name: user.full_name,
            email: user.email,
            password: "",
            role: user.role,
            department: user.department || "",
        });

        setShowForm(true);
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) {
            return;
        }

        try {
            const res = await fetch(
                `${API_URL}/users/${id}`,
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

            loadUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <p style={{ color: C.dim }}>
                Loading Users...
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
                    User Management
                </div>

                <Btn
                    variant="primary"
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);

                        setForm({
                            full_name: "",
                            email: "",
                            password: "",
                            role: "Security Analyst",
                            department: "",
                        });
                    }}
                >
                    {showForm ? "Cancel" : "Add User"}
                </Btn>
            </div>

            {showForm && (
                <Panel>
                    <form
                        onSubmit={saveUser}
                        style={{
                            display: "flex",
                            gap: 10,
                            flexWrap: "wrap",
                            alignItems: "flex-end",
                        }}
                    >
                        <Input
                            name="full_name"
                            placeholder="Full Name"
                            value={form.full_name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required={!editingId}
                        />

                        <Input
                            name="department"
                            placeholder="Department"
                            value={form.department}
                            onChange={handleChange}
                        />

                        <Select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option>
                                Administrator
                            </option>

                            <option>
                                Security Manager
                            </option>

                            <option>
                                SOC Engineer
                            </option>

                            <option>
                                Security Analyst
                            </option>
                        </Select>

                        <Btn
                            type="submit"
                            variant="primary"
                        >
                            {editingId
                                ? "Update User"
                                : "Create User"}
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
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Department</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id}>
                                <td style={tdStyle}>
                                    {u.id}
                                </td>

                                <td style={tdStyle}>
                                    {u.full_name}
                                </td>

                                <td style={tdStyle}>
                                    {u.email}
                                </td>

                                <td style={tdStyle}>
                                    {u.role}
                                </td>

                                <td style={tdStyle}>
                                    {u.department}
                                </td>

                                <td style={tdStyle}>
                                    <Pill
                                        label={
                                            u.is_active
                                                ? "Active"
                                                : "Inactive"
                                        }
                                        color={
                                            u.is_active
                                                ? C.green
                                                : C.accent
                                        }
                                    />
                                </td>

                                <td style={tdStyle}>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 6,
                                        }}
                                    >
                                        <Btn
                                            onClick={() =>
                                                editUser(u)
                                            }
                                        >
                                            Edit
                                        </Btn>

                                        <Btn
                                            variant="danger"
                                            onClick={() =>
                                                deleteUser(
                                                    u.id
                                                )
                                            }
                                        >
                                            Delete
                                        </Btn>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Panel>
        </div>
    );
}