import React from 'react';
import { ShieldCheck, Users, AlertTriangle, Activity, FileText, Search } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import ThreatTable from '../../components/dashboard/ThreatTable';
import RiskTable from '../../components/dashboard/RiskTable';
import Timeline from '../../components/dashboard/Timeline';
import PredictionCard from '../../components/dashboard/PredictionCard';
import ComplianceCard from '../../components/dashboard/ComplianceCard';

const lineData = [
  { name: 'Mon', score: 25 },
  { name: 'Tue', score: 32 },
  { name: 'Wed', score: 28 },
  { name: 'Thu', score: 45 },
  { name: 'Fri', score: 68 },
  { name: 'Sat', score: 55 },
  { name: 'Sun', score: 82 },
];

const pieData = [
  { name: 'Low', value: 850, color: '#10B981' },
  { name: 'Medium', value: 320, color: '#2563EB' },
  { name: 'High', value: 65, color: '#F59E0B' },
  { name: 'Critical', value: 13, color: '#EF4444' },
];

const Dashboard = () => {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-main">Security Operations Center</h1>
          <p className="text-sm text-subtext mt-1">Monitor employee behavior and insider threats in real time.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-border-color text-text-main px-4 py-2 rounded-[10px] text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <FileText size={16} /> Report
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-[10px] text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm">
            <Search size={16} /> Investigate
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Overall Security Score" 
          value="92%" 
          subtitle="Protected" 
          icon={<ShieldCheck size={24} />} 
          trendIcon={<div className="w-2 h-2 rounded-full bg-success"></div>}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <StatCard 
          title="High Risk Employees" 
          value="18" 
          subtitle="+3 since yesterday" 
          icon={<Users size={24} />} 
          trendIcon={<AlertTriangle size={14} className="text-danger" />}
          colorClass="text-danger"
          bgClass="bg-danger/10"
        />
        <StatCard 
          title="Threat Alerts Today" 
          value="12" 
          subtitle="Requires attention" 
          icon={<AlertTriangle size={24} />} 
          trendIcon={<div className="w-2 h-2 rounded-full bg-warning"></div>}
          colorClass="text-warning"
          bgClass="bg-warning/10"
        />
        <StatCard 
          title="Active Monitoring" 
          value="1,248" 
          subtitle="Nodes connected" 
          icon={<Activity size={24} />} 
          trendIcon={<div className="w-2 h-2 rounded-full bg-accent"></div>}
          colorClass="text-accent"
          bgClass="bg-accent/10"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Behavior Risk Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                itemStyle={{ color: '#0F172A', fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="score" stroke="#0F766E" strokeWidth={3} dot={{ r: 4, fill: '#0F766E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                itemStyle={{ fontWeight: 600 }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle" 
                wrapperStyle={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3: Threat Table */}
      <ThreatTable />

      {/* Row 4: Risk Table */}
      <RiskTable />

      {/* Row 5, 6, 7: Mixed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Timeline />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <PredictionCard />
          <ComplianceCard />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;