import { BrowserRouter, Routes, Route } from "react-router-dom";

// Authentication Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Activitylogs from "./pages/Activitylogs";
import Employees from "./pages/Employees";
import Analytics from "./pages/Analytics";
import ThreatAlerts from "./pages/ThreatAlerts";
import Settings from "./pages/Settings";
import Prediction from "./pages/Prediction";

// Protected Route
import ProtectedRoute from "./components/ProtectedRoute";

// Error Page
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Employees */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Activity Logs */}
        <Route
          path="/activitylogs"
          element={
            <ProtectedRoute>
              <Activitylogs />
            </ProtectedRoute>
          }
        />

        {/* Threat Alerts */}
        <Route
          path="/threatalerts"
          element={
            <ProtectedRoute>
              <ThreatAlerts />
            </ProtectedRoute>
          }
        />

        {/* AI Prediction */}
        <Route
          path="/prediction"
          element={
            <ProtectedRoute>
              <Prediction />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;