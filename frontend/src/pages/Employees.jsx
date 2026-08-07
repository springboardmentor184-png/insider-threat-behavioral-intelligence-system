import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { getEmployees, createEmployee, flagEmployee } from "../api/axios";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [flagReason, setFlagReason] = useState("");

  // New Employee Form
  const [newEmp, setNewEmp] = useState({
    employee_id: "",
    department: "Engineering",
    designation: "Software Engineer",
    manager: "Alex Mercer",
    device_info: "MacBook Pro M2 - Asset #10892",
    access_privileges: "Production Database, AWS Console, Git Repo",
  });

  const [message, setMessage] = useState("");

  const fetchEmployees = () => {
    setLoading(true);
    getEmployees()
      .then((res) => {
        setEmployees(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to load employees", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(newEmp);
      setMessage("✅ Employee profile onboarded successfully!");
      setShowAddModal(false);
      fetchEmployees();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      alert("Failed to create employee: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleFlagEmployee = async (e) => {
    e.preventDefault();
    if (!flagReason) return;
    try {
      await flagEmployee(selectedEmpId, flagReason);
      setMessage(`🚩 Employee ${selectedEmpId} flagged for threat investigation!`);
      setShowFlagModal(false);
      setFlagReason("");
      fetchEmployees();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      alert("Failed to flag employee: " + (err.response?.data?.detail || err.message));
    }
  };

  // Filtered employees
  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = departmentFilter === "all" || emp.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  // Extract unique departments for filter dropdown
  const departments = Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));

  return (
    <Layout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="title-gradient" style={{ fontSize: 28 }}>
              Employee Identity & Asset Profiles
            </h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ Onboard Employee
          </button>
        </div>

        {message && (
          <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid var(--risk-low)", color: "var(--risk-low)", padding: "12px 16px", borderRadius: 8, fontSize: 14 }}>
            {message}
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="glass-panel" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search by Employee ID, Designation, or Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ width: 220 }}>
            <select
              className="input-field"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employee Directory Table */}
        <div className="glass-panel">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Reporting Manager</th>
                  <th>Device / Asset Info</th>
                  <th>Access Privileges</th>
                  <th>Security Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "var(--accent-cyan)" }}>
                      Loading Employee Directory...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                      No matching employee records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((emp) => (
                    <tr key={emp.id}>
                      <td style={{ fontWeight: 700 }}>
                        <span className="mono" style={{ color: "var(--accent-cyan)" }}>{emp.employee_id}</span>
                      </td>
                      <td>
                        <span className="badge badge-accent">{emp.department || "N/A"}</span>
                      </td>
                      <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{emp.designation || "N/A"}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{emp.manager || "Unassigned"}</td>
                      <td style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                        💻 {emp.device_info || "Standard Workstation"}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <span style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--accent-blue)", padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                          🔑 {emp.access_privileges || "Standard Access"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "4px 10px", fontSize: 12, borderColor: "var(--risk-critical)", color: "var(--risk-critical)" }}
                          onClick={() => {
                            setSelectedEmpId(emp.employee_id);
                            setShowFlagModal(true);
                          }}
                        >
                          🚩 Flag Entity
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Onboard Employee Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: 16, color: "var(--text-primary)" }}>Onboard New Employee Profile</h3>
            <form onSubmit={handleCreateEmployee}>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. EMP-9982"
                  value={newEmp.employee_id}
                  onChange={(e) => setNewEmp({ ...newEmp, employee_id: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Engineering / Finance / IT"
                  value={newEmp.department}
                  onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Senior Developer / System Admin"
                  value={newEmp.designation}
                  onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reporting Manager</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Manager Name"
                  value={newEmp.manager}
                  onChange={(e) => setNewEmp({ ...newEmp, manager: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Device Asset Info</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Laptop SN, Mobile ID, IP"
                  value={newEmp.device_info}
                  onChange={(e) => setNewEmp({ ...newEmp, device_info: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Access Privileges</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="DB Admin, AWS Root, Git Repo"
                  value={newEmp.access_privileges}
                  onChange={(e) => setNewEmp({ ...newEmp, access_privileges: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Employee Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag Employee Modal */}
      {showFlagModal && (
        <div className="modal-backdrop" onClick={() => setShowFlagModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, marginBottom: 12, color: "var(--risk-critical)" }}>🚩 Flag Entity for Threat Investigation</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
              Target Entity: <strong className="mono" style={{ color: "var(--accent-cyan)" }}>{selectedEmpId}</strong>
            </p>
            <form onSubmit={handleFlagEmployee}>
              <div className="form-group">
                <label className="form-label">Security Flag Justification / Reason</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Describe suspicious behavior (e.g. Excessive file downloads off-hours, unauthorized privilege escalation attempt)..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFlagModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Flag & Trigger Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}