function EmployeeTable({ employees, onEdit, onDelete }) {
  return (
    <div className="table-card">
      <table className="activity-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
            <th>Risk Score</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>{employee.employee_id}</td>
              <td>{employee.full_name}</td>
              <td>{employee.email}</td>
              <td>{employee.department}</td>
              <td>{employee.role}</td>
              <td>{employee.risk_score}</td>

              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => onEdit(employee)}
                >
                  ✏ Edit
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(employee)}
                >
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))}

          {employees.length === 0 && (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;