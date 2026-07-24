import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";

function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDepartments = async () => {
    try {
      const res = await api.get("/department");
      setDepartments(res.data);
    } catch (err) {
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/department", { name, description });
      setName("");
      setDescription("");
      await loadDepartments();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create department");
    }
  };

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ maxWidth: "700px", marginLeft: "240px", marginTop: "20px" }}>
      <Sidebar />
      <h2>Departments</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" cellPadding="8" style={{ width: "100%", marginBottom: "30px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{d.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Create Department</h3>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}
      >
        <input
          placeholder="Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Create Department</button>
      </form>
    </div>
  );
}

export default DepartmentPage;