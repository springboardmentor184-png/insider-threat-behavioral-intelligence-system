import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  const handleGoogleLogin = () => {
    window.location.href = "http://127.0.0.1:8000/auth/google/login";
  };


  const handleLogin = async () => {
    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      localStorage.setItem(
        "token",
        response.data.access_token
      );
      console.log(response.data);
      console.log("Token saved!");
      navigate("/dashboard");


    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div
      style={{
        width: "350px",
        margin: "100px auto",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      <button onClick={handleGoogleLogin}>
        Login with Google
      </button>

      <Link to="/register">
        <button>Create Account</button>
      </Link>
    </div>
  );
}

export default Login;