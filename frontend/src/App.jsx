import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import "./index.css";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setLoggedIn(false);
  }

  return loggedIn ? (
    <Dashboard onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={() => setLoggedIn(true)} />
  );
}