import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    employee_id: "",
    department_id: "",
    designation: "",
    manager: "",
    device_information: "",
    access_privileges: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [allEmployeesRes, departmentsRes] = await Promise.all([
        api.get("/employee/all"),
        api.get("/department"),
      ]);

      setEmployees(allEmployeesRes.data);
      setDepartments(departmentsRes.data);

      try {
        const myProfileRes = await api.get("/employee/profile");
        const profile = myProfileRes.data.profile;
        setMyProfile(profile);
        setFormData({
          employee_id: profile.employee_id,
          department_id: profile.department_id,
          designation: profile.designation,
          manager: profile.manager,
          device_information: profile.device_information,
          access_privileges: profile.access_privileges,
        });
      } catch (err) {
        // No profile yet — that's fine, form stays empty for "create" mode
        setMyProfile(null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (myProfile) {
        await api.put("/employee/profile", {
          department_id: Number(formData.department_id),
          designation: formData.designation,
          manager: formData.manager,
          device_information: formData.device_information,
          access_privileges: formData.access_privileges,
        });
      } else {
        await api.post("/employee/profile", {
          ...formData,
          department_id: Number(formData.department_id),
        });
      }
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your employee profile?")) return;

    try {
      await api.delete("/employee/profile");
      setMyProfile(null);
      setFormData({
        employee_id: "",
        department_id: "",
        designation: "",
        manager: "",
        device_information: "",
        access_privileges: "",
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete profile");
    }
  };

  const departmentName = (id) => {
    const dept = departments.find((d) => d.id === id);
    return dept ? dept.name : id;
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ maxWidth: "900px", marginLeft: "240px", marginTop: "20px" }}>
      <Sidebar />
      <h2>Employees</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: "100%", marginBottom: "30px" }}>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Manager</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.employee_id}</td>
              <td>{departmentName(emp.department_id)}</td>
              <td>{emp.designation}</td>
              <td>{emp.manager}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{myProfile ? "My Profile (Edit)" : "Create My Profile"}</h3>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}
      >
        <input
          name="employee_id"
          placeholder="Employee ID"
          value={formData.employee_id}
          onChange={handleChange}
          disabled={!!myProfile}
          required
        />

        <select
          name="department_id"
          value={formData.department_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          name="designation"
          placeholder="Designation"
          value={formData.designation}
          onChange={handleChange}
          required
        />

        <input
          name="manager"
          placeholder="Manager"
          value={formData.manager}
          onChange={handleChange}
          required
        />

        <input
          name="device_information"
          placeholder="Device Information"
          value={formData.device_information}
          onChange={handleChange}
          required
        />

        <input
          name="access_privileges"
          placeholder="Access Privileges"
          value={formData.access_privileges}
          onChange={handleChange}
          required
        />

        <button type="submit">{myProfile ? "Update Profile" : "Create Profile"}</button>

        {myProfile && (
          <button type="button" onClick={handleDelete} style={{ color: "red" }}>
            Delete My Profile
          </button>
        )}
      </form>
    </div>
  );
}

export default EmployeePage;