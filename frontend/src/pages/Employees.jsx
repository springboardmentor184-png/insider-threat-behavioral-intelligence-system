import React, { useEffect, useState } from "react";
import API_URL from "../services/api";
import "../styles/Dashboard.css";

function AddEmployeeForm({ onAdded }) {
    const [form, setForm] = useState({
        employee_id: "",
        total_logons: 0,
        after_hours_logons: 0,
        unique_pcs_used: 0,
        total_device_connects: 0,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/employees`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            onAdded();
            setForm({
                employee_id: "",
                total_logons: 0,
                after_hours_logons: 0,
                unique_pcs_used: 0,
                total_device_connects: 0,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-employee-form">
            <input name="employee_id" placeholder="Employee ID" value={form.employee_id} onChange={handleChange} required />
            <input name="total_logons" type="number" placeholder="Total Logons" value={form.total_logons} onChange={handleChange} />
            <input name="after_hours_logons" type="number" placeholder="After Hours Logons" value={form.after_hours_logons} onChange={handleChange} />
            <input name="unique_pcs_used" type="number" placeholder="Unique PCs Used" value={form.unique_pcs_used} onChange={handleChange} />
            <input name="total_device_connects" type="number" placeholder="Device Connects" value={form.total_device_connects} onChange={handleChange} />
            <button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Employee"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    );
}

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const loadEmployees = () => {
        fetch(`${API_URL}/employees`)
            .then((res) => {
                if (!res.ok) throw new Error(`Status ${res.status}`);
                return res.json();
            })
            .then((data) => setEmployees(data))
            .catch((err) => setError(err.message));
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    if (error) return <p style={{ color: "red" }}>Failed to load employees: {error}</p>;

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <h2>Employees</h2>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "+ Add Employee"}
                </button>
            </div>

            {showForm && (
                <AddEmployeeForm
                    onAdded={() => {
                        loadEmployees();
                        setShowForm(false);
                    }}
                />
            )}

            {!employees.length ? (
                <p>Loading employees...</p>
            ) : (
                <table className="log-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Total Logons</th>
                            <th>After Hours</th>
                            <th>Unique PCs</th>
                            <th>Device Connects</th>
                            <th>Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.employee_id}>
                                <td>{emp.employee_id}</td>
                                <td>{emp.total_logons}</td>
                                <td>{emp.after_hours_logons}</td>
                                <td>{emp.unique_pcs_used}</td>
                                <td>{emp.total_device_connects}</td>
                                <td>
                                    <span className={emp.risk_flag ? "badge danger" : "badge success"}>
                                        {emp.risk_flag ? "High" : "Low"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Employees;