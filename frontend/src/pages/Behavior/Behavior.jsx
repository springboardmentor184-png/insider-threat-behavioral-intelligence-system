import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Clock3,
  FileSearch,
  Laptop2,
  RefreshCcw,
  ShieldAlert,
  UserCheck,
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
import { useAuth } from '../../context/AuthContext';
import {
  getBehaviorBaseline,
  getBehaviorProfile,
  getDeviceUsage,
  getLoginPattern,
  getResourceAccess,
  getWorkPattern,
} from '../../services/behaviorService';
import { getEmployees, getEmployeeById } from '../../services/employeeService';

const chartColors = ['#2563EB', '#0F766E', '#F59E0B', '#EF4444', '#8B5CF6'];

const Behavior = () => {
  const { user } = useAuth();
  const userEmployeeId = user?.id || user?.employee_id || user?.employeeId;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');

  const [baseline, setBaseline] = useState(null);
  const [loginPattern, setLoginPattern] = useState(null);
  const [workPattern, setWorkPattern] = useState(null);
  const [deviceUsage, setDeviceUsage] = useState(null);
  const [resourceAccess, setResourceAccess] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employee list if authorized
  useEffect(() => {
    const loadEmployeesList = async () => {
      try {
        const response = await getEmployees({ page: 1, limit: 100 });
        const data = response?.items || response?.data || response || [];
        if (Array.isArray(data) && data.length > 0) {
          setEmployees(data);
          const hasUser = data.find(emp => emp.id === userEmployeeId);
          const initialId = hasUser ? userEmployeeId : data[0].id;
          setSelectedEmployeeId(initialId);
        } else {
          setSelectedEmployeeId(userEmployeeId || '');
        }
      } catch (err) {
        console.error('Failed to load employees list:', err);
        setSelectedEmployeeId(userEmployeeId || '');
      }
    };

    const isAuthorized = user?.role?.role_name === 'Administrator' || 
                         user?.role?.role_name === 'Security Analyst' || 
                         user?.role === 'Administrator' || 
                         user?.role === 'Security Analyst';

    if (isAuthorized) {
      loadEmployeesList();
    } else {
      setSelectedEmployeeId(userEmployeeId || '');
    }
  }, [userEmployeeId, user]);

  // Load behavior details when selected employee ID changes
  useEffect(() => {
    const loadBehaviorData = async () => {
      if (!selectedEmployeeId) return;

      try {
        setLoading(true);
        setError(null);

        const [baselineData, loginData, workData, deviceData, resourceData, profileData, employeeData] = await Promise.all([
          getBehaviorBaseline(selectedEmployeeId),
          getLoginPattern(selectedEmployeeId),
          getWorkPattern(selectedEmployeeId),
          getDeviceUsage(selectedEmployeeId),
          getResourceAccess(selectedEmployeeId),
          getBehaviorProfile(selectedEmployeeId).catch(() => null),
          getEmployeeById(selectedEmployeeId).catch(() => null),
        ]);

        setBaseline(baselineData);
        setLoginPattern(loginData);
        setWorkPattern(workData);
        setDeviceUsage(deviceData);
        setResourceAccess(resourceData);
        setProfile(profileData);

        if (employeeData) {
          setSelectedEmployeeName(`${employeeData.first_name} ${employeeData.last_name}`);
        } else {
          setSelectedEmployeeName(selectedEmployeeId.slice(0, 8));
        }
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || 'Unable to load behavior analytics data.');
      } finally {
        setLoading(false);
      }
    };

    loadBehaviorData();
  }, [selectedEmployeeId]);

  const loginChartData = useMemo(() => {
    if (!loginPattern?.weekday_login_distribution) return [];

    return Object.entries(loginPattern.weekday_login_distribution).map(([name, value]) => ({ name, value }));
  }, [loginPattern]);

  const accessChartData = useMemo(() => {
    if (!resourceAccess) return [];

    return [
      { name: 'Files / Day', value: Math.round(resourceAccess.average_files_per_day || 0) },
      { name: 'After-hours', value: resourceAccess.after_hours_access_count || 0 },
      { name: 'Freq. Score', value: Math.round(resourceAccess.access_frequency_score || 0) },
    ];
  }, [resourceAccess]);

  const computedRiskScore = useMemo(() => {
    if (profile?.profile_score != null) return Math.round(profile.profile_score);

    const fallback = (deviceUsage?.external_device_usage_count || 0) * 10;
    const afterHours = (resourceAccess?.after_hours_access_count || 0) * 8;
    const weekend = (loginPattern?.weekend_login_count || 0) * 9;
    const usb = (deviceUsage?.usb_activity_count || 0) * 4;
    const inconsistency = workPattern?.consistency_score != null ? Math.max(0, 100 - workPattern.consistency_score) * 0.5 : 0;

    return Math.min(100, Math.round(fallback + afterHours + weekend + usb + inconsistency));
  }, [deviceUsage, loginPattern, profile, resourceAccess, workPattern]);

  const riskStatus = computedRiskScore >= 80 ? 'High Risk' : computedRiskScore >= 55 ? 'Moderate Risk' : 'Low Risk';
  const unusualLogin = loginPattern?.weekend_login_count > 0 || (loginPattern?.most_frequent_login_hour != null && (loginPattern.most_frequent_login_hour < 6 || loginPattern.most_frequent_login_hour > 22));
  const newDeviceDetected = (deviceUsage?.external_device_usage_count || 0) > 0 || (deviceUsage?.trusted_device_percentage || 0) < 70;
  const sensitiveResourceAccess = (resourceAccess?.after_hours_access_count || 0) > 0 || (resourceAccess?.access_frequency_score || 0) > 70;

  const handleSelectEmployee = (id) => {
    setSelectedEmployeeId(id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded bg-slate-50" />
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-4 h-64 animate-pulse rounded bg-slate-50" />
            </Card>
          </div>
          <Card className="p-6">
            <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-4 space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-12 animate-pulse rounded bg-slate-50" />
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
        <h2 className="mt-4 text-xl font-semibold text-text-main">Unable to load behavior analytics</h2>
        <p className="mt-2 text-sm text-subtext">{error}</p>
        <Button className="mt-6" onClick={() => selectedEmployeeId && window.location.reload()}>
          <span className="flex items-center gap-2">
            <RefreshCcw size={16} /> Retry
          </span>
        </Button>
      </div>
    );
  }

  if (!baseline && !loginPattern && !workPattern && !deviceUsage && !resourceAccess) {
    return <EmptyState title="No behavior profile available" description="Behavior data will appear here once the backend generates a profile for this employee." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-main">Behavior Analytics</h1>
          <p className="text-sm text-subtext mt-1">Review behavioral baselines, access patterns, and risk indicators for the selected employee.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {employees.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-text-main">Employee:</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => handleSelectEmployee(e.target.value)}
                className="rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm text-text-main outline-none focus:border-primary shadow-sm"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="rounded-full border border-border-color bg-white px-3 py-1.5 text-sm font-medium text-primary shadow-sm">
            {selectedEmployeeName}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ROW 1: Behavioral Baseline (left) & Resource Access (right) */}
        <div className="xl:col-span-2 flex flex-col">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text-main">Behavioral Baseline</h2>
                  <p className="text-sm text-subtext">Key habits derived from recent activity history.</p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <UserCheck size={18} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Normal login hours</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{baseline?.average_login_hour != null ? `${baseline.average_login_hour.toFixed(1)}h` : '—'}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Average daily activities</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{baseline?.average_daily_logins != null ? baseline.average_daily_logins.toFixed(1) : '—'}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Preferred device</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{deviceUsage?.primary_device || '—'}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Preferred location</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{resourceAccess?.most_accessed_resource || '—'}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-1 flex flex-col">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text-main">Resource Access</h2>
                  <p className="text-sm text-subtext">Sensitive resource access & frequency.</p>
                </div>
                <div className="rounded-full bg-danger/10 p-2 text-danger">
                  <FileSearch size={18} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Frequently accessed resource</div>
                  <div className="mt-2 text-sm font-medium text-text-main truncate">{resourceAccess?.most_accessed_resource || '—'}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Sensitive resource access</div>
                  <div className={`mt-2 text-sm font-semibold ${sensitiveResourceAccess ? 'text-warning' : 'text-success'}`}>
                    {sensitiveResourceAccess ? 'Sensitive access activity detected' : 'No anomalies detected'}
                  </div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Access trend</div>
                  <div className="mt-4 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accessChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {accessChartData.map((entry, index) => (
                            <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ROW 2: Login Pattern Analysis (left) & Summary Panel (right) */}
        <div className="xl:col-span-2 flex flex-col">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text-main">Login Pattern Analysis</h2>
                  <p className="text-sm text-subtext">Review frequency, time-of-day behavior, and anomalies.</p>
                </div>
                <div className="rounded-full bg-accent/10 p-2 text-accent">
                  <Clock3 size={18} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Login frequency</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{baseline?.average_daily_logins != null ? baseline.average_daily_logins.toFixed(1) : '—'}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Peak hour</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{loginPattern?.most_frequent_login_hour != null ? `${loginPattern.most_frequent_login_hour}:00` : '—'}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Unusual logins</div>
                  <div className={`mt-2 text-sm font-semibold ${unusualLogin ? 'text-warning' : 'text-success'}`}>
                    {unusualLogin ? 'Weekend/off-hours login observed' : 'None detected'}
                  </div>
                </div>
              </div>

              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loginChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {loginChartData.map((entry, index) => (
                        <Cell key={`${entry.name}-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-1 flex flex-col">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text-main">Summary Panel</h2>
                  <p className="text-sm text-subtext">Behavioral risk and high-signal summaries.</p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ShieldAlert size={18} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Behavioral Risk Score</div>
                  <div className="mt-2 text-3xl font-semibold text-text-main">{computedRiskScore}/100</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Behavior Status</div>
                  <div className={`mt-2 text-sm font-semibold ${computedRiskScore >= 80 ? 'text-danger' : computedRiskScore >= 55 ? 'text-warning' : 'text-success'}`}>{riskStatus}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">AI Summary</div>
                  <div className="mt-2 text-sm text-subtext leading-relaxed">
                    {profile?.profile_score != null ? 'Behavioral profile generated successfully with trend-based risk insights.' : 'AI summary will appear once a behavior profile is generated for this employee.'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ROW 3: Work Pattern Analysis (left) & Device Usage (right) */}
        <div className="xl:col-span-3 grid gap-6 md:grid-cols-2">
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text-main">Work Pattern Analysis</h2>
                  <p className="text-sm text-subtext">Working hour consistency and activity cadence.</p>
                </div>
                <div className="rounded-full bg-success/10 p-2 text-success">
                  <Activity size={18} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Working hours</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{workPattern?.average_working_hours_per_day != null ? `${workPattern.average_working_hours_per_day.toFixed(1)}h` : '—'}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Weekend activity</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{loginPattern?.weekend_login_count ?? '—'}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Overtime behavior</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{workPattern?.average_active_sessions != null ? `${workPattern.average_active_sessions.toFixed(1)} active sessions` : '—'}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-text-main">Device Usage</h2>
                  <p className="text-sm text-subtext">Frequent devices and device onboarding anomalies.</p>
                </div>
                <div className="rounded-full bg-warning/10 p-2 text-warning">
                  <Laptop2 size={18} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Frequently used devices</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{deviceUsage?.primary_device || '—'}</div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">New device detection</div>
                  <div className={`mt-2 text-sm font-semibold ${newDeviceDetected ? 'text-warning' : 'text-success'}`}>
                    {newDeviceDetected ? 'External or unfamiliar device activity observed' : 'No new device anomaly detected'}
                  </div>
                </div>
                <div className="rounded-[14px] bg-slate-50 p-4">
                  <div className="text-sm font-semibold text-subtext">Trusted device usage</div>
                  <div className="mt-2 text-xl font-semibold text-text-main">{deviceUsage?.trusted_device_percentage != null ? `${deviceUsage.trusted_device_percentage.toFixed(1)}%` : '—'}</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Behavior;
