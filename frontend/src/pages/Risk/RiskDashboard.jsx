import React, { useState, useEffect } from 'react';
import {
  Gauge,
  ShieldAlert,
  Users,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Search,
  ChevronRight,
  X,
  FileText,
  Activity,
  Award,
  Calendar,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
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
} from 'recharts';
import {
  getRiskDashboardStats,
  getTopRiskEmployees,
  getCurrentRisk,
  getRiskHistory,
  recalculateRisk,
} from '../../services/riskService';

const COLORS = {
  Low: '#10B981',      // Green
  Medium: '#F59E0B',   // Yellow
  High: '#F97316',     // Orange
  Critical: '#EF4444', // Red
};

const RiskDashboard = () => {
  const [stats, setStats] = useState(null);
  const [topEmployees, setTopEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Modal State for Employee Detail
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empDetail, setEmpDetail] = useState(null);
  const [empHistory, setEmpHistory] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, topEmpData] = await Promise.all([
        getRiskDashboardStats(),
        getTopRiskEmployees(20),
      ]);
      setStats(dashboardData);
      setTopEmployees(topEmpData);
    } catch (err) {
      console.error('Failed to load Risk Dashboard data:', err);
      setError('Unable to connect to Risk Scoring Engine. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEmpDetail = async (employee) => {
    setSelectedEmp(employee);
    setDetailLoading(true);
    try {
      const [currentRisk, history] = await Promise.all([
        getCurrentRisk(employee.employee_id),
        getRiskHistory(employee.employee_id),
      ]);
      setEmpDetail(currentRisk);
      setEmpHistory(history);
    } catch (err) {
      console.error('Failed to load employee risk detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!selectedEmp) return;
    setRecalculating(true);
    try {
      await recalculateRisk(selectedEmp.employee_id);
      await handleOpenEmpDetail(selectedEmp);
      await fetchData();
    } catch (err) {
      console.error('Recalculation failed:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'High':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'UP') return <ArrowUpRight className="text-red-500" size={16} />;
    if (trend === 'DOWN') return <ArrowDownRight className="text-emerald-500" size={16} />;
    return <Minus className="text-slate-400" size={16} />;
  };

  // Filter top employees
  const filteredEmployees = topEmployees.filter((emp) => {
    const matchesSearch =
      emp.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department_name === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Pie chart data
  const pieData = stats?.risk_distribution
    ? Object.entries(stats.risk_distribution).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Gauge size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">AI Risk Intelligence Engine</h1>
              <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 border border-teal-500/30">
                Continuous SOC Scoring
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Enterprise behavioral anomaly aggregation, weighted sub-score breakdown, and explainable recommendations.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-500 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Assessment
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Widget Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Employees */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Assessed</span>
            <Users size={18} className="text-slate-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats?.total_employees || 0}</p>
          <p className="mt-1 text-xs text-slate-500">Monitored organization directory</p>
        </div>

        {/* Average Risk Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Risk Score</span>
            <TrendingUp size={18} className="text-teal-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">{stats?.average_risk || 0.0}</p>
            <span className="text-xs font-semibold text-slate-500">/ 100</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Weighted organization baseline</p>
        </div>

        {/* Critical Employees */}
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-red-600">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Risk</span>
            <ShieldAlert size={18} />
          </div>
          <p className="mt-3 text-3xl font-bold text-red-600">{stats?.critical_employees || 0}</p>
          <p className="mt-1 text-xs text-red-700">Immediate threat investigation required</p>
        </div>

        {/* High Risk Employees */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk</span>
            <AlertTriangle size={18} />
          </div>
          <p className="mt-3 text-3xl font-bold text-orange-600">{stats?.high_risk_employees || 0}</p>
          <p className="mt-1 text-xs text-orange-700">Elevated anomaly indicators</p>
        </div>

        {/* Today's New Risks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's New Risks</span>
            <Activity size={18} className="text-teal-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats?.today_new_risks || 0}</p>
          <p className="mt-1 text-xs text-slate-500">New elevated risk flags today</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department-wise Risk (Bar Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Department-wise Risk Overview</h3>
              <p className="text-xs text-slate-500">Average risk score calculated per organizational department</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.department_risk || []}>
                <XAxis dataKey="department_name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }}
                  cursor={{ fill: 'rgba(15,23,42,0.05)' }}
                />
                <Bar dataKey="avg_risk" fill="#0D9488" radius={[8, 8, 0, 0]} name="Avg Risk Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution (Pie/Donut Chart) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Risk Level Distribution</h3>
            <p className="text-xs text-slate-500">Proportion of employees across risk tiers</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Highest Risk Employees Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Highest Risk Employees</h3>
            <p className="text-xs text-slate-500">Prioritized list of employees with active behavioral risk factors</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {stats?.department_risk?.map((d) => (
                <option key={d.department_name} value={d.department_name}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Employees Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Department & Title</th>
                <th className="px-4 py-3 font-semibold">Risk Score</th>
                <th className="px-4 py-3 font-semibold">Risk Tier</th>
                <th className="px-4 py-3 font-semibold">Trend</th>
                <th className="px-4 py-3 font-semibold">Confidence</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No employees matching the criteria found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.employee_id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 font-bold text-white">
                          {emp.employee_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{emp.employee_name}</p>
                          <p className="text-[11px] text-slate-500">{emp.employee_code} • {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-800 font-semibold">{emp.department_name}</p>
                      <p className="text-[11px] text-slate-500">{emp.job_title}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{emp.risk_score}</span>
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, emp.risk_score)}%`,
                              backgroundColor: COLORS[emp.risk_level] || '#0D9488',
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${getRiskBadgeColor(emp.risk_level)}`}>
                        {emp.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(emp.risk_trend)}
                        <span className="text-slate-600">{emp.risk_trend}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {Math.round(emp.confidence_score * 100)}%
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenEmpDetail(emp)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-600"
                      >
                        View XAI Detail
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Risk Details Modal / Drawer */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 font-bold text-white text-lg">
                  {selectedEmp.employee_name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedEmp.employee_name}</h2>
                  <p className="text-xs text-slate-500">
                    {selectedEmp.employee_code} • {selectedEmp.department_name} • {selectedEmp.job_title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex h-64 items-center justify-center text-slate-500">
                <RefreshCw className="animate-spin text-teal-600" size={28} />
                <span className="ml-3 font-semibold">Calculating XAI Explainability Metrics...</span>
              </div>
            ) : empDetail ? (
              <div className="mt-6 space-y-6">
                {/* Score & Gauge Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {/* Score Card */}
                  <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-900 p-6 text-white text-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Risk Score</span>
                    <div className="my-3 text-5xl font-extrabold" style={{ color: COLORS[empDetail.risk_level] }}>
                      {empDetail.risk_score}
                    </div>
                    <span className={`rounded-full border px-4 py-1 text-xs font-bold ${getRiskBadgeColor(empDetail.risk_level)}`}>
                      {empDetail.risk_level} Risk Level
                    </span>
                    <div className="mt-4 text-xs text-slate-400">
                      Confidence Score: <strong className="text-white">{Math.round(empDetail.confidence_score * 100)}%</strong>
                    </div>
                  </div>

                  {/* Sub-scores Breakdown */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 md:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Weighted Sub-Score Components (100% Total)
                    </h4>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Behavioral Anomalies (35%)</span>
                        <span>{empDetail.anomaly_score} / 100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 mt-1">
                        <div className="h-full rounded-full bg-teal-600" style={{ width: `${empDetail.anomaly_score}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Privilege Misuse (25%)</span>
                        <span>{empDetail.privilege_score} / 100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 mt-1">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${empDetail.privilege_score}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Data Access Violations (20%)</span>
                        <span>{empDetail.data_access_score} / 100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 mt-1">
                        <div className="h-full rounded-full bg-orange-500" style={{ width: `${empDetail.data_access_score}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Access Pattern Deviations (10%)</span>
                        <span>{empDetail.access_pattern_score} / 100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 mt-1">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${empDetail.access_pattern_score}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Historical Security Events (10%)</span>
                        <span>{empDetail.history_score} / 100</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 mt-1">
                        <div className="h-full rounded-full bg-red-500" style={{ width: `${empDetail.history_score}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explainable AI (XAI) Reasons */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-teal-600" />
                    Explainable AI (XAI) Risk Factors
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {empDetail.reasons?.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-teal-600" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended SOC Actions */}
                <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-teal-900 flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-teal-600" />
                    Recommended SOC Remediation Actions
                  </h3>
                  <p className="text-xs text-teal-800 leading-relaxed font-medium">
                    {empDetail.recommendation}
                  </p>
                </div>

                {/* Triggering Events */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Triggering Telemetry Events</h3>
                  <div className="space-y-2 text-xs">
                    {empDetail.triggering_events?.map((evt, idx) => (
                      <div key={idx} className="rounded-xl bg-slate-50 p-3 text-slate-700 border border-slate-100">
                        {evt}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical Risk Score Trend Chart */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Historical Risk Score Progression</h3>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={empHistory}>
                        <XAxis dataKey="timestamp" stroke="#64748B" fontSize={10} tickFormatter={(val) => val ? val.substring(5, 10) : ''} />
                        <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
                        <Line type="monotone" dataKey="risk_score" stroke="#0D9488" strokeWidth={3} dot={{ r: 4 }} name="Risk Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleRecalculate}
                    disabled={recalculating}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={recalculating ? 'animate-spin' : ''} />
                    Recalculate Score On-Demand
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskDashboard;
