import { useEffect, useState } from "react";
import {
  createEmployee,
  updateEmployee,
} from "../services/employeeService";

function EmployeeForm({ employee, onEmployeeAdded, onClose }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
    role: "",
    risk_score: "",
  });

  // Fill form when editing
  useEffect(() => {
    if (employee) {
      setFormData({
        employee_id: employee.employee_id,
        full_name: employee.full_name,
        email: employee.email,
        department: employee.department,
        role: employee.role,
        risk_score: employee.risk_score,
      });
    } else {
      setFormData({
        employee_id: "",
        full_name: "",
        email: "",
        department: "",
        role: "",
        risk_score: "",
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const employeeData = {
        ...formData,
        risk_score: Number(formData.risk_score),
      };

      if (employee) {
        await updateEmployee(employee.id, employeeData);
        alert("Employee updated successfully!");
      } else {
        await createEmployee(employeeData);
        alert("Employee added successfully!");
      }

      onEmployeeAdded();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Operation failed.");
    }
  };

  return (
    <div className="card shadow p-4 mb-4">
      <h4 className="mb-4">
        {employee ? "Edit Employee" : "Add New Employee"}
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="row">

          <div className="col-md-6 mb-3">
            <label>Employee ID</label>
            <input
              className="form-control"
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Full Name</label>
            <input
              className="form-control"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Department</label>
            <input
              className="form-control"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Role</label>
            <input
              className="form-control"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6 mb-3">
            <label>Risk Score</label>
            <input
              type="number"
              className="form-control"
              name="risk_score"
              value={formData.risk_score}
              onChange={handleChange}
              min="0"
              max="100"
              required
            />
          </div>

        </div>

        <div className="d-flex gap-2">

          <button
            type="submit"
            className="btn btn-primary"
          >
            {employee ? "Update Employee" : "Save Employee"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;