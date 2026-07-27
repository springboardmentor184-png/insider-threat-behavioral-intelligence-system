import { useEffect, useState } from "react";
import { getEmployees } from "../services/employeeService";

function ActivityTable() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();

      // Show Top 5 High-Risk Employees
      const topRiskEmployees = data
        .filter((employee) => employee.risk_score > 0)
        .sort((a, b) => b.risk_score - a.risk_score)
        .slice(0, 5);

      setEmployees(topRiskEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score <= 20) return "Low";
    if (score <= 60) return "Medium";
    return "High";
  };

  if (loading) {
    return (
      <div className="table-card">
        <h4>Top High-Risk Employees</h4>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <h4>🚨 Top 5 High-Risk Employees</h4>

      <table className="activity-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Role</th>
            <th>Risk Score</th>
            <th>Risk Level</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.employee_id}</td>
              <td>{employee.full_name}</td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>

              <td>
                <strong>{employee.risk_score}</strong>
              </td>

              <td>
                <span
                  className={`badge badge-${getRiskLevel(
                    employee.risk_score
                  ).toLowerCase()}`}
                >
                  {getRiskLevel(employee.risk_score)}
                </span>
              </td>
            </tr>
          ))}

          {employees.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityTable;