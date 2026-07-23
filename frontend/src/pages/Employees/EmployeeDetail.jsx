import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ShieldCheck, Briefcase, Activity as ActivityIcon, Clock3, Sparkles, RefreshCcw } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getEmployeeById, getEmployeeActivities, getRecentAlerts } from '../../services/employeeService';

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [employeeData, activityData, alertData] = await Promise.all([
        getEmployeeById(id),
        getEmployeeActivities(id),
        getRecentAlerts(),
      ]);

      setEmployee(employeeData);
      setActivities(activityData || []);
      setAlerts(alertData || []);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Unable to load employee details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const riskLevel = useMemo(() => {
    const score = employee?.risk_score ?? 0;
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }, [employee]);

  const riskBadgeClasses = useMemo(() => {
    if (riskLevel === 'Critical') return 'bg-danger/10 text-danger border-danger/20';
    if (riskLevel === 'High') return 'bg-warning/10 text-warning border-warning/20';
    if (riskLevel === 'Medium') return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-success/10 text-success border-success/20';
  }, [riskLevel]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full p-2 border border-border-color bg-white">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="h-8 w-48 rounded bg-slate-200 animate-pulse" />
            <div className="mt-2 h-4 w-64 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card className="p-6">
            <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="mt-4 space-y-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-4 rounded bg-slate-100 animate-pulse" />
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
            <div className="mt-4 space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-4 rounded bg-slate-100 animate-pulse" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[16px] border border-border-color bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle size={20} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-text-main">Unable to load employee profile</h2>
        <p className="mt-2 text-sm text-subtext">{error}</p>
        <Button className="mt-6" onClick={loadData}>
          <span className="flex items-center gap-2">
            <RefreshCcw size={16} /> Retry
          </span>
        </Button>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full border border-border-color bg-white p-2 shadow-sm">
            <ArrowLeft size={16} className="text-text-main" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-main">{employee.first_name} {employee.last_name}</h1>
            <p className="text-sm text-subtext">{employee.email}</p>
          </div>
        </div>
        <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${riskBadgeClasses}`}>
          Threat Level: {riskLevel}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck size={18} />
            <h2 className="text-lg font-semibold text-text-main">Employee Information</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Employee ID', employee.employee_id],
              ['Department', employee.department?.department_name || '—'],
              ['Role', employee.role?.role_name || '—'],
              ['Job Title', employee.job_title || '—'],
              ['Manager', employee.manager_name || '—'],
              ['Status', employee.status || '—'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[12px] bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-subtext">{label}</div>
                <div className="mt-1 text-sm font-medium text-text-main">{value}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle size={18} />
            <h2 className="text-lg font-semibold text-text-main">Risk Assessment</h2>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-[12px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-subtext">Risk Score</div>
              <div className="mt-1 text-2xl font-bold text-text-main">{employee.risk_score ?? '—'}</div>
            </div>
            <div className="rounded-[12px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-subtext">Threat Level</div>
              <div className={`mt-1 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${riskBadgeClasses}`}>{riskLevel}</div>
            </div>
            <div className="rounded-[12px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-subtext">Last Analysis</div>
              <div className="mt-1 text-sm font-medium text-text-main">{employee.updated_at ? new Date(employee.updated_at).toLocaleString() : '—'}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <Briefcase size={18} />
            <h2 className="text-lg font-semibold text-text-main">Behavior Summary</h2>
          </div>
          <div className="mt-6 rounded-[12px] border border-border-color bg-slate-50 p-4 text-sm text-subtext">
            Activity and behavioral insights for this employee will be surfaced here from the backend context when available.
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles size={18} />
            <h2 className="text-lg font-semibold text-text-main">Recommendations</h2>
          </div>
          <div className="mt-6 rounded-[12px] border border-border-color bg-slate-50 p-4 text-sm text-subtext">
            Review this profile alongside recent alerts and activity logs to determine the next monitoring action.
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <ActivityIcon size={18} />
            <h2 className="text-lg font-semibold text-text-main">Recent Activities</h2>
          </div>
          <div className="mt-6 space-y-3">
            {activities.length ? activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="rounded-[12px] border border-border-color bg-slate-50 p-4">
                <div className="text-sm font-semibold text-text-main">{activity.activity_type || 'Activity'}</div>
                <div className="mt-1 text-sm text-subtext">{activity.description || 'No description provided.'}</div>
                <div className="mt-2 flex items-center gap-2 text-xs font-medium text-subtext">
                  <Clock3 size={12} /> {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '—'}
                </div>
              </div>
            )) : <div className="text-sm text-subtext">No recent activities found.</div>}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle size={18} />
            <h2 className="text-lg font-semibold text-text-main">Recent Alerts</h2>
          </div>
          <div className="mt-6 space-y-3">
            {alerts.length ? alerts.slice(0, 5).map((alert) => (
              <div key={alert.employee_id || alert.id} className="rounded-[12px] border border-border-color bg-slate-50 p-4">
                <div className="text-sm font-semibold text-text-main">{alert.employee_name || 'Alert'}</div>
                <div className="mt-1 text-sm text-subtext">{alert.risk_reason || 'High-risk activity observed.'}</div>
                <div className="mt-2 text-xs font-medium text-subtext">Risk level: {alert.risk_level || 'Unknown'}</div>
              </div>
            )) : <div className="text-sm text-subtext">No recent alerts found.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDetail;
