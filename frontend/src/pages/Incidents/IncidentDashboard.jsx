import React, { useState, useEffect } from 'react';
import {
  Zap,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Search,
  ChevronRight,
  X,
  FileText,
  Activity,
  Server,
  HardDrive,
  Globe,
  Play,
  UserX,
  Key,
  Bell,
  Cpu,
} from 'lucide-react';
import {
  getIncidentDashboardStats,
  getIncidents,
  getAlerts,
  getSOARPlaybooks,
  getSOARExecutionLogs,
  executeSOARPlaybook,
} from '../../services/incidentService';

const SEVERITY_COLORS = {
  Informational: '#3B82F6',
  Low: '#10B981',
  Medium: '#F59E0B',
  High: '#F97316',
  Critical: '#EF4444',
};

const IncidentDashboard = () => {
  const [activeTab, setActiveTab] = useState('INCIDENTS'); // 'INCIDENTS' or 'ALERTS'
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [playbooks, setPlaybooks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Execution Modal
  const [executingModalOpen, setExecutingModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedAction, setSelectedAction] = useState('SUSPEND_USER_ACCOUNT');
  const [executionResult, setExecutionResult] = useState(null);
  const [executing, setExecuting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashStats, incList, alertList, pbList, logList] = await Promise.all([
        getIncidentDashboardStats(),
        getIncidents(),
        getAlerts(),
        getSOARPlaybooks(),
        getSOARExecutionLogs(),
      ]);
      setStats(dashStats);
      setIncidents(incList);
      setAlerts(alertList);
      setPlaybooks(pbList);
      setLogs(logList);
    } catch (err) {
      console.error('Failed to load incident data:', err);
      setError('Unable to connect to Incident & SOAR Response Engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunPlaybook = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await executeSOARPlaybook({
        action_type: selectedAction,
        employee_id: selectedIncident.employee_id,
        incident_id: selectedIncident.id,
      });
      setExecutionResult(res);
      await fetchData();
    } catch (err) {
      console.error('SOAR Execution failed:', err);
      setExecutionResult({ status: 'FAILED', result_details: 'Execution error occurred.' });
    } finally {
      setExecuting(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'High':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'Low':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Alerts, Incidents & Automated SOAR Playbooks</h1>
              <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30">
                SOAR Response Engine
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Security alert consolidation, active incident containment, and automated SOAR response playbooks.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-800 p-1.5 border border-slate-700">
          <button
            onClick={() => setActiveTab('INCIDENTS')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'INCIDENTS' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Incidents & SOAR Engine
          </button>
          <button
            onClick={() => setActiveTab('ALERTS')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'ALERTS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Security Alerts ({alerts.length})
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="ml-2 rounded-xl bg-slate-700 p-2 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-50"
            title="Refresh Incidents"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Incidents</span>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.total_incidents || 0}</p>
          <p className="mt-1 text-xs text-slate-500">Consolidated high-priority incidents</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Active Security Alerts</span>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats?.active_alerts || 0}</p>
          <p className="mt-1 text-xs text-amber-700 font-medium">Telemetry alerts awaiting response</p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">SOAR Playbooks</span>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{playbooks.length || 5}</p>
          <p className="mt-1 text-xs text-indigo-700 font-medium">Registered automated containment policies</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">SOAR Actions Executed</span>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{stats?.soar_actions_executed || 0}</p>
          <p className="mt-1 text-xs text-emerald-700 font-medium">Automated containment responses</p>
        </div>
      </div>

      {/* TAB 1: INCIDENTS & SOAR PLAYBOOKS */}
      {activeTab === 'INCIDENTS' && (
        <div className="space-y-6">
          {/* Registered SOAR Playbooks Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-1">Registered SOAR Automated Response Playbooks</h3>
            <p className="text-xs text-slate-500 mb-4">Security Orchestration, Automation, and Response containment rules</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playbooks.map((pb) => (
                <div key={pb.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 border border-amber-500/20">
                      {pb.action_type}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">Executions: {pb.execution_count}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{pb.playbook_name}</h4>
                  <p className="text-[11px] text-slate-600">{pb.description}</p>
                  <p className="text-[10px] font-mono text-indigo-600 font-semibold">Trigger: {pb.trigger_condition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Incidents Queue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Incident Registry</h3>
                <p className="text-xs text-slate-500">Consolidated high-priority security incidents</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Incident #</th>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Target Employee</th>
                    <th className="px-4 py-3 font-semibold">Severity</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Assigned Team</th>
                    <th className="px-4 py-3 font-semibold text-right">SOAR Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3.5">
                        <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-mono font-bold text-white">
                          {inc.incident_number}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{inc.title}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900">{inc.employee_name}</p>
                        <p className="text-[11px] text-slate-500">{inc.department_name}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getSeverityBadge(inc.severity)}`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-500/30">
                          {inc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{inc.assigned_team}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedIncident(inc);
                            setExecutingModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 font-bold text-white hover:bg-amber-500 shadow-sm"
                        >
                          <Play size={12} />
                          Execute SOAR Playbook
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SOAR Execution Log Feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-3">SOAR Execution Audit Log</h3>
            <div className="space-y-2 text-xs">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-wrap items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                      {log.status}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {log.executed_at ? new Date(log.executed_at).toLocaleString() : ''}
                    </span>
                    <span className="font-bold text-slate-900">{log.action_type}</span>
                    <span className="text-slate-600">({log.employee_name})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 sm:mt-0 font-medium">{log.result_details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SECURITY ALERTS */}
      {activeTab === 'ALERTS' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Triggered Security Alerts Feed</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Alert Name</th>
                  <th className="px-4 py-3 font-semibold">Alert Type</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-4 py-3 font-semibold">Source Module</th>
                  <th className="px-4 py-3 font-semibold">Target Employee</th>
                  <th className="px-4 py-3 font-semibold">Entity</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {alerts.map((a) => (
                  <tr key={a.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{a.alert_name}</td>
                    <td className="px-4 py-3.5 text-slate-700">{a.alert_type}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getSeverityBadge(a.severity)}`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600">
                        {a.source_module}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-900 font-semibold">{a.employee_name}</td>
                    <td className="px-4 py-3.5 text-slate-600 font-mono">{a.entity_name || 'N/A'}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 border border-amber-500/30">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXECUTE SOAR PLAYBOOK MODAL */}
      {executingModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">{selectedIncident.incident_number}</span>
                <h3 className="text-base font-bold text-slate-900">Execute SOAR Response Playbook</h3>
              </div>
              <button onClick={() => setExecutingModalOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Target Employee: <span className="font-bold text-slate-900">{selectedIncident.employee_name}</span>
              </p>

              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Select Response Action</label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-900"
                >
                  <option value="SUSPEND_USER_ACCOUNT">SUSPEND_USER_ACCOUNT (Lock User Account in AD/DB)</option>
                  <option value="REVOKE_ACTIVE_SESSIONS">REVOKE_ACTIVE_SESSIONS (Revoke Active JWT Bearer Tokens)</option>
                  <option value="ISOLATE_ENTITY">ISOLATE_ENTITY (Isolate Host / Server Endpoint)</option>
                  <option value="REVOKE_USB_ACCESS">REVOKE_USB_ACCESS (Revoke USB Mass Storage Rights)</option>
                  <option value="NOTIFY_SOC_LEAD">NOTIFY_SOC_LEAD (Dispatch High-Priority Escalation)</option>
                </select>
              </div>

              {executionResult && (
                <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-emerald-900 font-medium">
                  <p className="font-bold">Execution Result: {executionResult.status}</p>
                  <p className="mt-1">{executionResult.result_details}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setExecutingModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
                  Close
                </button>
                <button
                  onClick={handleRunPlaybook}
                  disabled={executing}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-500 disabled:opacity-50"
                >
                  <Play size={14} className={executing ? 'animate-spin' : ''} />
                  Execute Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDashboard;
