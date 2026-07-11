import api from "../services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";   // <-- Add this

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();   // <-- Add this HERE

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);

      navigate("/dashboard");

    } catch (error) {
      alert("Invalid email or password");
      console.error(error);
    }
  };


  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          width: "380px",
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>
          Insider Threat Behavioral Intelligence System
        </h2>

        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
          Employee Login
        </h3>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              marginBottom: "15px",
            }}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              marginBottom: "20px",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}