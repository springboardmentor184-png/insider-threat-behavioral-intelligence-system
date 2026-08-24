import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./assets/components/ProtectedRoute";
import AppLayout from "./assets/components/AppLayout";

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
    "Security Analyst",
];

const ADMIN_ONLY = ["Administrator"];

function withLayout(Component, allowedRoles) {
    return (
        <ProtectedRoute allowedRoles={allowedRoles}>
            <AppLayout>
                <Component />
            </AppLayout>
        </ProtectedRoute>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            <Route path="/dashboard" element={withLayout(Dashboard)} />
            <Route path="/profile" element={withLayout(Profile)} />
            <Route path="/notifications" element={withLayout(Notifications)} />

            <Route
                path="/alerts"
                element={withLayout(Alerts, ANALYST_ROLES)}
            />

            <Route
                path="/reports"
                element={withLayout(Reports, ANALYST_ROLES)}
            />

            <Route
                path="/employees"
                element={withLayout(Employees, ANALYST_ROLES)}
            />

            <Route
                path="/investigations"
                element={withLayout(Investigations, ANALYST_ROLES)}
            />

            <Route
                path="/ueba"
                element={withLayout(UEBA, ANALYST_ROLES)}
            />

            <Route
                path="/risk"
                element={withLayout(Risk, ANALYST_ROLES)}
            />

            <Route
                path="/activity"
                element={withLayout(Activity, ANALYST_ROLES)}
            />

            <Route
                path="/users"
                element={withLayout(Users, ADMIN_ONLY)}
            />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;