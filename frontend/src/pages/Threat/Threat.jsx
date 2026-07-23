import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BrainCircuit,
  CalendarDays,
  RefreshCcw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import StatCard from '../../components/dashboard/StatCard';
import { getEmployees } from '../../services/employeeService';
import {
  analyzeThreat,
  getHighRiskEmployees,
  getThreatAssessment,
  getThreatHistory,
} from '../../services/threatService';

const chartColors = ['#10B981', '#2563EB', '#F59E0B', '#EF4444'];

const Threat = () => {
  const [highRiskEmployees, setHighRiskEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [threatAssessment, setThreatAssessment] = useState(null);
  const [threatHistory, setThreatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadThreatData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [highRiskData, employeesData] = await Promise.all([
          getHighRiskEmployees(),
          getEmployees({ page: 1, limit: 50 }),
        ]);

        const employeeList = employeesData?.items || employeesData?.data || employeesData || [];
        const employeesMapped = Array.isArray(employeeList) ? employeeList : [];

        setHighRiskEmployees(highRiskData || []);
        setEmployees(employeesMapped);

        const firstEmployee = employeesMapped[0];
        if (firstEmployee) {
          setSelectedEmployeeId(firstEmployee.id);
          const [assessmentData, historyData] = await Promise.all([
            getThreatAssessment(firstEmployee.id),
            getThreatHistory(firstEmployee.id),
          ]);
          setThreatAssessment(assessmentData);
          setThreatHistory(historyData || []);
        }
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || 'Unable to load threat data.');
      } finally {
        setLoading(false);
      }
    };

    loadThreatData();
  }, []);

  const handleSelectEmployee = async (employeeIdValue) => {
    setSelectedEmployeeId(employeeIdValue);
    try {
      setLoading(true);
      const [assessmentData, historyData] = await Promise.all([
        getThreatAssessment(employeeIdValue),
        getThreatHistory(employeeIdValue),
      ]);
      setThreatAssessment(assessmentData);
      setThreatHistory(historyData || []);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Unable to load threat details for the selected employee.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeThreat = async () => {
    if (!selectedEmployeeId) return;

    try {
      setAnalyzing(true);
      const analysisData = await analyzeThreat(selectedEmployeeId);
      setThreatAssessment(analysisData);
      const historyData = await getThreatHistory(selectedEmployeeId);
      setThreatHistory(historyData || []);
      const highRiskData = await getHighRiskEmployees();
      setHighRiskEmployees(highRiskData || []);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Threat analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const summaryCards = useMemo(() => {
    const totalThreats = highRiskEmployees.length;
    const criticalThreats = highRiskEmployees.filter((item) => item.threat_level === 'Critical').length;
    const highRiskEmployeesCount = highRiskEmployees.length;
    const averageThreatScore = highRiskEmployees.length
      ? Math.round(highRiskEmployees.reduce((sum, item) => sum + (item.threat_score || 0), 0) / highRiskEmployees.length)
      : 0;

    return [
      { title: 'Total Threats', value: totalThreats, subtitle: 'High & critical cases', icon: <ShieldAlert size={20} />, bgClass: 'bg-primary/10', colorClass: 'text-primary' },
      { title: 'High Risk Employees', value: highRiskEmployeesCount, subtitle: 'Flagged for review', icon: <Users size={20} />, bgClass: 'bg-warning/10', colorClass: 'text-warning' },
      { title: 'Critical Threats', value: criticalThreats, subtitle: 'Immediate attention', icon: <AlertTriangle size={20} />, bgClass: 'bg-danger/10', colorClass: 'text-danger' },
      { title: 'Average Threat Score', value: `${averageThreatScore}%`, subtitle: 'Across reviewed cases', icon: <BrainCircuit size={20} />, bgClass: 'bg-success/10', colorClass: 'text-success' },
    ];
  }, [highRiskEmployees]);

  const riskDistribution = useMemo(() => {
    const distribution = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0,
    };

    highRiskEmployees.forEach((item) => {
      if (distribution[item.threat_level]) distribution[item.threat_level] += 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [highRiskEmployees]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="p-6">
              <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-64 animate-pulse rounded bg-slate-50" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[16px] border border-border-color bg-white p-8 text-center">
        <h2 className="mt-4 text-xl font-semibold text-text-main">Unable to load threat data</h2>
        <p className="mt-2 text-sm text-subtext">{error}</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          <span className="flex items-center gap-2">
            <RefreshCcw size={16} /> Retry
          </span>
        </Button>
      </div>
    );
  }

  if (!highRiskEmployees.length && !employees.length) {
    return <EmptyState title="No threat data available" description="Threat assessments will appear here once the backend has analyzed employees." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-main">Threat Detection</h1>
          <p className="text-sm text-subtext mt-1">Review high-risk employees, inspect their latest assessment, and trigger fresh analysis when needed.</p>
        </div>
        <div className="rounded-full border border-border-color bg-white px-3 py-1.5 text-sm text-subtext">
          {highRiskEmployees.length} active threat cases
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border-color p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-main">High Risk Employees</h2>
                <p className="text-sm text-subtext">Select an employee to inspect their latest assessment and history.</p>
              </div>
              <div className="w-full sm:w-64">
                <label className="mb-2 block text-sm font-medium text-text-main">Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(event) => handleSelectEmployee(event.target.value)}
                  className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none"
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.first_name} {employee.last_name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Employee', 'Department', 'Threat Score', 'Threat Level', 'Recommendation', 'Last Analysis'].map((column) => (
                    <th key={column} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-subtext">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color bg-white">
                {highRiskEmployees.map((employee) => (
                  <tr key={employee.employee_id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-medium text-text-main">{employee.employee_name}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{employees.find((item) => item.id === employee.employee_id)?.department?.department_name || '—'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{employee.threat_score?.toFixed(1) ?? '—'}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${employee.threat_level === 'Critical' ? 'bg-danger/10 text-danger' : employee.threat_level === 'High' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                        {employee.threat_level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-subtext">{threatAssessment?.recommendation || '—'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{employee.last_analyzed ? new Date(employee.last_analyzed).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-main">Threat Analysis Panel</h2>
              <p className="text-sm text-subtext">Current assessment for the selected employee.</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <AlertTriangle size={18} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Threat Score</div>
              <div className="mt-2 text-3xl font-semibold text-text-main">{threatAssessment?.threat_score?.toFixed(1) ?? '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Risk Score</div>
              <div className="mt-2 text-2xl font-semibold text-text-main">{threatAssessment?.threat_score?.toFixed(1) ?? '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Confidence Score</div>
              <div className="mt-2 text-2xl font-semibold text-text-main">{threatAssessment?.confidence_score != null ? `${(threatAssessment.confidence_score * 100).toFixed(0)}%` : '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Threat Explanation</div>
              <div className="mt-2 text-sm text-subtext">{threatAssessment?.explanation || 'No explanation available yet.'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">AI Recommendation</div>
              <div className="mt-2 text-sm text-subtext">{threatAssessment?.recommendation || 'No recommendation available yet.'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Last Analysis Time</div>
              <div className="mt-2 text-sm text-subtext">{threatAssessment?.last_analyzed ? new Date(threatAssessment.last_analyzed).toLocaleString() : 'No analysis yet.'}</div>
            </div>
            <Button className="w-full" onClick={handleAnalyzeThreat} disabled={analyzing}>
              {analyzing ? 'Analyzing…' : 'Analyze Threat'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-main">Threat History Timeline</h2>
              <p className="text-sm text-subtext">Historical threat assessments for the selected employee.</p>
            </div>
            <div className="rounded-full bg-accent/10 p-2 text-accent">
              <CalendarDays size={18} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {threatHistory.length ? threatHistory.map((item, index) => (
              <div key={`${item.employee_id}-${index}`} className="rounded-[14px] border border-border-color bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-text-main">{item.threat_level}</div>
                  <div className="text-sm text-subtext">{item.last_analyzed ? new Date(item.last_analyzed).toLocaleString() : '—'}</div>
                </div>
                <div className="mt-2 text-sm text-subtext">Score {item.threat_score?.toFixed(1) ?? '—'} • Confidence {(item.confidence_score * 100).toFixed(0)}%</div>
                <div className="mt-2 text-sm text-subtext">{item.explanation || item.recommendation || 'No details available.'}</div>
              </div>
            )) : <EmptyState title="No history yet" description="This employee has no prior threat assessments yet." />}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-main">Risk Distribution</h2>
              <p className="text-sm text-subtext">Volume of low, medium, high, and critical cases.</p>
            </div>
            <div className="rounded-full bg-success/10 p-2 text-success">
              <ShieldAlert size={18} />
            </div>
          </div>

          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Threat;
