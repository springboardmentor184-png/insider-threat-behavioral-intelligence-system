import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import "../styles/Dashboard.css";

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

function Users() {
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

            const data = await res.json();

            setUsers(data);
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
            const res = await fetch(`${API_URL}/users/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

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
        return <h2>Loading Users...</h2>;
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
                <h2>User Management</h2>

                <button
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
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={saveUser}
                    className="add-employee-form"
                >
                    <input
                        name="full_name"
                        placeholder="Full Name"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required={!editingId}
                    />

                    <input
                        name="department"
                        placeholder="Department"
                        value={form.department}
                        onChange={handleChange}
                    />

                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="Administrator">
                            Administrator
                        </option>

                        <option value="Security Manager">
                            Security Manager
                        </option>

                        <option value="SOC Engineer">
                            SOC Engineer
                        </option>

                        <option value="Security Analyst">
                            Security Analyst
                        </option>
                    </select>

                    <button type="submit">
                        {editingId
                            ? "Update User"
                            : "Create User"}
                    </button>
                </form>
            )}

            <table className="log-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td
                                colSpan="7"
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                No Users Found
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>

                                <td>{user.full_name}</td>

                                <td>{user.email}</td>

                                <td>{user.role}</td>

                                <td>
                                    {user.department ||
                                        "Not Available"}
                                </td>

                                <td>
                                    <span
                                        className={`badge ${
                                            user.is_active
                                                ? "success"
                                                : "danger"
                                        }`}
                                    >
                                        {user.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </span>
                                </td>

                                <td>
                                    <button
                                        onClick={() =>
                                            editUser(user)
                                        }
                                        style={{
                                            marginRight: "8px",
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteUser(user.id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Users;