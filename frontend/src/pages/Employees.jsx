import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import useAuth from "../hooks/useAuth";
import EmployeeBehaviorDetail from "../assets/components/EmployeeBehaviorDetail";
import {
    C,
    Pill,
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

const CAN_MANAGE = ["Administrator", "Security Manager"];
const CAN_DELETE = ["Administrator"];

function riskInfo(score) {
    if (score >= 75) {
        return {
            text: "Critical",
            color: C.accent,
        };
    }

    if (score >= 50) {
        return {
            text: "High",
            color: C.amber,
        };
    }

    if (score >= 25) {
        return {
            text: "Medium",
            color: C.blue,
        };
    }

    return {
        text: "Low",
        color: C.green,
    };
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

export default function Employees() {
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
            .then(setEmployees)
            .catch((err) => setError(err.message));
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    function openAddForm() {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setShowForm(true);
    }

    async function openEditForm(emp) {
        setEditingId(emp.id);
        setShowForm(true);
        setFormLoading(true);

        try {
            const res = await fetch(
                `${API_URL}/profile/${emp.id}`,
                {
                    headers: authHeaders(),
                }
            );

            if (res.ok) {
                const full = await res.json();

                setFormData({
                    employee_id: full.employee_id || "",
                    designation: full.designation || "",
                    department: full.department || "",
                    manager: full.manager || "",
                    device_info: full.device_info || "",
                    access_privileges:
                        full.access_privileges || "",
                    phone: full.phone || "",
                    address: full.address || "",
                });
            } else {
                setFormData({
                    ...EMPTY_FORM,
                    employee_id: emp.employee_id,
                    designation: emp.designation,
                    department: emp.department,
                });
            }
        } catch {
            setFormData({
                ...EMPTY_FORM,
                employee_id: emp.employee_id,
                designation: emp.designation,
                department: emp.department,
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
                throw new Error(
                    err.detail || "Request failed"
                );
            }

            setShowForm(false);
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
            const res = await fetch(
                `${API_URL}/profile/${id}`,
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

            loadEmployees();
        } catch (err) {
            alert(err.message);
        }
    }

    if (error) {
        return (
            <p style={{ color: C.accent }}>
                Failed to load employees: {error}
            </p>
        );
    }

    const filtered = employees.filter((emp) => {
        const q = search.toLowerCase();

        return (
            emp.employee_id
                ?.toLowerCase()
                .includes(q) ||
            emp.department
                ?.toLowerCase()
                .includes(q) ||
            emp.designation
                ?.toLowerCase()
                .includes(q)
        );
    });

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
                    Employee Risk Registry{" "}
                    <span
                        style={{
                            color: C.dim,
                            fontWeight: 400,
                            fontSize: 12,
                        }}
                    >
                        (employees.py)
                    </span>
                </div>

                {CAN_MANAGE.includes(role) && (
                    <Btn
                        variant="primary"
                        onClick={openAddForm}
                    >
                        + Add Employee
                    </Btn>
                )}
            </div>

            <Input
                placeholder="Search by Employee ID, Department, or Designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 380 }}
            />

            {showForm && (
                <Panel
                    title={
                        editingId
                            ? "Edit Employee"
                            : "Onboard New Employee"
                    }
                >
                    {formLoading ? (
                        <p style={{ color: C.dim }}>
                            Loading employee details...
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "1fr 1fr",
                                    gap: 12,
                                }}
                            >
                                {[
                                    [
                                        "employee_id",
                                        "Employee ID",
                                        true,
                                    ],
                                    [
                                        "designation",
                                        "Designation",
                                        false,
                                    ],
                                    [
                                        "department",
                                        "Department",
                                        false,
                                    ],
                                    [
                                        "manager",
                                        "Manager",
                                        false,
                                    ],
                                    [
                                        "device_info",
                                        "Device Info",
                                        false,
                                    ],
                                    [
                                        "access_privileges",
                                        "Access Privileges",
                                        false,
                                    ],
                                    [
                                        "phone",
                                        "Phone",
                                        false,
                                    ],
                                    [
                                        "address",
                                        "Address",
                                        false,
                                    ],
                                ].map(
                                    ([
                                        name,
                                        label,
                                        disableOnEdit,
                                    ]) => (
                                        <div key={name}>
                                            <label
                                                style={{
                                                    display:
                                                        "block",
                                                    color: C.dim,
                                                    fontSize: 10.5,
                                                    textTransform:
                                                        "uppercase",
                                                    marginBottom: 5,
                                                }}
                                            >
                                                {label}
                                            </label>

                                            <Input
                                                name={name}
                                                value={
                                                    formData[
                                                        name
                                                    ]
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                required={
                                                    name ===
                                                        "employee_id" ||
                                                    name ===
                                                        "designation"
                                                }
                                                disabled={
                                                    disableOnEdit &&
                                                    !!editingId
                                                }
                                                style={{
                                                    width: "100%",
                                                }}
                                            />
                                        </div>
                                    )
                                )}
                            </div>

                            <div
                                style={{
                                    marginTop: 16,
                                    display: "flex",
                                    gap: 10,
                                }}
                            >
                                <Btn
                                    type="submit"
                                    variant="primary"
                                >
                                    {editingId
                                        ? "Save Changes"
                                        : "Onboard Employee"}
                                </Btn>

                                <Btn
                                    variant="ghost"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </Btn>
                            </div>
                        </form>
                    )}
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
                            <th style={thStyle}>
                                Employee
                            </th>

                            <th style={thStyle}>
                                Department
                            </th>

                            <th style={thStyle}>
                                Designation
                            </th>

                            <th style={thStyle}>
                                Risk Score
                            </th>

                            <th style={thStyle}>
                                Category
                            </th>

                            <th style={thStyle}>
                                Activity
                            </th>

                            {CAN_MANAGE.includes(role) && (
                                <th style={thStyle}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td
                                    style={tdStyle}
                                    colSpan={
                                        CAN_MANAGE.includes(role)
                                            ? 7
                                            : 6
                                    }
                                >
                                    No employees found
                                </td>
                            </tr>
                        ) : (
                            filtered.map((emp) => {
                                const risk = riskInfo(
                                    emp.risk_score
                                );

                                return (
                                    <tr
                                        key={
                                            emp.id ||
                                            emp.employee_id
                                        }
                                    >
                                        <td style={tdStyle}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: 8,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 26,
                                                        height: 26,
                                                        borderRadius:
                                                            "50%",
                                                        background: `${risk.color}22`,
                                                        color: risk.color,
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {emp.employee_id?.slice(
                                                        0,
                                                        2
                                                    )}
                                                </div>

                                                {emp.employee_id}
                                            </div>
                                        </td>

                                        <td style={tdStyle}>
                                            {emp.department}
                                        </td>

                                        <td style={tdStyle}>
                                            {emp.designation}
                                        </td>

                                        <td style={tdStyle}>
                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: 8,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 60,
                                                        height: 5,
                                                        background:
                                                            C.border,
                                                        borderRadius:
                                                            3,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: "100%",
                                                            width: `${emp.risk_score}%`,
                                                            borderRadius:
                                                                3,
                                                            background:
                                                                risk.color,
                                                        }}
                                                    />
                                                </div>

                                                <span
                                                    style={{
                                                        color: risk.color,
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    {emp.risk_score}
                                                </span>
                                            </div>
                                        </td>

                                        <td style={tdStyle}>
                                            <Pill
                                                label={risk.text}
                                                color={
                                                    risk.color
                                                }
                                            />
                                        </td>

                                        <td style={tdStyle}>
                                            <EmployeeBehaviorDetail
                                                employeeId={
                                                    emp.employee_id
                                                }
                                            />
                                        </td>

                                        {CAN_MANAGE.includes(
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
                                                            openEditForm(
                                                                emp
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Btn>

                                                    {CAN_DELETE.includes(
                                                        role
                                                    ) && (
                                                        <Btn
                                                            variant="danger"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    emp.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </Btn>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </Panel>
        </div>
    );
}