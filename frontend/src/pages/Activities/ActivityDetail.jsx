import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, RefreshCcw, Monitor, MapPin, ShieldCheck, Clock3 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { getActivityById } from '../../services/activityService';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActivity = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActivityById(id);
      setActivity(data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Unable to load activity details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const severityBadge = useMemo(() => {
    if (!activity?.severity) return 'bg-slate-100 text-slate-700';
    if (activity.severity === 'CRITICAL') return 'bg-danger/10 text-danger border-danger/20';
    if (activity.severity === 'HIGH') return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-primary/10 text-primary border-primary/20';
  }, [activity]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full border border-border-color bg-white p-2">
            <ArrowLeft size={16} />
          </button>
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        </div>
        <Card className="p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 space-y-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-4 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[16px] border border-border-color bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangle size={20} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-text-main">Unable to load activity</h2>
        <p className="mt-2 text-sm text-subtext">{error}</p>
        <Button className="mt-6" onClick={loadActivity}>
          <span className="flex items-center gap-2">
            <RefreshCcw size={16} /> Retry
          </span>
        </Button>
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full border border-border-color bg-white p-2 shadow-sm">
            <ArrowLeft size={16} className="text-text-main" />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-main">Activity Details</h1>
            <p className="text-sm text-subtext">{activity.activity_type || 'Activity'}</p>
          </div>
        </div>
        <div className={`rounded-full border px-3 py-1 text-sm font-semibold ${severityBadge}`}>
          {activity.severity || 'Unknown'}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck size={18} />
            <h2 className="text-lg font-semibold text-text-main">Activity Details</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ['Activity ID', activity.id],
              ['Employee', activity.employee?.first_name && activity.employee?.last_name ? `${activity.employee.first_name} ${activity.employee.last_name}` : '—'],
              ['Timestamp', activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '—'],
              ['Device', activity.device_name || '—'],
              ['IP Address', activity.ip_address || '—'],
              ['Location', activity.location || '—'],
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
            <h2 className="text-lg font-semibold text-text-main">Risk Impact</h2>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-[12px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-subtext">Threat Analysis</div>
              <div className="mt-1 text-sm font-medium text-text-main">{activity.description || 'No threat analysis provided.'}</div>
            </div>
            <div className="rounded-[12px] bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-subtext">Related Alerts</div>
              <div className="mt-1 text-sm font-medium text-text-main">Review this event alongside recent alerts for escalation context.</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-primary">
            <Monitor size={18} />
            <h2 className="text-lg font-semibold text-text-main">Device & Network</h2>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-[12px] border border-border-color bg-slate-50 p-4 text-sm text-subtext">
              Device: {activity.device_name || 'N/A'}
            </div>
            <div className="rounded-[12px] border border-border-color bg-slate-50 p-4 text-sm text-subtext">
              Browser / OS: {activity.browser || 'N/A'} · {activity.operating_system || 'N/A'}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-accent">
            <MapPin size={18} />
            <h2 className="text-lg font-semibold text-text-main">Location & Context</h2>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-[12px] border border-border-color bg-slate-50 p-4 text-sm text-subtext">
              <div className="flex items-center gap-2">
                <Clock3 size={14} /> {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'N/A'}
              </div>
            </div>
            <div className="rounded-[12px] border border-border-color bg-slate-50 p-4 text-sm text-subtext">
              Location: {activity.location || 'N/A'}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ActivityDetail;
