import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./assets/components/ProtectedRoute";

import OAuthSuccess from "./pages/OAuthSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Alerts from "./pages/Alerts";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Employees from "./pages/Employees";
import Notifications from "./pages/Notifications";
import Investigations from "./pages/Investigations";
import UEBA from "./pages/UEBA";
import Risk from "./pages/Risk";
import Activity from "./pages/Activity";

const ANALYST_ROLES = [
    "Administrator",
    "Security Manager",
    "SOC Engineer",
    "Security Analyst"
];

const ADMIN_ONLY = ["Administrator"];

const ADMIN_AND_MANAGER = [
    "Administrator",
    "Security Manager"
];

function AppRoutes() {
    return (
        <Routes>

            {/* Public routes */}
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            <Route
                path="/oauth-success"
                element={<OAuthSuccess />}
            />

            {/* Protected — any logged-in user */}
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

            <Route
                path="/notifications"
                element={
                    <ProtectedRoute>
                        <Notifications />
                    </ProtectedRoute>
                }
            />

            {/* Protected — analyst-level roles only */}
            <Route
                path="/alerts"
                element={
                    <ProtectedRoute allowedRoles={ANALYST_ROLES}>
                        <Alerts />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/reports"
                element={
                    <ProtectedRoute allowedRoles={ANALYST_ROLES}>
                        <Reports />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/employees"
                element={
                    <ProtectedRoute allowedRoles={ANALYST_ROLES}>
                        <Employees />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/investigations"
                element={
                    <ProtectedRoute allowedRoles={ANALYST_ROLES}>
                        <Investigations />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ueba"
                element={
                    <ProtectedRoute allowedRoles={ANALYST_ROLES}>
                        <UEBA />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/risk"
                element={
                    <ProtectedRoute allowedRoles={ANALYST_ROLES}>
                        <Risk />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/activity"
                element={
                    <ProtectedRoute allowedRoles={ANALYST_ROLES}>
                        <Activity />
                    </ProtectedRoute>
                }
            />

            {/* Protected — Admin only */}
            <Route
                path="/users"
                element={
                    <ProtectedRoute allowedRoles={ADMIN_ONLY}>
                        <Users />
                    </ProtectedRoute>
                }
            />

            {/* Catch-all */}
            <Route
                path="*"
                element={<NotFound />}
            />

        </Routes>
    );
}

export default AppRoutes;