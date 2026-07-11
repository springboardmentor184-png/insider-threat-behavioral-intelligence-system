import { useEffect, useState } from "react";
import api from "../services/api";

export default function Employees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const response = await api.get("/employees/");
        setEmployees(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    loadEmployees();
  }, []);

  return (
    <div>
      <h1>Employees</h1>

      <table
        border="1"
        cellPadding="10"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.full_name}</td>
              <td>{emp.email}</td>
              <td>{emp.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}