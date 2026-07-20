import { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Employees() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    user_id: "",
    employee_code: "",
    department: "",
    designation: "",
    manager_name: "",
    device_info: "",
    access_privileges: "",
  });

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, usersRes] = await Promise.all([
        api.get("/employees", authHeader),
        api.get("/users", authHeader),
      ]);
      setEmployees(empRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(", "));
      } else {
        setError(typeof detail === "string" ? detail : "Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.post(
        "/employees",
        { ...form, user_id: parseInt(form.user_id, 10) },
        authHeader,
      );
      setSuccess("Employee profile created successfully");
      setForm({
        user_id: "",
        employee_code: "",
        department: "",
        designation: "",
        manager_name: "",
        device_info: "",
        access_privileges: "",
      });
      loadData();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((d) => d.msg).join(", "));
      } else {
        setError(
          typeof detail === "string" ? detail : "Failed to create employee",
        );
      }
    }
  };

  const userLabel = (userId) => {
    const u = users.find((u) => u.id === userId);
    return u ? `${u.full_name} (${u.email})` : `User #${userId}`;
  };

  if (loading)
    return <div className="loading-screen">Loading employees...</div>;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-topbar">
          <div className="dashboard-brand">
            <div className="dashboard-brand-icon">IT</div>
            <div>
              <h1>Employee Management</h1>
              <p>Module 2 — Identity &amp; Profile Management</p>
            </div>
          </div>
        </div>

        <div
          className="dashboard-grid"
          style={{ gridTemplateColumns: "1fr 1.5fr" }}
        >
          <div className="profile-card">
            <h3 style={{ marginTop: 0 }}>Onboard Employee</h3>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>User Account</label>
                <select
                  name="user_id"
                  value={form.user_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Employee Code</label>
                <input
                  name="employee_code"
                  value={form.employee_code}
                  onChange={handleChange}
                  placeholder="EMP001"
                  required
                />
              </div>
              <div className="field">
                <label>Department</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Security Operations"
                  required
                />
              </div>
              <div className="field">
                <label>Designation</label>
                <input
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Security Analyst"
                  required
                />
              </div>
              <div className="field">
                <label>Manager Name</label>
                <input
                  name="manager_name"
                  value={form.manager_name}
                  onChange={handleChange}
                  placeholder="Vijay Kumar"
                />
              </div>
              <div className="field">
                <label>Device Info</label>
                <input
                  name="device_info"
                  value={form.device_info}
                  onChange={handleChange}
                  placeholder="Laptop-WIN-4521"
                />
              </div>
              <div className="field">
                <label>Access Privileges</label>
                <input
                  name="access_privileges"
                  value={form.access_privileges}
                  onChange={handleChange}
                  placeholder="Standard"
                />
              </div>
              <button type="submit" className="btn-primary">
                Add Employee
              </button>
            </form>
            {error && <div className="alert-error">{error}</div>}
            {success && <div className="alert-success">{success}</div>}
          </div>

          <div className="panel-card">
            <h3>All Employees</h3>
            <p className="sub">{employees.length} total</p>

            {employees.length === 0 ? (
              <div className="empty-note">No employees onboarded yet.</div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="activity-item"
                    style={{ alignItems: "flex-start" }}
                  >
                    <div
                      className="activity-dot blue"
                      style={{ marginTop: 6 }}
                    ></div>
                    <div style={{ flex: 1 }}>
                      <div
                        className="activity-text"
                        style={{ fontWeight: 600 }}
                      >
                        {emp.employee_code} — {emp.designation}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}
                      >
                        {userLabel(emp.user_id)}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}
                      >
                        {emp.department}{" "}
                        {emp.manager_name && `· Reports to ${emp.manager_name}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
