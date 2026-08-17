import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import "./index.css";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setLoggedIn(false);
  }

  if (loggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (showRegister) {
    return (
      <Register
        onRegistered={() => setShowRegister(false)}
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <Login
      onLoginSuccess={() => setLoggedIn(true)}
      onShowRegister={() => setShowRegister(true)}
    />
  );
}