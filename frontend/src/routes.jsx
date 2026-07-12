import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import OAuthSuccess from "./pages/OAuthSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";


function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/users" element={<Users />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
        </Routes>
    );
}

export default AppRoutes;