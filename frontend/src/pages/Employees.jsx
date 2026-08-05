import { useState, useEffect } from "react";
import { getEmployees, createEmployee, flagEmployee } from "../api/axios";
import Layout from "../components/Layout";

const fields = ["employee_id", "department", "designation", "manager", "device_info", "access_privileges"];

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(Object.fromEntries(fields.map((f) => [f, ""])));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createEmployee(form);
      setForm(Object.fromEntries(fields.map((f) => [f, ""])));
      loadEmployees();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create employee (need manager or admin role)");
    }
  };

  const handleFlag = async (empId) => {
  const reason = window.prompt(`Reason for flagging ${empId}?`);
  if (!reason) return;
  try {
    await flagEmployee(empId, reason);
    alert("Employee flagged — check Anomalies dashboard");
  } catch (err) {
    alert(err.response?.data?.detail || "Failed to flag employee");
  }
};

  return (
    <Layout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Employee profiles</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
          {employees.length} record{employees.length !== 1 ? "s" : ""} tracked
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 500 }}>Add employee</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
            {fields.map((field) => (
              <div key={field}>
                <label className="field-label">{field.replace("_", " ")}</label>
                <input className="field-input" name={field} value={form[field]} onChange={handleChange} />
              </div>
            ))}
          </div>
          {error && (
            <p className="mono" style={{ color: "var(--risk-critical)", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary">Create employee</button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 24, color: "var(--text-secondary)" }}>Loading...</p>
        ) : employees.length === 0 ? (
          <p style={{ padding: 24, color: "var(--text-secondary)" }}>No employee records yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                {["Employee ID", "Department", "Designation", "Manager", "Action"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "12px 20px",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--text-muted)",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                  <td className="mono" style={{ padding: "12px 20px", fontSize: 13 }}>{emp.employee_id}</td>
                  <td style={{ padding: "12px 20px", fontSize: 13 }}>{emp.department}</td>
                  <td style={{ padding: "12px 20px", fontSize: 13 }}>{emp.designation}</td>
                  <td style={{ padding: "12px 20px", fontSize: 13, color: "var(--text-secondary)" }}>{emp.manager}</td>
                  <td style={{ padding: "12px 20px" }}>
                    <button className="btn" onClick={() => handleFlag(emp.employee_id)}>Flag</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}