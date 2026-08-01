import React, { useState, useEffect } from 'react';
import api from './api';
import { 
  Shield, Users, AlertTriangle, FileText, Settings, LogOut, 
  RefreshCw, Play, Download, Search, CheckCircle, Clock, 
  User, Database, Lock, Key, Mail, Building, Plus, FileSpreadsheet, Eye
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // App Data States
  const [dashboardStats, setDashboardStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [employeeTimeline, setEmployeeTimeline] = useState([]);

  // Auth Forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('Security Analyst');
  const [isRegistering, setIsRegistering] = useState(false);

  // Profile Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // New Incident Form
  const [showNewIncidentModal, setShowNewIncidentModal] = useState(false);
  const [newIncidentTitle, setNewIncidentTitle] = useState('');
  const [newIncidentDesc, setNewIncidentDesc] = useState('');
  const [newIncidentSeverity, setNewIncidentSeverity] = useState('High');
  const [newIncidentEmpId, setNewIncidentEmpId] = useState('');

  // Evidence Form
  const [evidenceText, setEvidenceText] = useState('');

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data);
      // Default initial tab based on role
      if (res.data.role === 'Administrator') setActiveTab('admin');
      else if (res.data.role === 'Security Manager') setActiveTab('dashboard');
      else if (res.data.role === 'SOC Engineer') setActiveTab('soc');
      else setActiveTab('dashboard');
    } catch (err) {
      handleLogout();
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'dashboard' || activeTab === 'soc') {
        const statsRes = await api.get('/dashboard');
        setDashboardStats(statsRes.data);
        
        const alertsRes = await api.get('/alerts');
        setAlerts(alertsRes.data);
      }
      
      if (activeTab === 'employees') {
        const empRes = await api.get('/employees');
        setEmployees(empRes.data);
      }
      
      if (activeTab === 'incidents') {
        const incRes = await api.get('/incidents');
        setIncidents(incRes.data);
      }
      
      if (activeTab === 'admin') {
        const auditRes = await api.get('/audit-logs');
        setAuditLogs(auditRes.data);
      }
    } catch (err) {
      setError('Failed to fetch data from system services.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Step 1: standard oauth2 password request form
      const formData = new FormData();
      formData.append('username', loginEmail);
      formData.append('password', loginPassword);

      const res = await api.post('/auth/login', formData);
      const data = res.data;

      if (!data.is_verified) {
        // Need OTP Verification
        setOtpSent(true);
        // Request OTP to be sent
        await api.post('/auth/request-otp', { email: loginEmail });
        setSuccess('An OTP has been sent to your email.');
      } else {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setSuccess('Logged in successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const verifyRes = await api.post('/auth/verify-otp', {
        email: loginEmail,
        otp: otpCode
      });

      if (verifyRes.data.success) {
        // Now login again to get the token
        const formData = new FormData();
        formData.append('username', loginEmail);
        formData.append('password', loginPassword);
        const loginRes = await api.post('/auth/login', formData);
        localStorage.setItem('token', loginRes.data.access_token);
        setToken(loginRes.data.access_token);
        setSuccess('Verification successful! Logged in.');
        setOtpSent(false);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: registerUsername,
        email: registerEmail,
        full_name: registerFullName,
        password: registerPassword,
        role: registerRole
      });
      setSuccess('Account created successfully! Please log in.');
      setIsRegistering(false);
      // Reset fields
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterFullName('');
      setRegisterPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    setDashboardStats(null);
    setAlerts([]);
    setEmployees([]);
    setIncidents([]);
    setAuditLogs([]);
    setSelectedIncident(null);
    setSelectedEmployee(null);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.put('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password.');
    }
  };

  // Seeding and ML Actions
  const runSeedTelemetry = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ml/seed-telemetry');
      setSuccess(res.data.message);
      loadData();
    } catch (err) {
      setError('Failed to seed telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const runAnomalyScan = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ml/detect-anomalies');
      setSuccess(res.data.message);
      // Automatically recalculate risk scores
      await api.post('/ml/recalculate-risk');
      loadData();
    } catch (err) {
      setError('Anomaly scan failed.');
    } finally {
      setLoading(false);
    }
  };

  const runRiskRecalculation = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ml/recalculate-risk');
      setSuccess(res.data.message);
      loadData();
    } catch (err) {
      setError('Risk recalculation failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectEmployeeProfile = async (emp) => {
    setSelectedEmployee(emp);
    setLoading(true);
    try {
      // Get all activities for the employee
      const res = await api.get('/activity');
      const filtered = res.data.filter(a => a.performed_by === emp.email);
      setEmployeeTimeline(filtered);
    } catch (err) {
      setError('Failed to load employee timeline.');
    } finally {
      setLoading(false);
    }
  };

  const selectIncidentInvestigation = async (incident) => {
    setSelectedIncident(incident);
    setLoading(true);
    try {
      const res = await api.get(`/incidents/${incident.id}/timeline`);
      setEmployeeTimeline(res.data);
    } catch (err) {
      setError('Failed to load incident activities.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/incidents', {
        title: newIncidentTitle,
        description: newIncidentDesc,
        severity: newIncidentSeverity,
        employee_id: newIncidentEmpId
      });
      setSuccess('Investigation incident created successfully!');
      setShowNewIncidentModal(false);
      setNewIncidentTitle('');
      setNewIncidentDesc('');
      setNewIncidentEmpId('');
      if (activeTab === 'incidents') {
        setIncidents([res.data, ...incidents]);
      }
    } catch (err) {
      setError('Failed to create incident.');
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceText) return;
    try {
      const res = await api.post(`/incidents/${selectedIncident.id}/evidence`, null, {
        params: { evidence_text: evidenceText }
      });
      setSelectedIncident(res.data);
      setEvidenceText('');
      setSuccess('Evidence logged.');
    } catch (err) {
      setError('Failed to log evidence.');
    }
  };

  const handleCloseIncident = async (incidentId) => {
    try {
      const res = await api.put(`/incidents/${incidentId}`, {
        status: 'Closed'
      });
      setSuccess('Incident closed.');
      if (selectedIncident && selectedIncident.id === incidentId) {
        setSelectedIncident(res.data);
      }
      loadData();
    } catch (err) {
      setError('Failed to update incident.');
    }
  };

  const handleResolveAlert = async (alertId, notes) => {
    try {
      await api.put(`/alerts/${alertId}`, {
        status: 'Resolved',
        resolution_notes: notes || 'Resolved by Analyst'
      });
      setSuccess('Alert marked as resolved.');
      loadData();
    } catch (err) {
      setError('Failed to resolve alert.');
    }
  };

  const handleExportCSV = (type) => {
    window.open(`http://localhost:8000/reports/export/${type}?token=${token}`, '_blank');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a13] px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#070a13] to-[#070a13] -z-10" />
        <div className="w-full max-w-md glass-panel p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500" />
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 mb-2">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-outfit">
              Insider Threat behavioral Intelligence
            </h1>
            <p className="text-sm text-slate-400">
              Enterprise User & Entity Behavior Analytics (UEBA)
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}

          {!isRegistering ? (
            // Login Form
            <form onSubmit={otpSent ? handleVerifyOtp : handleLogin} className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="analyst@company.com" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input 
                        type="password" 
                        required
                        className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="••••••••" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-500/10 transition duration-200 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : 'Authenticate'}
                  </button>
                </>
              ) : (
                <>
                  <div className="space-y-1 text-center">
                    <p className="text-sm text-slate-300">
                      Enter the 6-digit OTP code sent to your email to verify identity.
                    </p>
                    <div className="relative mt-2">
                      <Key className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        maxLength={6}
                        required
                        className="w-full pl-10 pr-4 py-2 tracking-widest text-center text-lg font-mono bg-slate-900/60 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                        placeholder="000000" 
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg transition duration-200"
                  >
                    Verify & Login
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setOtpSent(false)}
                    className="w-full text-xs text-slate-400 hover:text-white transition"
                  >
                    Back to Login
                  </button>
                </>
              )}

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Don't have an account? </span>
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(true)}
                  className="text-xs text-cyan-400 font-semibold hover:underline"
                >
                  Register Here
                </button>
              </div>
            </form>
          ) : (
            // Registration Form
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Username</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white text-sm"
                    placeholder="sarah_analyst"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Role</label>
                  <select 
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/50 rounded-lg text-white text-sm"
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value)}
                  >
                    <option value="Security Analyst">Security Analyst</option>
                    <option value="SOC Engineer">SOC Engineer</option>
                    <option value="Security Manager">Security Manager</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white text-sm"
                  placeholder="Sarah Analyst"
                  value={registerFullName}
                  onChange={(e) => setRegisterFullName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white text-sm"
                  placeholder="sarah@company.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full px-3 py-1.5 bg-slate-900/60 border border-slate-700/50 rounded-lg text-white text-sm"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold rounded-lg transition duration-200"
              >
                Register Account
              </button>

              <div className="text-center">
                <span className="text-xs text-slate-400">Already registered? </span>
                <button 
                  type="button" 
                  onClick={() => setIsRegistering(false)}
                  className="text-xs text-cyan-400 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#070a13]">
      {/* Sidebar Navigation */}
      <aside className="w-64 glass-panel m-4 mr-0 p-5 flex flex-col justify-between border-r border-slate-800">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white leading-tight font-outfit text-sm">Insider Threat</h2>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">UEBA Intel Platform</span>
            </div>
          </div>

          {/* User Profile Badge */}
          {user && (
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white">
                {user.full_name?.charAt(0) || user.username?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user.full_name}</p>
                <span className="text-[9px] text-cyan-400 uppercase font-mono">{user.role}</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {user?.role !== 'Administrator' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'dashboard' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-900/30'}`}
              >
                <Database size={16} />
                Analyst Dashboard
              </button>
            )}

            {user?.role === 'SOC Engineer' || user?.role === 'Administrator' ? (
              <button 
                onClick={() => setActiveTab('soc')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'soc' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-900/30'}`}
              >
                <RefreshCw size={16} />
                SOC Command
              </button>
            ) : null}

            <button 
              onClick={() => setActiveTab('employees')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'employees' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-900/30'}`}
            >
              <Users size={16} />
              Employee Registry
            </button>

            <button 
              onClick={() => setActiveTab('incidents')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'incidents' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-900/30'}`}
            >
              <AlertTriangle size={16} />
              Investigations
            </button>

            {user?.role === 'Administrator' && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'admin' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-900/30'}`}
              >
                <Settings size={16} />
                System Admin
              </button>
            )}

            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'profile' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' : 'text-slate-400 hover:text-white hover:bg-slate-900/30'}`}
            >
              <User size={16} />
              Profile Settings
            </button>
          </nav>
        </div>

        {/* Log Out */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={16} />
          Term Session
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col m-4 overflow-hidden">
        {/* Top Header */}
        <header className="glass-panel p-4 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-white font-outfit capitalize">{activeTab} Console</h1>
            {loading && <RefreshCw className="animate-spin text-cyan-400" size={16} />}
          </div>
          
          {/* Quick Triggers */}
          <div className="flex items-center gap-2">
            {(user?.role === 'Administrator' || user?.role === 'Security Manager') && (
              <button 
                onClick={runSeedTelemetry}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Database size={13} />
                Seed Telemetry
              </button>
            )}
            
            {user?.role !== 'Security Analyst' && (
              <button 
                onClick={runAnomalyScan}
                className="px-3 py-1.5 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Play size={13} />
                Scan Anomalies
              </button>
            )}

            <button 
              onClick={loadData}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-700/50 rounded-lg transition"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        {/* Global Notifications */}
        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-xs mb-4 flex justify-between items-center animate-pulse">
            <span>{error}</span>
            <button onClick={() => setError('')} className="hover:text-white">✕</button>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/15 border border-green-500/30 rounded-xl text-green-400 text-xs mb-4 flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="hover:text-white">✕</button>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* ANALYST / MANAGER DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Panel */}
              {dashboardStats && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Identities Logged</span>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-3xl font-extrabold text-white font-outfit">{dashboardStats.total_employees}</span>
                      <span className="text-xs text-green-400 flex items-center font-semibold">{dashboardStats.active_employees} Active</span>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                  </div>
                  
                  <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Threat Alerts</span>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-3xl font-extrabold text-white font-outfit">{alerts.length}</span>
                      <span className="text-xs text-orange-400 font-semibold">{alerts.filter(a => a.status === 'Open').length} Open</span>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl" />
                  </div>

                  <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Critical Risk Scores</span>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-3xl font-extrabold text-red-500 font-outfit">
                        {employees.filter(e => e.risk_score >= 80).length || alerts.filter(a => a.severity === 'Critical').length}
                      </span>
                      <span className="text-xs text-red-400 font-semibold">Immediate Review</span>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
                  </div>

                  <div className="glass-panel p-4 flex flex-col justify-between relative overflow-hidden">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Audit logs</span>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-3xl font-extrabold text-purple-400 font-outfit">{dashboardStats.total_audit_logs}</span>
                      <span className="text-xs text-slate-400">Total Entries</span>
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
                  </div>
                </div>
              )}

              {/* Central Dashboard grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Visual Chart - Risk Posture */}
                <div className="glass-panel p-5 col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white font-outfit">Organizational Risk Distribution</h3>
                    <div className="flex gap-2">
                      <button onClick={() => handleExportCSV('risk')} className="p-1.5 bg-slate-900 border border-slate-700/50 hover:bg-slate-800 rounded-lg text-cyan-400 flex items-center gap-1 text-[10px] font-semibold transition">
                        <Download size={12} /> CSV Risk
                      </button>
                      <button onClick={() => handleExportCSV('alerts')} className="p-1.5 bg-slate-900 border border-slate-700/50 hover:bg-slate-800 rounded-lg text-cyan-400 flex items-center gap-1 text-[10px] font-semibold transition">
                        <Download size={12} /> CSV Alerts
                      </button>
                    </div>
                  </div>
                  
                  {/* Custom SVG Bar Chart representing risk posture */}
                  <div className="h-56 flex flex-col justify-between pt-4">
                    <div className="flex items-end justify-around h-44 border-b border-slate-800 pb-2">
                      {/* Low Risk bar */}
                      <div className="flex flex-col items-center gap-2 w-16">
                        <span className="text-xs font-bold text-slate-300">45%</span>
                        <div className="w-12 bg-green-500/20 border-t-2 border-green-500 rounded-t-md hover:bg-green-500/30 transition-all duration-500" style={{height: '80px'}}></div>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">Low (&lt;30)</span>
                      </div>
                      {/* Medium Risk bar */}
                      <div className="flex flex-col items-center gap-2 w-16">
                        <span className="text-xs font-bold text-slate-300">30%</span>
                        <div className="w-12 bg-yellow-500/20 border-t-2 border-yellow-500 rounded-t-md hover:bg-yellow-500/30 transition-all duration-500" style={{height: '55px'}}></div>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">Med (30-60)</span>
                      </div>
                      {/* High Risk bar */}
                      <div className="flex flex-col items-center gap-2 w-16">
                        <span className="text-xs font-bold text-slate-300">18%</span>
                        <div className="w-12 bg-orange-500/20 border-t-2 border-orange-500 rounded-t-md hover:bg-orange-500/30 transition-all duration-500" style={{height: '32px'}}></div>
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">High (60-80)</span>
                      </div>
                      {/* Critical Risk bar */}
                      <div className="flex flex-col items-center gap-2 w-16 animate-pulse">
                        <span className="text-xs font-bold text-red-500">7%</span>
                        <div className="w-12 bg-red-500/30 border-t-2 border-red-500 rounded-t-md hover:bg-red-500/40 transition-all duration-500" style={{height: '14px'}}></div>
                        <span className="text-[10px] text-red-400 font-semibold font-mono">Critical (80+)</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 text-center italic mt-2">
                      Risk models calculated based on behavior anomalies (35%), privilege misuse (25%), data violations (20%), and pattern deviations (20%).
                    </div>
                  </div>
                </div>

                {/* Threat Intel & Actions */}
                <div className="glass-panel p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white font-outfit">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={runAnomalyScan}
                      className="w-full p-3 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 rounded-xl flex items-center justify-between text-cyan-400 transition"
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold">Trigger Anomaly Scan</p>
                        <span className="text-[9px] text-cyan-500/80">Scan ingestion telemetry using ML</span>
                      </div>
                      <Play size={16} />
                    </button>
                    <button 
                      onClick={runRiskRecalculation}
                      className="w-full p-3 bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 rounded-xl flex items-center justify-between text-purple-400 transition"
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold">Recalculate Risk Scores</p>
                        <span className="text-[9px] text-purple-500/80">Evaluate user weighted categories</span>
                      </div>
                      <RefreshCw size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('incidents');
                        setShowNewIncidentModal(true);
                      }}
                      className="w-full p-3 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 rounded-xl flex items-center justify-between text-orange-400 transition"
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold">Initiate Investigation</p>
                        <span className="text-[9px] text-orange-500/80">Open threat incident review</span>
                      </div>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alerts List */}
              <div className="glass-panel p-5">
                <h3 className="text-sm font-bold text-white font-outfit mb-4">Real-Time Threat Alerts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-mono">
                        <th className="pb-3 font-semibold">Severity</th>
                        <th className="pb-3 font-semibold">Incident/Category</th>
                        <th className="pb-3 font-semibold">Employee ID</th>
                        <th className="pb-3 font-semibold">Trigger Detail</th>
                        <th className="pb-3 font-semibold">Timestamp</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs">
                      {alerts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-slate-500">
                            No security alerts recorded. Seed telemetry and run anomaly scan.
                          </td>
                        </tr>
                      ) : (
                        alerts.map(alert => (
                          <tr key={alert.id} className="hover:bg-slate-900/25 transition">
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                alert.severity === 'Critical' ? 'bg-red-500/15 text-red-500 border border-red-500/30' :
                                alert.severity === 'High' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
                                alert.severity === 'Medium' ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30' :
                                'bg-slate-500/15 text-slate-400'
                              }`}>
                                {alert.severity}
                              </span>
                            </td>
                            <td className="py-3 font-semibold text-slate-200">{alert.title}</td>
                            <td className="py-3 font-mono text-slate-400">{alert.employee_id}</td>
                            <td className="py-3 max-w-xs truncate text-slate-300" title={alert.description}>{alert.description}</td>
                            <td className="py-3 font-mono text-[10px] text-slate-400">
                              {new Date(alert.timestamp).toLocaleString()}
                            </td>
                            <td className="py-3">
                              <span className={`flex items-center gap-1 ${alert.status === 'Open' ? 'text-orange-400' : alert.status === 'Resolved' ? 'text-green-400' : 'text-cyan-400'}`}>
                                {alert.status === 'Open' ? <Clock size={12} /> : <CheckCircle size={12} />}
                                {alert.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {alert.status === 'Open' ? (
                                <div className="inline-flex gap-1.5">
                                  <button 
                                    onClick={() => {
                                      setNewIncidentTitle(`Investigation: ${alert.title}`);
                                      setNewIncidentDesc(`Investigation initiated for ${alert.employee_id} following alert trigger: ${alert.description}`);
                                      setNewIncidentSeverity(alert.severity);
                                      setNewIncidentEmpId(alert.employee_id);
                                      setShowNewIncidentModal(true);
                                      setActiveTab('incidents');
                                    }}
                                    className="px-2 py-1 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-cyan-400 rounded font-semibold text-[10px] transition"
                                  >
                                    Investigate
                                  </button>
                                  <button 
                                    onClick={() => handleResolveAlert(alert.id, 'Resolved by Security Analyst')}
                                    className="px-2 py-1 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-green-400 rounded font-semibold text-[10px] transition"
                                  >
                                    Resolve
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-500 font-mono text-[10px]">-</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SOC COMMAND SCREEN */}
          {activeTab === 'soc' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Telemetry Stream */}
              <div className="glass-panel p-5 col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-white font-outfit">Live Security Activity Stream</h3>
                <div className="p-3 bg-slate-950/70 border border-slate-900 rounded-xl h-96 overflow-y-auto space-y-2 font-mono text-[11px] text-cyan-400/90 scrollbar-none">
                  {alerts.map((al, idx) => (
                    <div key={idx} className="p-2 border-b border-slate-900 flex justify-between items-start gap-4">
                      <div>
                        <span className="text-slate-500">[{new Date(al.timestamp).toISOString()}]</span>{' '}
                        <span className="text-orange-400 uppercase font-bold">[{al.category}]</span>{' '}
                        <span className="text-slate-300">Flagged User: {al.employee_id} - {al.title}</span>
                      </div>
                      <span className="text-red-500 text-[10px] font-bold">{al.severity}</span>
                    </div>
                  ))}
                  <div className="text-center text-slate-500 py-10 font-sans text-xs">
                    Continuous pipeline listener active. Listening on network ports, filesystems, and remote VPN hosts.
                  </div>
                </div>
              </div>

              {/* SOC Controls */}
              <div className="glass-panel p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-outfit mb-3">Model Configurations</h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Adjust security logging baselines and classification models. Seed records, execute continuous evaluation processes, and recalibrate models.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                      <p className="text-xs font-semibold text-slate-300">ML Isolation Forest</p>
                      <span className="text-[10px] text-green-400 font-mono">STATUS: Ready</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                        <div className="bg-cyan-500 h-full rounded-full" style={{width: '95%'}}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                      <p className="text-xs font-semibold text-slate-300">Weighted Risk scoring</p>
                      <span className="text-[10px] text-green-400 font-mono">STATUS: Ready</span>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                        <div className="bg-purple-500 h-full rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-900">
                  <button onClick={runAnomalyScan} className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs transition">
                    Run ML Anomaly Pipeline
                  </button>
                  <button onClick={runRiskRecalculation} className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-lg text-xs transition">
                    Update User Risk Scores
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EMPLOYEE REGISTRY */}
          {activeTab === 'employees' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Employee list */}
              <div className="glass-panel p-5 col-span-2 space-y-4">
                <h3 className="text-sm font-bold text-white font-outfit">Employee Behavioral Profiles</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-mono">
                        <th className="pb-3 font-semibold">Risk Level</th>
                        <th className="pb-3 font-semibold">Employee ID</th>
                        <th className="pb-3 font-semibold">Full Name</th>
                        <th className="pb-3 font-semibold">Department</th>
                        <th className="pb-3 font-semibold">Designation</th>
                        <th className="pb-3 font-semibold text-right font-mono">Risk Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs">
                      {employees.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-500">
                            No employees listed. Run Seeding telemetry.
                          </td>
                        </tr>
                      ) : (
                        employees.map(emp => {
                          const level = emp.risk_score >= 80 ? 'Critical' : emp.risk_score >= 60 ? 'High' : emp.risk_score >= 30 ? 'Medium' : 'Low';
                          return (
                            <tr 
                              key={emp.id} 
                              onClick={() => selectEmployeeProfile(emp)}
                              className={`cursor-pointer transition hover:bg-slate-900/40 ${selectedEmployee?.id === emp.id ? 'bg-slate-900/60' : ''}`}
                            >
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                  level === 'Critical' ? 'bg-red-500/15 text-red-500 border border-red-500/30' :
                                  level === 'High' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30' :
                                  level === 'Medium' ? 'bg-yellow-500/15 text-yellow-500 border border-yellow-500/30' :
                                  'bg-green-500/15 text-green-400 border border-green-500/30'
                                }`}>
                                  {level}
                                </span>
                              </td>
                              <td className="py-3 font-mono text-slate-200">{emp.employee_id}</td>
                              <td className="py-3 font-semibold text-slate-100">{emp.full_name}</td>
                              <td className="py-3 text-slate-400">{emp.department}</td>
                              <td className="py-3 text-slate-400">{emp.designation}</td>
                              <td className="py-3 text-right font-mono font-bold text-white">{emp.risk_score}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected Profile Detail */}
              <div className="space-y-4">
                {selectedEmployee ? (
                  <div className="glass-panel p-5 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-xl text-white mx-auto shadow-lg shadow-cyan-500/10">
                        {selectedEmployee.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-outfit">{selectedEmployee.full_name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{selectedEmployee.employee_id}</span>
                      </div>
                      
                      {/* Risk score details */}
                      <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl mt-3 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-300">Total Risk Index</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xl font-bold font-mono ${
                            selectedEmployee.risk_score >= 80 ? 'text-red-500' :
                            selectedEmployee.risk_score >= 60 ? 'text-orange-400' :
                            selectedEmployee.risk_score >= 30 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {selectedEmployee.risk_score}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[9px] border-b border-slate-900 pb-1">Identity Details</h5>
                      <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono">
                        <div>Email:</div>
                        <div className="text-slate-200 truncate">{selectedEmployee.email}</div>
                        <div>Dept:</div>
                        <div className="text-slate-200">{selectedEmployee.department}</div>
                        <div>Designation:</div>
                        <div className="text-slate-200">{selectedEmployee.designation}</div>
                        <div>Manager:</div>
                        <div className="text-slate-200">{selectedEmployee.manager || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Timeline summary */}
                    <div className="space-y-3">
                      <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[9px] border-b border-slate-900 pb-1">Recent Activity Logs</h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {employeeTimeline.length === 0 ? (
                          <div className="text-center text-slate-500 text-xs py-4">No activity records.</div>
                        ) : (
                          employeeTimeline.map((item, idx) => (
                            <div key={idx} className="p-2 bg-slate-900/40 border border-slate-800 rounded-lg flex justify-between items-center text-[10px]">
                              <div>
                                <p className="font-bold text-slate-200 capitalize">{item.activity_name}</p>
                                <span className="text-slate-500 font-mono">{new Date(item.timestamp).toLocaleDateString()}</span>
                              </div>
                              <span className={item.status === 'SUCCESS' ? 'text-green-400' : 'text-red-400 font-bold'}>{item.status}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-6 text-center text-slate-500 text-xs">
                    Select an employee profile from the registry table to view identity mapping, baseline compliance, and telemetry timelines.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INVESTIGATIONS & INCIDENTS */}
          {activeTab === 'incidents' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Incident list */}
              <div className="glass-panel p-5 col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white font-outfit">Active Investigation Incidents</h3>
                  <button 
                    onClick={() => setShowNewIncidentModal(true)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Plus size={14} /> New Incident
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-mono">
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Severity</th>
                        <th className="pb-3 font-semibold">Incident Case</th>
                        <th className="pb-3 font-semibold">Suspect ID</th>
                        <th className="pb-3 font-semibold">Assigned Analyst</th>
                        <th className="pb-3 font-semibold">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs">
                      {incidents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-slate-500">
                            No investigations created yet. Open an incident from the Analyst dashboard or click New Incident.
                          </td>
                        </tr>
                      ) : (
                        incidents.map(inc => (
                          <tr 
                            key={inc.id}
                            onClick={() => selectIncidentInvestigation(inc)}
                            className={`cursor-pointer transition hover:bg-slate-900/40 ${selectedIncident?.id === inc.id ? 'bg-slate-900/60' : ''}`}
                          >
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                inc.status === 'Open' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                inc.status === 'Investigating' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                'bg-slate-500/15 text-slate-400'
                              }`}>
                                {inc.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={inc.severity === 'Critical' || inc.severity === 'High' ? 'text-red-400 font-bold' : 'text-slate-300'}>
                                {inc.severity}
                              </span>
                            </td>
                            <td className="py-3 font-semibold text-slate-100">{inc.title}</td>
                            <td className="py-3 font-mono text-slate-400">{inc.employee_id}</td>
                            <td className="py-3 text-slate-400 truncate max-w-[120px]" title={inc.assigned_to}>{inc.assigned_to || 'Unassigned'}</td>
                            <td className="py-3 font-mono text-[10px] text-slate-500">
                              {new Date(inc.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Incident Details / Evidence Locker */}
              <div className="space-y-4">
                {selectedIncident ? (
                  <div className="glass-panel p-5 space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white font-outfit">{selectedIncident.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Case ID: INC-{selectedIncident.id}</span>
                      </div>
                      {selectedIncident.status !== 'Closed' && (
                        <button 
                          onClick={() => handleCloseIncident(selectedIncident.id)}
                          className="px-2 py-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded text-[10px] font-semibold transition"
                        >
                          Close Case
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 text-xs text-slate-300">
                      <div>
                        <p className="font-semibold text-slate-400 text-[10px] uppercase font-mono">Description:</p>
                        <p className="mt-1 leading-relaxed bg-slate-900/40 p-2.5 rounded border border-slate-900">{selectedIncident.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[10px]">
                        <div>Suspect: {selectedIncident.employee_id}</div>
                        <div>Severity: {selectedIncident.severity}</div>
                      </div>
                    </div>

                    {/* Timeline of events */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <p className="font-semibold text-slate-400 text-[10px] uppercase font-mono">Audit Timeline logs</p>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {employeeTimeline.length === 0 ? (
                          <div className="text-center text-slate-500 text-xs py-2">No timeline loaded.</div>
                        ) : (
                          employeeTimeline.map((item, idx) => (
                            <div key={idx} className="p-2 bg-slate-900/40 border border-slate-800 rounded flex justify-between items-start text-[10px] font-mono">
                              <div>
                                <span className="text-slate-500">[{new Date(item.timestamp).toLocaleTimeString()}]</span>{' '}
                                <span className={item.status === 'FAILED' ? 'text-red-400 font-bold' : 'text-cyan-400'}>
                                  {item.activity_name.toUpperCase()}
                                </span>
                              </div>
                              <span className="text-slate-400 truncate max-w-[120px]">{item.status}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Evidence & Case Comments */}
                    <div className="space-y-2 pt-2 border-t border-slate-900">
                      <p className="font-semibold text-slate-400 text-[10px] uppercase font-mono">Evidence Log & Analyst Comments</p>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {selectedIncident.evidence && JSON.parse(selectedIncident.evidence).length > 0 ? (
                          JSON.parse(selectedIncident.evidence).map((ev, idx) => (
                            <div key={idx} className="p-2 bg-slate-900/70 border border-slate-800 rounded text-[10px] space-y-1">
                              <div className="flex justify-between text-slate-500 font-mono text-[9px]">
                                <span>{ev.added_by}</span>
                                <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-slate-300">{ev.content}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-slate-500 text-xs py-2">No evidence/comments logged.</div>
                        )}
                      </div>

                      {selectedIncident.status !== 'Closed' && (
                        <form onSubmit={handleAddEvidence} className="flex gap-2 pt-2">
                          <input 
                            type="text" 
                            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                            placeholder="Log analysis result or comment..."
                            value={evidenceText}
                            onChange={(e) => setEvidenceText(e.target.value)}
                          />
                          <button type="submit" className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold">
                            Log
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel p-6 text-center text-slate-500 text-xs">
                    Select an active case files from the investigation registry to load description, employee timeline, and evidence logs.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SYSTEM ADMIN VIEW */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              {/* Admin summary */}
              <div className="grid grid-cols-3 gap-6">
                <div className="glass-panel p-5 col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white font-outfit">Platform System Audit Trail</h3>
                    <button 
                      onClick={() => handleExportCSV('audit')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Download size={14} /> Export CSV logs
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 font-mono">
                          <th className="pb-3 font-semibold">Action</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Actor ID</th>
                          <th className="pb-3 font-semibold">Details</th>
                          <th className="pb-3 font-semibold">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-xs">
                        {auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-slate-500">No system audit records found.</td>
                          </tr>
                        ) : (
                          auditLogs.slice(0, 15).map(log => (
                            <tr key={log.id} className="hover:bg-slate-900/25 transition">
                              <td className="py-3 font-mono font-bold text-slate-300">{log.action}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                  log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="py-3 text-slate-400 font-mono">{log.user_id || 'System'}</td>
                              <td className="py-3 text-slate-400 truncate max-w-[200px]" title={log.description}>{log.description}</td>
                              <td className="py-3 font-mono text-[10px] text-slate-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Configurations */}
                <div className="glass-panel p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white font-outfit">Platform Diagnostics</h3>
                  <div className="space-y-4 text-xs font-mono">
                    <div className="flex justify-between items-center py-2 border-b border-slate-900">
                      <span className="text-slate-400">Database Engine:</span>
                      <span className="text-green-400">SQLite (Connected)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-900">
                      <span className="text-slate-400">JWT Token Expiry:</span>
                      <span className="text-slate-200">30 Minutes</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-900">
                      <span className="text-slate-400">SMTP Host:</span>
                      <span className="text-slate-500">smtp.gmail.com (Console Fallback Enabled)</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-xs">
                    SMTP settings default to console-log verification backup for local setup.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Profile overview */}
              {user && (
                <div className="glass-panel p-5 space-y-4">
                  <h3 className="text-sm font-bold text-white font-outfit">Account Identity Profile</h3>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-900 py-2">
                      <span className="text-slate-400">Full Name:</span>
                      <span className="text-white">{user.full_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 py-2">
                      <span className="text-slate-400">Username:</span>
                      <span className="text-white">{user.username}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 py-2">
                      <span className="text-slate-400">Email Address:</span>
                      <span className="text-white">{user.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 py-2">
                      <span className="text-slate-400">Authorized Role:</span>
                      <span className="text-cyan-400">{user.role}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-900 py-2">
                      <span className="text-slate-400">Email Verified:</span>
                      <span className={user.is_verified ? 'text-green-400' : 'text-red-400'}>
                        {user.is_verified ? 'Verified (OTP Pass)' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Change password */}
              <div className="glass-panel p-5 space-y-4">
                <h3 className="text-sm font-bold text-white font-outfit">Change Account Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Current Password</label>
                    <input 
                      type="password"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">New Password</label>
                    <input 
                      type="password"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold text-xs transition">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* New Incident Modal */}
      {showNewIncidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg glass-panel p-6 space-y-4 relative">
            <h3 className="text-sm font-bold text-white font-outfit border-b border-slate-800 pb-2">Initiate Cyber Threat Investigation</h3>
            <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Employee ID / Suspect ID</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    placeholder="EMP001"
                    value={newIncidentEmpId}
                    onChange={(e) => setNewIncidentEmpId(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Case Severity</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    value={newIncidentSeverity}
                    onChange={(e) => setNewIncidentSeverity(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Incident Summary Case Title</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  placeholder="Data Exfiltration via USB Device"
                  value={newIncidentTitle}
                  onChange={(e) => setNewIncidentTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Detailed Description</label>
                <textarea 
                  rows={4}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white resize-none"
                  placeholder="Provide background context, logs, IP addresses, and specific anomalies detected..."
                  value={newIncidentDesc}
                  onChange={(e) => setNewIncidentDesc(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewIncidentModal(false)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
                >
                  Create Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
