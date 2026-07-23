import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Security Analyst",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      await api.post("/register", form);
      alert("Registration Successful");
      navigate("/");
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div style={{ width: "350px", margin: "100px auto", display: "flex", flexDirection: "column", gap: "15px" }}>
      <h2>Register</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />

      <select name="role" onChange={handleChange}>
        <option value="Security Analyst">Security Analyst</option>
        <option value="SOC Engineer">SOC Engineer</option>
        <option value="Security Manager">Security Manager</option>
        <option value="Administrator">Administrator</option>
      </select>

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;