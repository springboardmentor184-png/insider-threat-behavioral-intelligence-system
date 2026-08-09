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

const CAN_MANAGE = ["Administrator", "Security Manager"];
const CAN_DELETE = ["Administrator"];

function riskLabel(score) {
    if (score >= 75) {
        return { text: "Critical", cls: "danger" };
    }

    if (score >= 50) {
        return { text: "High", cls: "danger" };
    }

    if (score >= 25) {
        return { text: "Medium", cls: "warning" };
    }

    return { text: "Low", cls: "success" };
}

const EMPTY_FORM = {
    employee_id: "",
    designation: "",
    department: "",
    manager: "",
    device_info: "",
    access_privileges: "",
    phone: "",
    address: "",
};

function Employees() {
    const { user } = useAuth();
    const role = user?.role;

    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formLoading, setFormLoading] = useState(false);

    const loadEmployees = () => {
        fetch(`${API_URL}/employees/`, {
            headers: authHeaders(),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Status ${res.status}`);
                }

                return res.json();
            })
            .then((data) => {
                setEmployees(data);
                setError(null);
            })
            .catch((err) => {
                setError(err.message);
            });
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    function openAddForm() {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setShowForm(true);
    }

    // Fetch full profile details before opening the edit form,
    // since the list endpoint only returns a subset of fields.
    async function openEditForm(emp) {
        setEditingId(emp.id);
        setShowForm(true);
        setFormLoading(true);

        try {
            const res = await fetch(`${API_URL}/profile/${emp.id}`, {
                headers: authHeaders(),
            });

            if (res.ok) {
                const full = await res.json();

                setFormData({
                    employee_id: full.employee_id || "",
                    designation: full.designation || "",
                    department: full.department || "",
                    manager: full.manager || "",
                    device_info: full.device_info || "",
                    access_privileges: full.access_privileges || "",
                    phone: full.phone || "",
                    address: full.address || "",
                });
            } else {
                // Fallback: pre-fill what we already have from the list.
                setFormData({
                    ...EMPTY_FORM,
                    employee_id: emp.employee_id || "",
                    designation: emp.designation || "",
                    department: emp.department || "",
                });
            }
        } catch (err) {
            console.error(err);

            setFormData({
                ...EMPTY_FORM,
                employee_id: emp.employee_id || "",
                designation: emp.designation || "",
                department: emp.department || "",
            });
        } finally {
            setFormLoading(false);
        }
    }

    function handleChange(e) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const url = editingId
                ? `${API_URL}/profile/${editingId}`
                : `${API_URL}/profile/`;

            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: authHeaders(),
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Request failed");
            }

            setShowForm(false);
            setEditingId(null);
            setFormData(EMPTY_FORM);

            loadEmployees();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleDelete(id) {
        if (
            !window.confirm(
                "Delete this employee profile? This cannot be undone."
            )
        ) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/profile/${id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Delete failed");
            }

            loadEmployees();
        } catch (err) {
            alert(err.message);
        }
    }

    if (error) {
        return (
            <p style={{ color: "red" }}>
                Failed to load employees: {error}
            </p>
        );
    }

    const filteredEmployees = employees.filter((emp) => {
        const q = search.toLowerCase();

        return (
            emp.employee_id?.toLowerCase().includes(q) ||
            emp.department?.toLowerCase().includes(q) ||
            emp.designation?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="dashboard-container">
            <div
                className="page-header"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <h2>Employees</h2>

                {CAN_MANAGE.includes(role) && (
                    <button onClick={openAddForm}>
                        + Add Employee
                    </button>
                )}
            </div>

            <input
                type="text"
                placeholder="Search by Employee ID, Department, or Designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    margin: "12px 0",
                    width: "100%",
                    maxWidth: "400px",
                }}
            />

            {showForm && (
                <div className="card" style={{ marginBottom: "20px" }}>
                    <h3>
                        {editingId
                            ? "Edit Employee"
                            : "Onboard New Employee"}
                    </h3>

                    {formLoading ? (
                        <p>Loading employee details...</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "12px",
                                }}
                            >
                                <div>
                                    <label>Employee ID</label>

                                    <input
                                        name="employee_id"
                                        value={formData.employee_id}
                                        onChange={handleChange}
                                        required
                                        disabled={!!editingId}
                                    />
                                </div>

                                <div>
                                    <label>Designation</label>

                                    <input
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div>
                                    <label>Department</label>

                                    <input
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label>Manager</label>

                                    <input
                                        name="manager"
                                        value={formData.manager}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label>Device Info</label>

                                    <input
                                        name="device_info"
                                        value={formData.device_info}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label>Access Privileges</label>

                                    <input
                                        name="access_privileges"
                                        value={formData.access_privileges}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label>Phone</label>

                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label>Address</label>

                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: "16px",
                                    display: "flex",
                                    gap: "10px",
                                }}
                            >
                                <button type="submit">
                                    {editingId
                                        ? "Save Changes"
                                        : "Onboard Employee"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingId(null);
                                        setFormData(EMPTY_FORM);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            <table className="log-table">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Risk Score</th>
                        <th>Risk Category</th>

                        {CAN_MANAGE.includes(role) && (
                            <th>Actions</th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {filteredEmployees.length === 0 ? (
                        <tr>
                            <td
                                colSpan={
                                    CAN_MANAGE.includes(role) ? 6 : 5
                                }
                                style={{ textAlign: "center" }}
                            >
                                No employees found
                            </td>
                        </tr>
                    ) : (
                        filteredEmployees.map((emp) => {
                            const risk = riskLabel(emp.risk_score);

                            return (
                                <tr key={emp.id || emp.employee_id}>
                                    <td>{emp.employee_id}</td>
                                    <td>{emp.department}</td>
                                    <td>{emp.designation}</td>
                                    <td>{emp.risk_score}</td>

                                    <td>
                                        <span
                                            className={`badge ${risk.cls}`}
                                        >
                                            {risk.text}
                                        </span>
                                    </td>

                                    {CAN_MANAGE.includes(role) && (
                                        <td
                                            style={{
                                                display: "flex",
                                                gap: "8px",
                                            }}
                                        >
                                            <button
                                                onClick={() =>
                                                    openEditForm(emp)
                                                }
                                            >
                                                Edit
                                            </button>

                                            {CAN_DELETE.includes(role) && (
                                                <button
                                                    onClick={() =>
                                                        handleDelete(emp.id)
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Employees;