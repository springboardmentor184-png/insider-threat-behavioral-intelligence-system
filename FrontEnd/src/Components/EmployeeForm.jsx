import React, { useState } from "react";
import axios from "axios";

const EmployeeForm = () => {
    const [form, setForm] = useState({
        employee_id: "",
        name: "",
        department: "",
        designation: "",
        manager: "",
        device_info: "",
        access_privileges: ""
    });

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.post("http://localhost:8000/employees", form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Employee added!");
        } catch (err) {
            alert("Error adding employee: " + err.message);
        }
    };

    return (
        <div>
            <h2>Add Employee</h2>
            {Object.keys(form).map((key) => (
                <input
                    key={key}
                    placeholder={key}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
            ))}
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
};

export default EmployeeForm;
