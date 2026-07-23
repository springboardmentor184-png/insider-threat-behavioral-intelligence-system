import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Download,
  FileText,
  RefreshCcw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import StatCard from '../../components/dashboard/StatCard';
import { getEmployees } from '../../services/employeeService';
import {
  exportReport,
  getDepartmentReport,
  getEmployeeReport,
  getHighRiskReports,
  getRecentAnomalies,
} from '../../services/reportService';

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [highRiskReports, setHighRiskReports] = useState([]);
  const [recentAnomalies, setRecentAnomalies] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeReport, setEmployeeReport] = useState(null);
  const [departmentReport, setDepartmentReport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const [employeesData, highRiskData, anomaliesData] = await Promise.all([
          getEmployees({ page: 1, limit: 50 }),
          getHighRiskReports(),
          getRecentAnomalies({ page: 1, limit: 10 }),
        ]);

        const employeeList = employeesData?.items || employeesData?.data || employeesData || [];
        const normalizedEmployees = Array.isArray(employeeList) ? employeeList : [];

        setEmployees(normalizedEmployees);
        setHighRiskReports(highRiskData || []);
        setRecentAnomalies(anomaliesData?.items || []);

        if (normalizedEmployees[0]) {
          setSelectedEmployeeId(normalizedEmployees[0].id);
          const [employeeReportData, departmentReportData] = await Promise.all([
            getEmployeeReport(normalizedEmployees[0].id),
            getDepartmentReport(normalizedEmployees[0].department_id || normalizedEmployees[0].department?.id),
          ]);
          setEmployeeReport(employeeReportData);
          setDepartmentReport(departmentReportData);
        }

        setSummary({
          totalReports: highRiskData?.length || 0,
          highRiskEmployees: highRiskData?.filter((item) => item.risk_level === 'High' || item.risk_level === 'Critical').length || 0,
          recentAnomalies: anomaliesData?.items?.length || 0,
          departmentRiskCount: highRiskData?.length || 0,
        });
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || 'Unable to load reports.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleSelectEmployee = async (employeeIdValue) => {
    setSelectedEmployeeId(employeeIdValue);
    try {
      setLoading(true);
      const [employeeReportData, departmentReportData] = await Promise.all([
        getEmployeeReport(employeeIdValue),
        getDepartmentReport(employees.find((item) => item.id === employeeIdValue)?.department_id || employees.find((item) => item.id === employeeIdValue)?.department?.id),
      ]);
      setEmployeeReport(employeeReportData);
      setDepartmentReport(departmentReportData);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Unable to load the selected employee report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await exportReport();
      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'security-report.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const summaryCards = useMemo(() => [
    { title: 'Total Reports', value: summary?.totalReports ?? 0, subtitle: 'High risk employee reports', icon: <FileText size={20} />, bgClass: 'bg-primary/10', colorClass: 'text-primary' },
    { title: 'High Risk Employees', value: summary?.highRiskEmployees ?? 0, subtitle: 'Flagged for review', icon: <AlertTriangle size={20} />, bgClass: 'bg-warning/10', colorClass: 'text-warning' },
    { title: 'Recent Anomalies', value: summary?.recentAnomalies ?? 0, subtitle: 'Latest suspicious events', icon: <ShieldAlert size={20} />, bgClass: 'bg-danger/10', colorClass: 'text-danger' },
    { title: 'Department Risk Count', value: summary?.departmentRiskCount ?? 0, subtitle: 'Departments with elevated risk', icon: <Users size={20} />, bgClass: 'bg-success/10', colorClass: 'text-success' },
  ], [summary]);

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
        <h2 className="mt-4 text-xl font-semibold text-text-main">Unable to load reports</h2>
        <p className="mt-2 text-sm text-subtext">{error}</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          <span className="flex items-center gap-2">
            <RefreshCcw size={16} /> Retry
          </span>
        </Button>
      </div>
    );
  }

  if (!employees.length && !highRiskReports.length && !recentAnomalies.length) {
    return <EmptyState title="No report data available" description="Reports will appear here once the backend has generated employee and department assessments." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-main">Reports</h1>
          <p className="text-sm text-subtext mt-1">Review organization-wide security summaries, high-risk employee reports, and recent anomalies.</p>
        </div>
        <Button onClick={handleExport} disabled={exporting}>
          <span className="flex items-center gap-2">
            <Download size={16} /> {exporting ? 'Exporting…' : 'Export Report'}
          </span>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-border-color p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-text-main">Employee Reports</h2>
                <p className="text-sm text-subtext">Inspect the latest risk and threat details for selected employees.</p>
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
                  {['Employee', 'Department', 'Risk Score', 'Threat Score', 'Recommendation', 'Last Analysis', 'View Details'].map((column) => (
                    <th key={column} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-subtext">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color bg-white">
                {highRiskReports.map((report) => (
                  <tr key={report.employee_id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-medium text-text-main">{report.employee_name}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{report.department || '—'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{report.risk_score?.toFixed(1) ?? '—'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{report.threat_score?.toFixed(1) ?? '—'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{report.recommendation || '—'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{report.last_analyzed ? new Date(report.last_analyzed).toLocaleString() : '—'}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleSelectEmployee(report.employee_id)}
                        className={`inline-flex items-center justify-center rounded-[10px] border px-3 py-1.5 text-xs font-semibold transition-all ${
                          selectedEmployeeId === report.employee_id
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white border-border-color text-text-main hover:bg-slate-50'
                        }`}
                      >
                        {selectedEmployeeId === report.employee_id ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-main">Department Report</h2>
              <p className="text-sm text-subtext">Department risk posture and counts.</p>
            </div>
            <div className="rounded-full bg-accent/10 p-2 text-accent">
              <Users size={18} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Department</div>
              <div className="mt-2 text-xl font-semibold text-text-main">{departmentReport?.department_name || '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Average Risk</div>
              <div className="mt-2 text-xl font-semibold text-text-main">{departmentReport?.average_risk_score?.toFixed(1) ?? '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Employee Count</div>
              <div className="mt-2 text-xl font-semibold text-text-main">{departmentReport?.total_employees ?? '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">High Risk Count</div>
              <div className="mt-2 text-xl font-semibold text-text-main">{departmentReport?.high_risk_employees ?? '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Department Status</div>
              <div className="mt-2 text-sm font-semibold text-warning">{departmentReport?.department_risk_level || '—'}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-main">Recent Anomalies</h2>
              <p className="text-sm text-subtext">Latest anomaly activity captured across the organization.</p>
            </div>
            <div className="rounded-full bg-danger/10 p-2 text-danger">
              <ShieldAlert size={18} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {recentAnomalies.length ? recentAnomalies.map((anomaly, index) => (
              <div key={`${anomaly.employee_id}-${index}`} className="rounded-[14px] border border-border-color bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-text-main">{anomaly.employee_name}</div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-subtext">{anomaly.severity}</div>
                </div>
                <div className="mt-2 text-sm text-subtext">{anomaly.anomaly_type}</div>
                <div className="mt-2 text-sm text-subtext">{anomaly.description || 'No description provided.'}</div>
                <div className="mt-2 text-xs text-subtext">{anomaly.timestamp ? new Date(anomaly.timestamp).toLocaleString() : '—'}</div>
              </div>
            )) : <EmptyState title="No anomalies found" description="No recent anomaly records are available right now." />}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-main">Selected Employee Summary</h2>
              <p className="text-sm text-subtext">At-a-glance report details for the chosen employee.</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <FileText size={18} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Employee</div>
              <div className="mt-2 text-xl font-semibold text-text-main">{employeeReport?.employee?.employee_name || '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Risk Level</div>
              <div className="mt-2 text-lg font-semibold text-text-main">{employeeReport?.risk_level || '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Threat Level</div>
              <div className="mt-2 text-lg font-semibold text-text-main">{employeeReport?.threat_level || '—'}</div>
            </div>
            <div className="rounded-[14px] bg-slate-50 p-4">
              <div className="text-sm font-semibold text-subtext">Recommendation</div>
              <div className="mt-2 text-sm text-subtext">{employeeReport?.recommendation || '—'}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
