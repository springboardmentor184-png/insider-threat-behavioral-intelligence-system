import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InvestigationsPage from './pages/InvestigationsPage';
import EmployeesPage from './pages/EmployeesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import BehaviorAnalyticsPage from './pages/BehaviorAnalyticsPage';
import ThreatDetectionPage from './pages/ThreatDetectionPages';
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import AlertsPage from './pages/AlertsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import UEBAPage from './pages/UEBAPage'; 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/investigations" element={<InvestigationsPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/behavior-analytics" element={<BehaviorAnalyticsPage />} />
        <Route path="/threat-detection" element={<ThreatDetectionPage />} />
        <Route path="/risk-intelligence" element={<RiskIntelligencePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/ueba" element={<UEBAPage />} />
      </Routes>
    </Router>
  );
}

export default App;