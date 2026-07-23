import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";

function EmployeeManagement() {

    const [employees, setEmployees] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);

    const [employee, setEmployee] = useState({
        user_id: "",
        department: "",
        designation: "",
        manager: "",
        joining_date: "",
        phone: "",
        status: "Active"
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = () => {

        axios
            .get("http://127.0.0.1:5000/employees")
            .then((response) => {
                setEmployees(response.data);
            })
            .catch((error) => {
                console.error(error);
            });

    };

    const saveEmployee = () => {

        const request = editingEmployeeId
            ? axios.put(
                `http://127.0.0.1:5000/employees/${editingEmployeeId}`,
                employee
            )
            : axios.post(
                "http://127.0.0.1:5000/employees",
                employee
            );

        request
            .then(() => {

                alert(
                    editingEmployeeId
                        ? "Employee updated successfully!"
                        : "Employee added successfully!"
                );

                setShowForm(false);
                setEditingEmployeeId(null);

                setEmployee({
                    user_id: "",
                    department: "",
                    designation: "",
                    manager: "",
                    joining_date: "",
                    phone: "",
                    status: "Active"
                });

                fetchEmployees();

            })
            .catch((error) => {

                console.error(error);
                alert("Operation failed");

            });

    };

    const editEmployee = (emp) => {

        setEditingEmployeeId(emp.employee_id);

        setEmployee({
            user_id: emp.user_id,
            department: emp.department,
            designation: emp.designation,
            manager: emp.manager,
            joining_date: emp.joining_date,
            phone: emp.phone,
            status: emp.status
        });

        setShowForm(true);

    };

    return (

        <div className="flex min-h-screen bg-slate-100">

            <Sidebar role="Admin" />

            <div className="flex-1">

                <Navbar
                    name="Varshini"
                    role="Administrator"
                />

                <div className="p-8">

                    <div className="flex justify-between items-center mb-8">

                        <div>

                            <h1 className="text-3xl font-bold text-slate-800">
                                Employee Management
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Manage employee profiles, departments and roles.
                            </p>

                        </div>

                        <button
                            onClick={() => {

                                setEditingEmployeeId(null);

                                setEmployee({
                                    user_id: "",
                                    department: "",
                                    designation: "",
                                    manager: "",
                                    joining_date: "",
                                    phone: "",
                                    status: "Active"
                                });

                                setShowForm(true);

                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                        >
                            + Add Employee
                        </button>

                    </div>

                    <div className="bg-white rounded-xl shadow p-5 mb-6">

                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                    </div>

                    {showForm && (

                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">

                            <h2 className="text-xl font-bold mb-5">

                                {editingEmployeeId
                                    ? "Edit Employee"
                                    : "Add Employee"}

                            </h2>

                            <div className="grid grid-cols-2 gap-4">

                                <input
                                    type="number"
                                    placeholder="User ID"
                                    className="border p-3 rounded"
                                    value={employee.user_id}
                                    onChange={(e) =>
                                        setEmployee({
                                            ...employee,
                                            user_id: e.target.value
                                        })
                                    }
                                />

                                <input
                                    type="text"
                                    placeholder="Department"
                                    className="border p-3 rounded"
                                    value={employee.department}
                                    onChange={(e) =>
                                        setEmployee({
                                            ...employee,
                                            department: e.target.value
                                        })
                                    }
                                />

                                <input
                                    type="text"
                                    placeholder="Designation"
                                    className="border p-3 rounded"
                                    value={employee.designation}
                                    onChange={(e) =>
                                        setEmployee({
                                            ...employee,
                                            designation: e.target.value
                                        })
                                    }
                                />

                                <input
                                    type="text"
                                    placeholder="Manager"
                                    className="border p-3 rounded"
                                    value={employee.manager}
                                    onChange={(e) =>
                                        setEmployee({
                                            ...employee,
                                            manager: e.target.value
                                        })
                                    }
                                />

                                <input
                                    type="date"
                                    className="border p-3 rounded"
                                    value={employee.joining_date}
                                    onChange={(e) =>
                                        setEmployee({
                                            ...employee,
                                            joining_date: e.target.value
                                        })
                                    }
                                />

                                <input
                                    type="text"
                                    placeholder="Phone"
                                    className="border p-3 rounded"
                                    value={employee.phone}
                                    onChange={(e) =>
                                        setEmployee({
                                            ...employee,
                                            phone: e.target.value
                                        })
                                    }
                                />

                                <select
                                    className="border p-3 rounded"
                                    value={employee.status}
                                    onChange={(e) =>
                                        setEmployee({
                                            ...employee,
                                            status: e.target.value
                                        })
                                    }
                                >
                                    <option>Active</option>
                                    <option>Inactive</option>
                                </select>

                            </div>

                            <button
                                onClick={saveEmployee}
                                className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
                            >
                                {editingEmployeeId
                                    ? "Update Employee"
                                    : "Save Employee"}
                            </button>

                        </div>

                    )}

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                        <table className="w-full">

                            <thead className="bg-slate-800 text-white">

                                <tr>

                                    <th className="p-4 text-left">Employee ID</th>
                                    <th className="p-4 text-left">Name</th>
                                    <th className="p-4 text-left">Department</th>
                                    <th className="p-4 text-left">Role</th>
                                    <th className="p-4 text-left">Status</th>
                                    <th className="p-4 text-center">Actions</th>

                                </tr>

                            </thead>

                            <tbody>

                                {employees.map((emp) => (

                                    <tr key={emp.employee_id} className="border-b">

                                        <td className="p-4">{emp.employee_id}</td>

                                        <td className="p-4">
                                            {emp.name || "N/A"}
                                        </td>

                                        <td className="p-4">{emp.department}</td>

                                        <td className="p-4">{emp.designation}</td>

                                        <td className="p-4">
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                                {emp.status}
                                            </span>
                                        </td>

                                        <td className="p-4 text-center space-x-2">

                                            <button
                                                onClick={() => editEmployee(emp)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                                            >
                                                Edit
                                            </button>

                                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default EmployeeManagement;