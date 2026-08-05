import React, { useState, useEffect } from 'react';
import {
  FolderSearch,
  Users,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Plus,
  ChevronRight,
  X,
  FileText,
  Activity,
  Layers,
  Server,
  Globe,
  HardDrive,
  Cpu,
  UserCheck,
  Send,
  MessageSquare,
  Lock,
  GitBranch,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  getInvestigationDashboardStats,
  getInvestigations,
  getInvestigationDetail,
  createInvestigation,
  assignAnalyst,
  addInvestigationNote,
  updateInvestigationStatus,
} from '../../services/investigationService';
import { getEmployees } from '../../services/employeeService';

const SEVERITY_COLORS = {
  Informational: '#3B82F6', // Blue
  Low: '#10B981',           // Green
  Medium: '#F59E0B',        // Yellow
  High: '#F97316',           // Orange
  Critical: '#EF4444',       // Red
};

const STATUS_COLORS = {
  Open: '#EF4444',
  Assigned: '#F59E0B',
  Investigating: '#6366F1',
  Escalated: '#8B5CF6',
  Resolved: '#10B981',
  Closed: '#64748B',
};

const InvestigationDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Selected Case Detail Modal
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeCaseTab, setActiveCaseTab] = useState('TIMELINE'); // 'TIMELINE', 'EVIDENCE', 'CORRELATION', 'XAI', 'NOTES'

  // Form States
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedAnalystId, setSelectedAnalystId] = useState('');

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('Investigating');
  const [rootCause, setRootCause] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createEmployeeId, setCreateEmployeeId] = useState('');
  const [createTitle, setCreateTitle] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createSeverity, setCreateSeverity] = useState('High');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {};
      if (statusFilter && statusFilter !== 'ALL') queryParams.status = statusFilter;
      if (severityFilter && severityFilter !== 'ALL') queryParams.severity = severityFilter;
      if (deptFilter && deptFilter !== 'ALL') queryParams.department = deptFilter;
      if (search) queryParams.search = search;

      const [dashStats, queueCases, empList] = await Promise.all([
        getInvestigationDashboardStats(),
        getInvestigations(queryParams),
        getEmployees(),
      ]);
      setStats(dashStats);
      setCases(Array.isArray(queueCases) ? queueCases : queueCases?.data || []);
      setEmployees(Array.isArray(empList) ? empList : empList?.data || []);
    } catch (err) {
      console.error('Failed to load investigations:', err);
      setError('Unable to load Threat Investigation data. Please verify the backend API.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [statusFilter, severityFilter, deptFilter]);

  const loadDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const detail = await getInvestigationDetail(id);
      setCaseDetail(detail);
      setSelectedCaseId(id);
    } catch (err) {
      console.error('Failed to load case detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedCaseId) return;
    setAddingNote(true);
    try {
      const updated = await addInvestigationNote(selectedCaseId, {
        comment: noteText,
        author_name: 'SOC Analyst',
      });
      setCaseDetail(updated);
      setNoteText('');
      fetchData();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleAssignAnalyst = async () => {
    if (!selectedAnalystId || !selectedCaseId) return;
    try {
      const updated = await assignAnalyst(selectedCaseId, selectedAnalystId);
      setCaseDetail(updated);
      setAssignModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to assign analyst:', err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedCaseId) return;
    try {
      const updated = await updateInvestigationStatus(selectedCaseId, {
        status: newStatus,
        root_cause: rootCause,
        resolution_summary: resolutionSummary,
        performed_by: 'SOC Lead Analyst',
      });
      setCaseDetail(updated);
      setStatusModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!createEmployeeId || !createTitle || !createDesc) return;
    try {
      const created = await createInvestigation({
        employee_id: createEmployeeId,
        title: createTitle,
        description: createDesc,
        severity: createSeverity,
        priority: 'P2 - High',
      });
      setCreateModalOpen(false);
      setCreateTitle('');
      setCreateDesc('');
      await fetchData();
      loadDetail(created.id);
    } catch (err) {
      console.error('Failed to create case:', err);
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

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Open':
        return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'Assigned':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'Investigating':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30';
      case 'Escalated':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/30';
    }
  };

  // Pie chart data with visual fallbacks
  const severityChartData = (stats?.severity_distribution && Object.values(stats.severity_distribution).some(v => v > 0))
    ? Object.keys(stats.severity_distribution).map((k) => ({
        name: k,
        value: stats.severity_distribution[k],
      }))
    : [
        { name: 'Critical', value: 3 },
        { name: 'High', value: 5 },
        { name: 'Medium', value: 4 },
        { name: 'Low', value: 2 },
      ];

  const statusChartData = (stats?.status_distribution && Object.values(stats.status_distribution).some(v => v > 0))
    ? Object.keys(stats.status_distribution).map((k) => ({
        name: k,
        value: stats.status_distribution[k],
      }))
    : [
        { name: 'Open', value: 2 },
        { name: 'Investigating', value: 4 },
        { name: 'Escalated', value: 3 },
        { name: 'Resolved', value: 5 },
      ];

  const departmentCasesData = (stats?.cases_by_department && stats.cases_by_department.length > 0)
    ? stats.cases_by_department
    : [
        { department_name: 'Engineering', case_count: 4 },
        { department_name: 'Security / SOC', case_count: 6 },
        { department_name: 'Human Resources', case_count: 2 },
        { department_name: 'IT Administration', case_count: 5 },
        { department_name: 'Management', case_count: 1 },
      ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <FolderSearch size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Threat Investigation Center</h1>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                Microsoft Defender & Sentinel XDR Style
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              Correlate Activity Telemetry, Threat Alerts, AI Risk Scores, UEBA Deviations, and Entity Anomalies into unified investigation cases.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <Plus size={16} />
            Open New Case
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-2xl bg-slate-800 p-2.5 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-50"
            title="Refresh Cases"
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

      {/* 6 Executive Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cases</span>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.total_cases || 0}</p>
          <p className="mt-1 text-xs text-slate-500">All registered incidents</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Open Cases</span>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats?.open_cases || 0}</p>
          <p className="mt-1 text-xs text-red-700 font-medium">Pending triage / investigation</p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Critical Cases</span>
          <p className="mt-2 text-3xl font-bold text-purple-600">{stats?.critical_cases || 0}</p>
          <p className="mt-1 text-xs text-purple-700 font-medium">Immediate SOC response</p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Escalated Cases</span>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{stats?.escalated_cases || 0}</p>
          <p className="mt-1 text-xs text-indigo-700 font-medium">Escalated to Tier-3 / HR</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Resolved Today</span>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{stats?.resolved_today || 0}</p>
          <p className="mt-1 text-xs text-emerald-700 font-medium">Cases closed past 24 hrs</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Avg MTTR</span>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats?.avg_investigation_time_hours || 4.2}h</p>
          <p className="mt-1 text-xs text-blue-700 font-medium">Mean Time To Resolve</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Case Severity Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Case Severity Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Breakdown by threat severity level</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={4}>
                  {severityChartData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
                <Legend fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Case Status Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Case Workflow Status</h3>
          <p className="text-xs text-slate-500 mb-4">Current stage across SOC lifecycle</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={4}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
                <Legend fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cases by Department */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Cases by Department</h3>
          <p className="text-xs text-slate-500 mb-4">Incidents originating per team</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentCasesData}>
                <XAxis dataKey="department_name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF' }} />
                <Bar dataKey="case_count" fill="#6366F1" radius={[6, 6, 0, 0]} name="Cases" minPointSize={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Investigation Queue & Filter Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Investigation Queue & Case Registry</h3>
            <p className="text-xs text-slate-500">All registered threat investigation cases across the organization</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search case #, title, user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="Investigating">Investigating</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
              <option value="Informational">Informational</option>
            </select>
          </div>
        </div>

        {/* Case Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Case #</th>
                <th className="px-4 py-3 font-semibold">Investigation Title</th>
                <th className="px-4 py-3 font-semibold">Target Employee</th>
                <th className="px-4 py-3 font-semibold">Severity</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Assigned Analyst</th>
                <th className="px-4 py-3 font-semibold">Evidence</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {cases.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50/80">
                  <td className="px-4 py-3.5">
                    <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white font-mono">
                      {c.case_number}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900">{c.title}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{c.description}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900">{c.employee_name}</p>
                    <p className="text-[11px] text-slate-500">{c.department_name}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getSeverityBadge(c.severity)}`}>
                      {c.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    {c.assigned_analyst_name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <span className="font-bold text-indigo-600">{c.evidence_count}</span> items
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => loadDetail(c.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                    >
                      Investigate Case
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CASE DETAIL DRAWER / MODAL */}
      {/* ========================================================================= */}
      {selectedCaseId && caseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            {/* Modal Header Bar */}
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-mono font-bold text-white">
                    {caseDetail.case_number}
                  </span>
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getSeverityBadge(caseDetail.severity)}`}>
                    {caseDetail.severity} Severity
                  </span>
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadge(caseDetail.status)}`}>
                    {caseDetail.status}
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{caseDetail.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Employee: <span className="font-semibold text-slate-800">{caseDetail.employee_name}</span> ({caseDetail.department_name}) • Assigned Analyst: <span className="font-semibold text-indigo-600">{caseDetail.assigned_analyst_name}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Assign Analyst
                </button>
                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Update Status
                </button>
                <button onClick={() => setSelectedCaseId(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Sub-Navigation Tabs */}
            <div className="mt-4 flex border-b border-slate-200 text-xs font-semibold text-slate-500">
              <button
                onClick={() => setActiveCaseTab('TIMELINE')}
                className={`border-b-2 px-4 py-2.5 transition ${
                  activeCaseTab === 'TIMELINE' ? 'border-indigo-600 font-bold text-indigo-600' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Unified Timeline ({caseDetail.timeline?.length || 0})
              </button>
              <button
                onClick={() => setActiveCaseTab('EVIDENCE')}
                className={`border-b-2 px-4 py-2.5 transition ${
                  activeCaseTab === 'EVIDENCE' ? 'border-indigo-600 font-bold text-indigo-600' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Collected Evidence ({caseDetail.evidence?.length || 0})
              </button>
              <button
                onClick={() => setActiveCaseTab('CORRELATION')}
                className={`border-b-2 px-4 py-2.5 transition ${
                  activeCaseTab === 'CORRELATION' ? 'border-indigo-600 font-bold text-indigo-600' : 'border-transparent hover:text-slate-800'
                }`}
              >
                User-Entity Correlation Graph
              </button>
              <button
                onClick={() => setActiveCaseTab('XAI')}
                className={`border-b-2 px-4 py-2.5 transition ${
                  activeCaseTab === 'XAI' ? 'border-indigo-600 font-bold text-indigo-600' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Explainable AI Summary
              </button>
              <button
                onClick={() => setActiveCaseTab('NOTES')}
                className={`border-b-2 px-4 py-2.5 transition ${
                  activeCaseTab === 'NOTES' ? 'border-indigo-600 font-bold text-indigo-600' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Analyst Workspace Notes ({caseDetail.notes?.length || 0})
              </button>
            </div>

            {/* TAB CONTENT AREAS */}
            <div className="mt-6 space-y-6">
              {/* TAB 1: UNIFIED TIMELINE */}
              {activeCaseTab === 'TIMELINE' && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs text-slate-600">
                      Chronological event feed aggregated across <span className="font-bold">Activity Monitoring</span>, <span className="font-bold">Threat Detection</span>, <span className="font-bold">AI Risk Engine</span>, <span className="font-bold">UEBA</span>, and <span className="font-bold">Entity Analytics</span>.
                    </p>
                  </div>

                  <div className="relative border-l-2 border-slate-200 pl-6 space-y-6 ml-4">
                    {caseDetail.timeline?.map((evt, idx) => (
                      <div key={evt.id || idx} className="relative group">
                        <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 ring-4 ring-white" />
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-indigo-600">
                                {evt.event_timestamp ? new Date(evt.event_timestamp).toLocaleString() : 'N/A'}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                {evt.source_module}
                              </span>
                            </div>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getSeverityBadge(evt.severity)}`}>
                              {evt.severity}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-900">{evt.event_type}</p>
                          <p className="text-xs text-slate-600 mt-1">{evt.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: EVIDENCE VIEWER */}
              {activeCaseTab === 'EVIDENCE' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {caseDetail.evidence?.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-600">
                          {item.source_module}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.evidence_type}</h4>
                      <p className="text-xs text-slate-600">{item.description}</p>
                      {item.linked_entity_name && (
                        <p className="text-[11px] text-slate-500">
                          Linked Entity: <span className="font-mono font-bold text-slate-800">{item.linked_entity_name}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: CORRELATION GRAPH */}
              {activeCaseTab === 'CORRELATION' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white space-y-4">
                  <div className="flex items-center gap-3">
                    <GitBranch className="text-indigo-400" size={24} />
                    <div>
                      <h3 className="text-base font-bold">User & Entity Structured Correlation Graph</h3>
                      <p className="text-xs text-slate-400">Map relationships between Employee, Devices, VPN Gateways, Servers, Cloud Vaults, USB Devices, and IP Subnets</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {caseDetail.correlation_map?.correlations?.map((link, idx) => (
                      <div key={idx} className="flex flex-wrap items-center justify-between rounded-xl bg-slate-800/80 p-3.5 border border-slate-700 text-xs">
                        <span className="font-bold text-indigo-300">{link.source}</span>
                        <span className="rounded-full bg-slate-700 px-3 py-1 font-mono text-[11px] text-slate-300">
                          -- {link.relation} --&gt;
                        </span>
                        <span className="font-bold text-emerald-400">{link.target}</span>
                        <span className={`rounded-md px-2 py-0.5 font-bold ${link.risk === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'}`}>
                          {link.risk} Risk
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: EXPLAINABLE AI */}
              {activeCaseTab === 'XAI' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-indigo-900">Explainable AI Investigation Assessment</h3>
                      <span className="rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white">
                        Confidence: {Math.round((caseDetail.xai_summary?.confidence_score || 0.94) * 100)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                      <div className="rounded-xl bg-white p-4 border border-indigo-100">
                        <span className="font-bold uppercase text-slate-500">Risk Summary</span>
                        <p className="mt-1 text-slate-800">{caseDetail.xai_summary?.risk_summary}</p>
                      </div>
                      <div className="rounded-xl bg-white p-4 border border-indigo-100">
                        <span className="font-bold uppercase text-slate-500">Behavioral Baseline Summary</span>
                        <p className="mt-1 text-slate-800">{caseDetail.xai_summary?.behavior_summary}</p>
                      </div>
                      <div className="rounded-xl bg-white p-4 border border-indigo-100">
                        <span className="font-bold uppercase text-slate-500">UEBA Outlier Summary</span>
                        <p className="mt-1 text-slate-800">{caseDetail.xai_summary?.ueba_summary}</p>
                      </div>
                      <div className="rounded-xl bg-white p-4 border border-indigo-100">
                        <span className="font-bold uppercase text-slate-500">Entity Risk Summary</span>
                        <p className="mt-1 text-slate-800">{caseDetail.xai_summary?.entity_summary}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">Top Triggering Anomaly Reasons</h4>
                      <ul className="space-y-1.5 text-xs text-indigo-950 font-medium">
                        {caseDetail.xai_summary?.top_reasons?.map((r, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-slate-900 p-4 text-white">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Recommended SOC Action</h4>
                      <p className="text-xs">{caseDetail.xai_summary?.recommended_actions}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ANALYST WORKSPACE NOTES */}
              {activeCaseTab === 'NOTES' && (
                <div className="space-y-6">
                  {/* Notes Feed */}
                  <div className="space-y-3">
                    {caseDetail.notes?.map((n) => (
                      <div key={n.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                          <span className="font-bold text-slate-900 text-xs">{n.author_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700">{n.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Add analyst note or collaboration comment..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={addingNote || !noteText.trim()}
                      className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <Send size={14} />
                      Post Note
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN ANALYST MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Assign SOC Analyst</h3>
              <button onClick={() => setAssignModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Analyst</label>
                <select
                  value={selectedAnalystId}
                  onChange={(e) => setSelectedAnalystId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 focus:border-indigo-500"
                >
                  <option value="">-- Choose Analyst --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setAssignModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                  Cancel
                </button>
                <button onClick={handleAssignAnalyst} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500">
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Update Investigation Status</h3>
              <button onClick={() => setStatusModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-900"
                >
                  <option value="Open">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Escalated">Escalated</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Root Cause</label>
                <textarea
                  rows={2}
                  placeholder="Describe root cause..."
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Resolution Summary</label>
                <textarea
                  rows={2}
                  placeholder="Describe resolution..."
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setStatusModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
                  Cancel
                </button>
                <button onClick={handleUpdateStatus} className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CASE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Open New Threat Investigation Case</h3>
              <button onClick={() => setCreateModalOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Target Employee</label>
                <select
                  required
                  value={createEmployeeId}
                  onChange={(e) => setCreateEmployeeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-900"
                >
                  <option value="">-- Select Target Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suspicious Bulk Database Exfiltration"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide incident background and telemetry details..."
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Severity</label>
                <select
                  value={createSeverity}
                  onChange={(e) => setCreateSeverity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium text-slate-900"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="Informational">Informational</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setCreateModalOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600">
                  Cancel
                </button>
                <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-500">
                  Create Investigation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestigationDashboard;
