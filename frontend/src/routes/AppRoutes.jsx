import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import Profile from "../pages/Profile";
import Register from "../pages/Register";
import GoogleSuccess from "../pages/GoogleSuccess";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/google-success" element={<GoogleSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;