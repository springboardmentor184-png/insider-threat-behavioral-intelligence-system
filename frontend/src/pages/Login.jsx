import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import "../styles/Login.css";


function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await loginUser({
                email,
                password
            });

            if (response.access_token) {

                localStorage.setItem("token", response.access_token);
                localStorage.setItem("role", response.role);
                localStorage.setItem("name", response.user);

                navigate("/dashboard");

            } else {
                alert(response.detail || "Invalid Email or Password");
            }

        } catch (error) {
            alert("Unable to connect to server.");
            console.error(error);
        }
    };

    const googleLogin = () => {
        window.location.href =
            "http://127.0.0.1:8000/auth/google/login";
    };

    const microsoftLogin = () => {
        window.location.href =
            "http://127.0.0.1:8000/auth/microsoft/login";
    };

    return (
        <div className="login-container">

            <div className="login-card">

                <div className="login-header">
                    <h1>Insider Threat Behavioral Intelligence System</h1>
                    <p>Secure Login Portal</p>
                </div>

                <form onSubmit={handleLogin}>

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="login-btn"
                    >
                        Login
                    </button>

                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <button
                    className="google-btn"
                    onClick={googleLogin}
                >
                    Continue with Google
                </button>

                <button
                    className="microsoft-btn"
                    onClick={microsoftLogin}
                >
                    Continue with Microsoft
                </button>

                <p className="register-link">
                    Don't have an account?
                    <Link to="/register"> Register</Link>
                </p>

            </div>

        </div>
    );
}

export default Login;