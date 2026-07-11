import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role_name: "", 
    department: "",
    designation: ""
  });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/register", form, {
        headers: { "Content-Type": "application/json" } 
      });
      alert("Registered!");
      navigate("/login"); 
    } catch (err) {
      if (err.response && err.response.data.detail) {
        alert("Registration failed: " + err.response.data.detail);
      } else {
        alert("Registration failed: " + err.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            required
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="Gmail"
            value={form.email}
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            required
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <select
            value={form.role_name}
            required
            onChange={(e) => setForm({ ...form, role_name: e.target.value })}
          >
            <option value="">Select Role</option>
            <option value="Security Analyst">Security Analyst</option>
            <option value="SOC Engineer">SOC Engineer</option>
            <option value="Security Manager">Security Manager</option>
            <option value="Administrator">Administrator</option>
            <option value="Employee">Employee</option>
          </select>
          <button type="submit">Submit</button>
        </form>

        <p className="account-text">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
