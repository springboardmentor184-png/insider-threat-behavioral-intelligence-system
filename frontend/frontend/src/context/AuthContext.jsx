import { createContext, useContext, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    const response = await api.post("/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const newToken = response.data.access_token;
    setToken(newToken);
    localStorage.setItem("token", newToken);
    await fetchProfile(newToken);
    return newToken;
  };

  const register = async (fullName, email, password, role) => {
    await api.post("/register", {
      full_name: fullName,
      email,
      password,
      role,
    });
  };

  const fetchProfile = async (overrideToken) => {
    const activeToken = overrideToken || token;
    if (!activeToken) return null;

    const response = await api.get("/me", {
      headers: { Authorization: `Bearer ${activeToken}` },
    });
    setUser(response.data);
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, fetchProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
