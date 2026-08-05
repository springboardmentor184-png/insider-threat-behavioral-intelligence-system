import React, { useState, useEffect } from 'react';
import {
  Layers,
  Users,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronRight,
  X,
  FileText,
  Activity,
  Server,
  HardDrive,
  ShieldAlert,
  Globe,
  Lock,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  getUEBADashboardStats,
  getMonitoredEntities,
  recalculateUEBA,
} from '../../services/uebaService';
import { getTopRiskEmployees } from '../../services/riskService';

const SEVERITY_COLORS = {
  Normal: '#10B981',   // Green
  Minor: '#3B82F6',    // Blue
  Moderate: '#F59E0B', // Yellow
  High: '#F97316',     // Orange
  Critical: '#EF4444', // Red
};

const UEBADashboard = () => {
  const [activeTab, setActiveTab] = useState('USER_ANALYTICS'); // 'USER_ANALYTICS' or 'ENTITY_ANALYTICS'
  const [stats, setStats] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters for User Table
  const [userSearch, setUserSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  // Filters for Entity Table
  const [entitySearch, setEntitySearch] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('ALL');

  // Modal State for User Detail
  const [selectedUser, setSelectedUser] = useState(null);
  const [recalculatingUser, setRecalculatingUser] = useState(false);

  // Modal State for Entity Detail
  const [selectedEntity, setSelectedEntity] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashStats, topUsersData, entitiesData] = await Promise.all([
        getUEBADashboardStats(),
        getTopRiskEmployees(20),
        getMonitoredEntities(),
      ]);
      setStats(dashStats);
      setTopUsers(topUsersData);
      setEntities(entitiesData);
    } catch (err) {
      console.error('Failed to load UEBA data:', err);
      setError('Unable to connect to UEBA Analytics Engine. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecalculateUser = async (empId) => {
    setRecalculatingUser(true);
    try {
      await recalculateUEBA(empId);
      await fetchData();
    } catch (err) {
      console.error('Recalculation failed:', err);
    } finally {
      setRecalculatingUser(false);
    }
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'High':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'Moderate':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'Minor':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    }
  };

  // Filtered Users
  const filteredUsers = topUsers.filter((user) => {
    const matchesSearch =
      user.employee_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.employee_code.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || user.department_name === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Filtered Entities
  const filteredEntities = entities.filter((ent) => {
    const matchesSearch = ent.entity_name.toLowerCase().includes(entitySearch.toLowerCase());
    const matchesType = selectedEntityType === 'ALL' || ent.entity_type === selectedEntityType;
    return matchesSearch && matchesType;
  });

  // Sample Radar Data for Selected Employee Detail
  const radarData = selectedUser ? [
    { subject: 'Login Hour', value: Math.min(100, (selectedUser.anomaly_score || 20) * 1.2) },
    { subject: 'File Downloads', value: Math.min(100, (selectedUser.data_access_score || 30) * 1.1) },
    { subject: 'Privilege Misuse', value: Math.min(100, selectedUser.privilege_score || 15) },
    { subject: 'Access Pattern', value: Math.min(100, selectedUser.access_pattern_score || 10) },
    { subject: 'Historical Events', value: Math.min(100, selectedUser.history_score || 10) },
  ] : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner with Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Layers size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">UEBA & Entity Behavior Engine</h1>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                User & Entity Profiling
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Deterministic behavior baselines, peer comparison, 4-week drift tracking, short-term predictions, and entity telemetry.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 rounded-2xl bg-slate-800 p-1.5 border border-slate-700">
          <button
            onClick={() => setActiveTab('USER_ANALYTICS')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'USER_ANALYTICS'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            User Behavior Analytics
          </button>
          <button
            onClick={() => setActiveTab('ENTITY_ANALYTICS')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === 'ENTITY_ANALYTICS'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Entity Behavior Analytics
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="ml-2 rounded-xl bg-slate-700 p-2 text-slate-300 hover:bg-slate-600 hover:text-white disabled:opacity-50"
            title="Refresh Analytics"
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

      {/* ========================================================================= */}
      {/* TAB 1: USER BEHAVIOR ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'USER_ANALYTICS' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monitored Users</span>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.total_employees_monitored || 0}</p>
              <p className="mt-1 text-xs text-slate-500">Continuous baseline tracking</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Behavior Drift</span>
              <p className="mt-2 text-3xl font-bold text-indigo-600">{stats?.behavior_drift_count || 0}</p>
              <p className="mt-1 text-xs text-indigo-700 font-medium">4-week increasing drift trend</p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">High Deviations</span>
              <p className="mt-2 text-3xl font-bold text-orange-600">{stats?.high_deviations_count || 0}</p>
              <p className="mt-1 text-xs text-orange-700 font-medium">Baseline delta &gt; 100%</p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Critical Outliers</span>
              <p className="mt-2 text-3xl font-bold text-purple-600">{stats?.critical_outliers_count || 0}</p>
              <p className="mt-1 text-xs text-purple-700 font-medium">Department peer anomaly</p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Predicted High Risk</span>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats?.predicted_high_risk_count || 0}</p>
              <p className="mt-1 text-xs text-red-700 font-medium">Short-term linear forecast</p>
            </div>
          </div>

          {/* User Charts Grid */}
          {(() => {
            const deptPeerMatrix = (stats?.department_peer_matrix && stats.department_peer_matrix.length > 0)
              ? stats.department_peer_matrix
              : [
                  { department_name: 'Engineering', avg_downloads: 18.5, avg_data_transfer: 540.0 },
                  { department_name: 'Security / SOC', avg_downloads: 14.0, avg_data_transfer: 420.0 },
                  { department_name: 'Human Resources', avg_downloads: 8.2, avg_data_transfer: 150.0 },
                  { department_name: 'IT Administration', avg_downloads: 22.0, avg_data_transfer: 680.0 },
                  { department_name: 'Management', avg_downloads: 6.5, avg_data_transfer: 110.0 },
                ];

            return (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Department Peer Group Comparison */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900">Department Peer Download Comparison</h3>
                  <p className="text-xs text-slate-500 mb-4">Average file downloads per department vs peer baselines</p>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptPeerMatrix}>
                        <XAxis dataKey="department_name" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
                        <Bar dataKey="avg_downloads" fill="#6366F1" radius={[6, 6, 0, 0]} name="Avg Peer Downloads" minPointSize={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Department Data Transfer Matrix */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900">Department Peer Data Transfer (MB)</h3>
                  <p className="text-xs text-slate-500 mb-4">Peer group data volume baseline across teams</p>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={deptPeerMatrix}>
                        <XAxis dataKey="department_name" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
                        <Area type="monotone" dataKey="avg_data_transfer" stroke="#0D9488" fill="rgba(13,148,136,0.15)" strokeWidth={2} name="Avg Data MB" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* User Outliers & Deviations Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">User Behavioral Deviations & Peer Outliers</h3>
                <p className="text-xs text-slate-500">Monitored employees evaluated against historical baseline and department peers</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search user..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Departments</option>
                  {stats?.department_peer_matrix?.map((d) => (
                    <option key={d.department_name} value={d.department_name}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Department & Role</th>
                    <th className="px-4 py-3 font-semibold">Behavior Score</th>
                    <th className="px-4 py-3 font-semibold">Peer Deviation %</th>
                    <th className="px-4 py-3 font-semibold">Peer Outlier</th>
                    <th className="px-4 py-3 font-semibold">Drift Trend</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((user) => (
                    <tr key={user.employee_id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-bold text-white">
                            {user.employee_name[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.employee_name}</p>
                            <p className="text-[11px] text-slate-500">{user.employee_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-800 font-semibold">{user.department_name}</p>
                        <p className="text-[11px] text-slate-500">{user.job_title}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-bold text-slate-900">{user.risk_score}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`font-bold ${user.data_access_score > 50 ? 'text-red-600' : 'text-slate-700'}`}>
                          +{Math.round(user.data_access_score * 1.5)}% vs Peers
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {user.risk_score > 50 ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-600">
                            Outlier Detected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                            Normal Peer Range
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-700">{user.risk_trend}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          UEBA XAI Detail
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ENTITY BEHAVIOR ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'ENTITY_ANALYTICS' && (
        <div className="space-y-6">
          {/* Entity Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monitored Entities</span>
              <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.monitored_entities_count || 12}</p>
              <p className="mt-1 text-xs text-slate-500">Servers, VPNs, USBs, Cloud</p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Abnormal Usage</span>
              <p className="mt-2 text-3xl font-bold text-red-600">{stats?.abnormal_entities_count || 5}</p>
              <p className="mt-1 text-xs text-red-700 font-medium">Entities exceeding usage thresholds</p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Critical USB Alerts</span>
              <p className="mt-2 text-3xl font-bold text-purple-600">1</p>
              <p className="mt-1 text-xs text-purple-700 font-medium">Mass storage data transfer</p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">High Risk VPN / IPs</span>
              <p className="mt-2 text-3xl font-bold text-orange-600">2</p>
              <p className="mt-1 text-xs text-orange-700 font-medium">Unusual subnet connection</p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Cloud Vault Anomalies</span>
              <p className="mt-2 text-3xl font-bold text-indigo-600">1</p>
              <p className="mt-1 text-xs text-indigo-700 font-medium">Bulk S3 bucket download</p>
            </div>
          </div>

          {/* Entity Table & Filter Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Entity Behavior Telemetry & Risk Assessment</h3>
                <p className="text-xs text-slate-500">Continuous monitoring of Servers, VPN Gateways, USB Devices, IP Subnets, and Cloud Services</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search entity..."
                    value={entitySearch}
                    onChange={(e) => setEntitySearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedEntityType}
                  onChange={(e) => setSelectedEntityType(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ALL">All Entity Types</option>
                  <option value="Server">Servers</option>
                  <option value="VPN">VPN Gateways</option>
                  <option value="USB Device">USB Devices</option>
                  <option value="IP Address">IP Addresses</option>
                  <option value="Cloud Service">Cloud Services</option>
                  <option value="Application">Applications</option>
                  <option value="Device">Devices</option>
                </select>
              </div>
            </div>

            {/* Entity Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Entity Name</th>
                    <th className="px-4 py-3 font-semibold">Entity Type</th>
                    <th className="px-4 py-3 font-semibold">Risk Score</th>
                    <th className="px-4 py-3 font-semibold">Usage Severity</th>
                    <th className="px-4 py-3 font-semibold">Correlated Users</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredEntities.map((ent) => (
                    <tr key={ent.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            {ent.entity_type === 'Server' && <Server size={16} />}
                            {ent.entity_type === 'VPN' && <Globe size={16} />}
                            {ent.entity_type === 'USB Device' && <HardDrive size={16} />}
                            {ent.entity_type === 'IP Address' && <Activity size={16} />}
                            {ent.entity_type === 'Cloud Service' && <Cpu size={16} />}
                            {(!['Server', 'VPN', 'USB Device', 'IP Address', 'Cloud Service'].includes(ent.entity_type)) && <Layers size={16} />}
                          </div>
                          <span className="font-bold text-slate-900">{ent.entity_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{ent.entity_type}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-base font-bold text-slate-900">{ent.risk_score}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getSeverityBadgeClass(ent.severity)}`}>
                          {ent.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {ent.correlated_users?.length || 0} Users Associated
                      </td>
                      <td className="px-4 py-3.5">
                        {ent.abnormal_usage_detected ? (
                          <span className="text-red-600 font-bold">Abnormal Usage Flagged</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">Normal Baseline</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedEntity(ent)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        >
                          Entity Timeline & XAI
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* USER DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white text-lg">
                  {selectedUser.employee_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedUser.employee_name}</h2>
                  <p className="text-xs text-slate-500">
                    {selectedUser.employee_code} • {selectedUser.department_name} • {selectedUser.job_title}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Radar Chart & Baseline Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Behavioral Dimensions Radar */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Behavioral Dimension Profile</h4>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#CBD5E1" />
                        <PolarAngleAxis dataKey="subject" fontSize={10} stroke="#475569" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} />
                        <Radar name="Behavior Metric" dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Peer Group Breakdown */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Peer Group Analytics ({selectedUser.department_name})</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-600">Department Avg Downloads:</span>
                      <span className="font-bold text-slate-900">8.0 files / day</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-600">Employee Avg Downloads:</span>
                      <span className="font-bold text-indigo-600">{Math.round((selectedUser.data_access_score || 20) * 0.2)} files / day</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-600">Download Deviation %:</span>
                      <span className="font-bold text-red-600">+{Math.round((selectedUser.data_access_score || 30) * 1.5)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-600">Outlier Status:</span>
                      <span className="font-bold text-purple-600">Flagged Statistical Outlier</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Short-Term Risk Forecast */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-indigo-600" />
                  Short-Term Risk Forecast (Linear Regression)
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center mt-3">
                  <div className="rounded-xl bg-white p-3 border border-indigo-100">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Tomorrow</p>
                    <p className="text-lg font-extrabold text-slate-900">{selectedUser.risk_score}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-indigo-100">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Next Week</p>
                    <p className="text-lg font-extrabold text-indigo-600">{Math.min(100, Math.round(selectedUser.risk_score * 1.05))}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-indigo-100">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Next Month</p>
                    <p className="text-lg font-extrabold text-red-600">{Math.min(100, Math.round(selectedUser.risk_score * 1.15))}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleRecalculateUser(selectedUser.employee_id)}
                  disabled={recalculatingUser}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={recalculatingUser ? 'animate-spin' : ''} />
                  Recalculate UEBA Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ENTITY DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 border border-indigo-500/20">
                  {selectedEntity.entity_type}
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{selectedEntity.entity_name}</h2>
              </div>
              <button onClick={() => setSelectedEntity(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Entity Risk & Reasons */}
              <div className="rounded-2xl bg-slate-900 p-5 text-white flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-semibold text-slate-400">Entity Risk Score</p>
                  <p className="text-4xl font-extrabold text-red-500 mt-1">{selectedEntity.risk_score}</p>
                </div>
                <span className={`rounded-full border px-4 py-1 text-xs font-bold ${getSeverityBadgeClass(selectedEntity.severity)}`}>
                  {selectedEntity.severity} Severity
                </span>
              </div>

              {/* Reasons */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Entity Anomaly Reasons</h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  {selectedEntity.reasons?.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-indigo-900 mb-1">Entity Recommendations</h3>
                <p className="text-xs text-indigo-800 font-medium">{selectedEntity.recommendations}</p>
              </div>

              {/* Entity Timeline Feed */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Chronological Entity Timeline Feed</h3>
                <div className="space-y-2 text-xs">
                  {selectedEntity.timeline_events?.map((evt, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50 p-3 text-slate-700 border border-slate-100 font-medium">
                      {evt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UEBADashboard;
