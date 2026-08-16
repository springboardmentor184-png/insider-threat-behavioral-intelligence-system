import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import IncidentDetails from './components/IncidentDetails';
import EmailInbox from './components/EmailInbox';
import Simulator from './components/Simulator';
import Employees from './components/Employees';
import EmployeeDetails from './components/EmployeeDetails';
import ActivityLogs from './components/ActivityLogs';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Login from './components/Login';
import { BellRing, ShieldAlert, Check } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Fetch dashboard metrics
  const fetchDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const res = await fetch('http://localhost:8000/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const res = await fetch('http://localhost:8000/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (e) {
      console.error("Error loading alerts:", e);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Load telemetry data on mount
  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
  }, []);

  // Show a toast message
  const addToast = (message, severity) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, severity }]);
    
    // Auto-remove toast after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, 6000);
  };

  // Handler when a simulation runs successfully
  const handleSimulationTrigger = (scenario, response) => {
    // Refresh backend telemetry data
    fetchDashboardData();
    fetchAlerts();
    
    if (scenario === 'reset') {
      addToast("Database telemetry successfully reset to seed state.", "success");
    } else {
      const details = response.details;
      if (details && details.alert_triggered) {
        addToast(
          `⚠️ ALERT GENERATED: ${details.alert_severity} Threat detected! Email notification sent to manager.`, 
          details.alert_severity.toLowerCase()
        );
      }
    }
  };

  // View specific incident
  const handleViewIncident = (alertId) => {
    setSelectedIncidentId(alertId);
    setCurrentTab('incident-details');
  };

  // Render correct content tab
  const renderTabContent = () => {
    switch (currentTab) {
case 'dashboard':
  return (
    <Dashboard 
      data={dashboardData} 
      alerts={alerts}
      loading={loadingDashboard}
      setCurrentTab={setCurrentTab}
      onViewEmployee={(employeeId) => {
        setSelectedEmployeeId(employeeId);
        setCurrentTab('employee-details');
      }}
    />
  );
      case 'alerts':
        return (
          <Alerts 
            alerts={alerts} 
            loading={loadingAlerts} 
            onRefresh={fetchAlerts}
            onViewIncident={handleViewIncident}
          />
        );
      case 'incident-details':
        return (
          <IncidentDetails 
            alertId={selectedIncidentId} 
            onBack={() => {
              setSelectedIncidentId(null);
              setCurrentTab('alerts');
            }}
          />
        );
      case 'inbox':
        return (
          <EmailInbox 
            onViewIncident={handleViewIncident}
          />
        );
      case 'simulator':
        return (
          <Simulator 
            onSimulationTriggered={handleSimulationTrigger}
          />
        );
case 'employees':
  return (
    <Employees
      onViewEmployee={(employeeId) => {
        setSelectedEmployeeId(employeeId);
        setCurrentTab('employee-details');
      }}
    />
  );
  case 'employee-details':
  return (
    <EmployeeDetails
      employeeId={selectedEmployeeId}
      onBack={() => {
        setSelectedEmployeeId(null);
        setCurrentTab('employees');
      }}
    />
  );
  case 'logs':
  return (
    <ActivityLogs />
  );
  case 'profile':
  return (
    <Profile user={user} />
  );
  case 'settings':
  return (
    <Settings />
  );
      default:
        return <div style={{ padding: '20px' }}>Tab coming soon...</div>;
    }
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} onLogout={() => setUser(null)} />

      {/* Main Layout Content */}
      <div className="main-wrapper">
        <Header
  user={user}
  onSearchEmployee={(employeeId) => {
    setSelectedEmployeeId(employeeId);
    setCurrentTab('employee-details');
  }}
  onSearchAlert={(alertId) => {
    setSelectedIncidentId(alertId);
    setCurrentTab('incident-details');
  }}
/>
        <main className="page-container">
          {renderTabContent()}
        </main>
      </div>

      {/* Slide-in Notifications/Toasts */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast" style={{ borderLeft: `4px solid ${toast.severity === 'critical' ? '#ef4444' : toast.severity === 'high' ? '#f97316' : '#22c55e'}` }}>
            <div className={`toast-icon ${toast.severity}`}>
              {toast.severity === 'critical' ? (
                <ShieldAlert size={20} />
              ) : toast.severity === 'high' ? (
                <ShieldAlert size={20} />
              ) : (
                <Check size={20} />
              )}
            </div>
            <div style={{ flex: 1 }}>{toast.message}</div>
            <button 
              onClick={() => setToasts((prev) => prev.filter(t => t.id !== toast.id))}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
