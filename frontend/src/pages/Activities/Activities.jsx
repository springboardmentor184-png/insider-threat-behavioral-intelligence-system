import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, RefreshCcw, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { getActivities } from '../../services/activityService';

const PAGE_SIZE = 10;

const Activities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activityType, setActivityType] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const loadActivities = React.useCallback(async (nextPage = page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getActivities({
        page: nextPage,
        limit: PAGE_SIZE,
        search,
        activityType,
        severity,
        status,
        department,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });
      setActivities(response?.items || []);
      setTotal(response?.total || 0);
      setTotalPages(response?.total_pages || 1);
      setPage(nextPage);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Unable to load activities.');
    } finally {
      setLoading(false);
    }
  }, [page, search, activityType, severity, status, department, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    loadActivities(1);
  }, [loadActivities]);

  const sortedActivities = useMemo(() => activities, [activities]);

  const applyFilters = () => loadActivities(1);

  const resetFilters = () => {
    setSearch('');
    setActivityType('');
    setSeverity('');
    setStatus('');
    setDepartment('');
    setStartDate('');
    setEndDate('');
    setSortBy('timestamp');
    setSortOrder('desc');
    setTimeout(() => loadActivities(1), 0);
  };

  const getSeverityBadge = (severityValue) => {
    if (severityValue === 'CRITICAL') return 'bg-danger/10 text-danger border-danger/20';
    if (severityValue === 'HIGH') return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-primary/10 text-primary border-primary/20';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
        <Card className="p-6">
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-4 space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded bg-slate-50" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[16px] border border-border-color bg-white p-8 text-center">
        <h2 className="mt-4 text-xl font-semibold text-text-main">Unable to load activities</h2>
        <p className="mt-2 text-sm text-subtext">{error}</p>
        <Button className="mt-6" onClick={() => loadActivities(1)}>
          <span className="flex items-center gap-2">
            <RefreshCcw size={16} /> Retry
          </span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-main">Activities</h1>
          <p className="text-sm text-subtext mt-1">Review employee activity logs and spot suspicious behavior early.</p>
        </div>
        <div className="text-sm text-subtext">Showing {sortedActivities.length} of {total} activities</div>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-text-main">Search</label>
            <div className="flex items-center rounded-[12px] border border-border-color bg-slate-50 px-3 py-2">
              <Search size={16} className="text-subtext" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Employee name, activity type, or activity ID"
                className="ml-2 w-full border-none bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">Type</label>
              <select value={activityType} onChange={(event) => setActivityType(event.target.value)} className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none">
                <option value="">All</option>
                <option value="LOGIN">LOGIN</option>
                <option value="FAILED_LOGIN">FAILED LOGIN</option>
                <option value="USB_CONNECTED">USB CONNECTED</option>
                <option value="FILE_DOWNLOAD">FILE DOWNLOAD</option>
                <option value="POLICY_VIOLATION">POLICY VIOLATION</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">Severity</label>
              <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none">
                <option value="">All</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none">
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text-main">Department</label>
              <select value={department} onChange={(event) => setDepartment(event.target.value)} className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none">
                <option value="">All</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">From</label>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-text-main">To</label>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-full rounded-[12px] border border-border-color bg-white px-3 py-2 text-sm outline-none" />
          </div>
          <div className="flex items-end">
            <Button onClick={applyFilters}>
              <span className="flex items-center gap-2">
                <Filter size={16} /> Apply
              </span>
            </Button>
          </div>
          <div className="flex items-end">
            <button onClick={resetFilters} className="rounded-[12px] border border-border-color bg-white px-4 py-2 text-sm font-medium text-text-main hover:bg-slate-50">
              Reset
            </button>
          </div>
        </div>
      </Card>

      {!sortedActivities.length ? (
        <EmptyState />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Activity ID', 'Employee Name', 'Activity Type', 'Timestamp', 'Severity', 'Status', 'Device', 'Location', 'Actions'].map((column) => (
                    <th key={column} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-subtext">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color bg-white">
                {sortedActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-medium text-text-main">{activity.id}</td>
                    <td className="px-4 py-4 text-sm font-medium text-text-main">{activity.employee?.first_name && activity.employee?.last_name ? `${activity.employee.first_name} ${activity.employee.last_name}` : '—'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{activity.activity_type || '—'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '—'}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getSeverityBadge(activity.severity)}`}>
                        {activity.severity || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-subtext">{activity.status || 'Pending'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{activity.device_name || '—'}</td>
                    <td className="px-4 py-4 text-sm text-subtext">{activity.location || '—'}</td>
                    <td className="px-4 py-4">
                      <button onClick={() => navigate(`/activities/${activity.id}`)} className="inline-flex items-center gap-2 rounded-[10px] border border-border-color bg-white px-3 py-2 text-sm font-medium text-text-main hover:bg-slate-50">
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border-color bg-slate-50 px-4 py-3">
            <div className="text-sm text-subtext">Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => loadActivities(page - 1)} disabled={page === 1} className="rounded-[10px] border border-border-color bg-white px-3 py-2 text-sm font-medium text-text-main disabled:cursor-not-allowed disabled:opacity-50">
                Previous
              </button>
              <button onClick={() => loadActivities(page + 1)} disabled={page >= totalPages} className="rounded-[10px] border border-border-color bg-white px-3 py-2 text-sm font-medium text-text-main disabled:cursor-not-allowed disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Activities;
