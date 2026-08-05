import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Activity, FileText, Search, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import ThreatTable from '../../components/dashboard/ThreatTable';
import RiskTable from '../../components/dashboard/RiskTable';
import Timeline from '../../components/dashboard/Timeline';
import PredictionCard from '../../components/dashboard/PredictionCard';
import ComplianceCard from '../../components/dashboard/ComplianceCard';
import Loader from '../../components/common/Loader';
import {
  getDashboardOverview,
  getRiskSummary,
  getActivitySummary,
  getTopRiskEmployees,
  getRecentAlerts,
  getDashboardCharts,
  getRiskTrend,
  getRecentActivities,
} from '../../services/dashboardService';

const chartColors = {
  Low: '#10B981',
  Medium: '#2563EB',
  High: '#F59E0B',
  Critical: '#EF4444',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [riskSummary, setRiskSummary] = useState(null);
  const [activitySummary, setActivitySummary] = useState(null);
  const [topRiskEmployees, setTopRiskEmployees] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [charts, setCharts] = useState(null);
  const [riskTrend, setRiskTrend] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [overviewData, summaryData, activityData, topRiskData, alertsData, chartsData, trendData, recentActivityData] = await Promise.all([
          getDashboardOverview(),
          getRiskSummary(),
          getActivitySummary(),
          getTopRiskEmployees(),
          getRecentAlerts(),
          getDashboardCharts(),
          getRiskTrend(),
          getRecentActivities(),
        ]);

        setOverview(overviewData);
        setRiskSummary(summaryData);
        setActivitySummary(activityData);
        setTopRiskEmployees(topRiskData);
        setRecentAlerts(alertsData);
        setCharts(chartsData);
        setRiskTrend(trendData);
        setRecentActivities(recentActivityData);
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const topRiskEntries = useMemo(
    () => topRiskEmployees.map((item) => ({
      employee_id: item.employee_id,
      full_name: item.full_name,
      risk_score: item.risk_score,
      risk_level: item.risk_level,
    })),
    [topRiskEmployees]
  );

  const timelineEvents = useMemo(() => {
    if (!recentActivities?.length) return [];

    return recentActivities.slice(0, 5).map((activity) => {
      const activityTime = new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const title = activity.activity_type?.replace(/_/g, ' ') || 'Activity';
      const description = activity.description || activity.resource_name || 'Activity recorded';
      const typeKey = activity.activity_type?.toLowerCase() || '';
      const isLogin = typeKey.includes('login');
      const isDownload = typeKey.includes('download');
      const isUsb = typeKey.includes('usb');
      const icon = isLogin ? <Activity size={14} /> : <FileText size={14} />;
      const color = isLogin ? 'bg-success' : isDownload ? 'bg-warning' : isUsb ? 'bg-warning' : 'bg-primary';
      const text = isLogin ? 'text-success' : isDownload ? 'text-warning' : isUsb ? 'text-warning' : 'text-primary';

      return {
        id: activity.id,
        time: activityTime,
        title,
        desc: description,
        icon,
        color,
        text,
      };
    });
  }, [recentActivities]);

  const formattedRiskTrend = useMemo(() => {
    if (riskTrend && riskTrend.length > 0) {
      return riskTrend.map((item) => ({
        ...item,
        date: item.date ? new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Day',
      }));
    }

    const previewData = [];
    const today = new Date();
    for (let index = 6; index >= 0; index -= 1) {
      const valueDate = new Date(today);
      valueDate.setDate(today.getDate() - index);
      previewData.push({
        date: valueDate.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        average_risk_score: 34 + (index % 3) * 8,
      });
    }
    return previewData;
  }, [riskTrend]);

  const formattedRiskDistribution = useMemo(() => {
    const rawDistribution = charts?.risk_distribution;
    if (rawDistribution && rawDistribution.length > 0) {
      const normalized = ['Low', 'Medium', 'High', 'Critical'].map((name) => {
        const match = rawDistribution.find((item) => item.name === name);
        return { name, value: match?.value || 0 };
      });
      return normalized;
    }

    return [
      { name: 'Low', value: 0 },
      { name: 'Medium', value: 0 },
      { name: 'High', value: 0 },
      { name: 'Critical', value: 0 },
    ];
  }, [charts]);

  const highestRiskEmployee = useMemo(() => {
    if (topRiskEmployees?.length) {
      return topRiskEmployees[0];
    }
    return null;
  }, [topRiskEmployees]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-[16px] border border-danger/20 bg-danger/10 p-6 text-danger">
          <h2 className="font-semibold text-lg mb-2">Dashboard Load Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center gap-3">
        <button
          onClick={() => navigate('/reports', { state: { fromDashboard: true } })}
          className="flex items-center gap-2 bg-white border border-border-color text-text-main px-4 py-2 rounded-[10px] text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          <FileText size={16} /> Report
        </button>
        <button
          onClick={() => {
            if (highestRiskEmployee?.employee_id) {
              navigate('/threats', { state: { highlightedEmployeeId: highestRiskEmployee.employee_id } });
            } else {
              navigate('/threats', { state: { noThreatsMessage: 'No threats are currently available to investigate.' } });
            }
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-[10px] text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm"
        >
          <Search size={16} /> Investigate
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Employees"
          value={overview?.employees ?? '—'}
          subtitle="Current users"
          icon={<Users size={24} />}
          trendIcon={<div className="w-2 h-2 rounded-full bg-success"></div>}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <StatCard
          title="Total Activities"
          value={overview?.activities ?? '—'}
          subtitle="Across platform"
          icon={<Activity size={24} />}
          trendIcon={<div className="w-2 h-2 rounded-full bg-accent"></div>}
          colorClass="text-accent"
          bgClass="bg-accent/10"
        />
        <StatCard
          title="Avg. Risk Score"
          value={overview?.risk != null ? `${overview.risk}%` : '—'}
          subtitle="Aggregate risk"
          icon={<TrendingUp size={24} />}
          trendIcon={<div className="w-2 h-2 rounded-full bg-warning"></div>}
          colorClass="text-warning"
          bgClass="bg-warning/10"
        />
        <StatCard
          title="Departments"
          value={overview?.departments ?? '—'}
          subtitle="Active groups"
          icon={<ShieldCheck size={24} />}
          trendIcon={<div className="w-2 h-2 rounded-full bg-primary"></div>}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 min-w-0">
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          <div className="min-w-0">
            <ChartCard title="Behavior Risk Trend" className="min-h-[360px]">
              {formattedRiskTrend.length >= 1 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedRiskTrend} margin={{ top: 6, right: 8, left: -12, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={6} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                      />
                      <Line type="monotone" dataKey="average_risk_score" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, fill: '#0F766E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center rounded-[12px] border border-dashed border-border-color bg-slate-50 p-6 text-center text-sm text-subtext">
                  Insufficient historical data to display trend.
                </div>
              )}
            </ChartCard>

          </div>

          <div className="min-w-0">
            <ChartCard title="Risk Distribution" className="min-h-[360px]">
              {formattedRiskDistribution.some((item) => item.value > 0) ? (
                <div className="flex h-[300px] w-full flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formattedRiskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={78}
                        outerRadius={112}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {formattedRiskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[entry.name] || '#64748B'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} itemStyle={{ fontWeight: 600 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 w-full">
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }} />
                  </div>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center rounded-[12px] border border-dashed border-border-color bg-slate-50 p-6 text-center text-sm text-subtext">
                  No risk distribution data is available yet.
                </div>
              )}
            </ChartCard>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ChartCard title="Activity Summary">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[16px] bg-slate-50 p-4">
                <div className="text-sm font-semibold text-subtext">Today</div>
                <div className="text-3xl font-bold text-text-main">{activitySummary?.today_activity ?? '—'}</div>
              </div>
              <div className="rounded-[16px] bg-slate-50 p-4">
                <div className="text-sm font-semibold text-subtext">Last 7 Days</div>
                <div className="text-3xl font-bold text-text-main">{activitySummary?.last_7_days ?? '—'}</div>
              </div>
              <div className="rounded-[16px] bg-slate-50 p-4">
                <div className="text-sm font-semibold text-subtext">Last 30 Days</div>
                <div className="text-3xl font-bold text-text-main">{activitySummary?.last_30_days ?? '—'}</div>
              </div>
              <div className="rounded-[16px] bg-slate-50 p-4">
                <div className="text-sm font-semibold text-subtext">Peak Login</div>
                <div className="text-3xl font-bold text-text-main">{activitySummary?.peak_login_hour || 'N/A'}</div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Risk Summary">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-subtext">Low</span>
                <span className="font-semibold text-text-main">{riskSummary?.low ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-subtext">Medium</span>
                <span className="font-semibold text-text-main">{riskSummary?.medium ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-subtext">High</span>
                <span className="font-semibold text-text-main">{riskSummary?.high ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-subtext">Critical</span>
                <span className="font-semibold text-text-main">{riskSummary?.critical ?? '—'}</span>
              </div>
              <div className="border-t border-border-color pt-4">
                <div className="text-sm text-subtext">Highest Risk</div>
                <div className="text-sm font-medium text-text-main">{riskSummary?.highest_risk_employee?.name || 'No data'}</div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ThreatTable alerts={recentAlerts} />
        <RiskTable entries={topRiskEntries} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <Timeline events={timelineEvents} />
        </div>
        <div className="xl:col-span-2 flex flex-col gap-6">
          <PredictionCard />
          <ComplianceCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
