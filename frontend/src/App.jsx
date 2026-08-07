import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";

import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AnalystDashboard from "./pages/AnalystDashboard";
import SocDashboard from "./pages/SocDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

import EmployeeManagement from "./pages/EmployeeManagement";
import ThreatDetection from "./pages/ThreatDetection";
import Reports from "./pages/Reports";
import Investigations from "./pages/Investigations";
import ThreatNotifications from "./pages/ThreatNotifications";
import RiskAnalytics from "./pages/RiskAnalytics";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Authentication */}

                <Route
                    path="/"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Dashboards */}

                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/manager"
                    element={<ManagerDashboard />}
                />

                <Route
                    path="/analyst"
                    element={<AnalystDashboard />}
                />

                <Route
                    path="/soc"
                    element={<SocDashboard />}
                />

                <Route
                    path="/employee"
                    element={<EmployeeDashboard />}
                />

                {/* Management */}

                <Route
                    path="/employees"
                    element={<EmployeeManagement />}
                />

                {/* Threat Detection */}

                <Route
                    path="/threat-detection"
                    element={<ThreatDetection />}
                />
                <Route
    path="/notifications"
    element={<ThreatNotifications />}
/>
<Route
    path="/analytics"
    element={<RiskAnalytics />}
/>

                {/* Investigation Workflow */}

                <Route
                    path="/investigations"
                    element={<Investigations />}
                />

                {/* Reports */}

                <Route
                    path="/reports"
                    element={<Reports />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;