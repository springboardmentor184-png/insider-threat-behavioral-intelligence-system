import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";
import "../styles/Register.css";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        department: ""
    });
    

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {

            const response = await registerUser({
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                department: formData.department
            });

            if (response.message || response.success) {
                alert("Registration Successful");
                navigate("/login");
            } else {
                alert(response.detail || "Registration Failed");
            }

        } catch (error) {
            alert("Unable to connect to server.");
            console.error(error);
        }
    };

    return (

        <div className="register-container">

            <div className="register-card">

                <div className="register-header">
                    <h1>Insider Threat Behavioral Intelligence System</h1>
                    <p>Create Your Account</p>
                </div>

                <form onSubmit={handleSubmit}>

                    <label>Full Name</label>

                    <input
                        type="text"
                        name="full_name"
                        placeholder="Enter Full Name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />

                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <label>Role</label>

                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Security Manager">Security Manager</option>
                        <option value="SOC Engineer">SOC Engineer</option>
                        <option value="Security Analyst">Security Analyst</option>
                    </select>

                    <label>Department</label>

                    <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Department</option>
                        <option value="Information Technology">Information Technology (IT)</option>
                        <option value="Human Resources">Human Resources (HR)</option>
                        <option value="Finance">Finance</option>
                        <option value="Security Operations Center">Security Operations Center (SOC)</option>
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="Network Operations">Network Operations</option>
                        <option value="Cloud Operations">Cloud Operations</option>
                        <option value="Software Development">Software Development</option>
                        <option value="System Administration">System Administration</option>
                        <option value="Legal">Legal</option>
                        <option value="Administration">Administration</option>
                    </select>

                    <button
                        type="submit"
                        className="register-btn"
                    >
                        Register
                    </button>

                </form>

                <p className="login-link">
                    Already have an account?
                    <Link to="/login"> Login</Link>
                </p>

            </div>

        </div>

    );
}

export default Register;