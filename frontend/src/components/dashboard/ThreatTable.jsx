import React from 'react';
import { AlertCircle } from 'lucide-react';

const ThreatTable = () => {
  const alerts = [
    { id: 1, emp: 'Sarah Jenkins', dept: 'Finance', risk: 'Critical', status: 'Investigating', time: '10 mins ago', color: 'bg-danger/10 text-danger border-danger/20' },
    { id: 2, emp: 'Marcus Chen', dept: 'Engineering', risk: 'High', status: 'Open', time: '45 mins ago', color: 'bg-warning/10 text-warning border-warning/20' },
    { id: 3, emp: 'Emily Watson', dept: 'HR', risk: 'Medium', status: 'Reviewed', time: '2 hours ago', color: 'bg-primary/10 text-primary border-primary/20' },
    { id: 4, emp: 'James Miller', dept: 'Sales', risk: 'Low', status: 'Closed', time: '5 hours ago', color: 'bg-success/10 text-success border-success/20' }
  ];

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-border-color overflow-hidden">
      <div className="p-6 border-b border-border-color flex items-center justify-between">
        <h3 className="font-heading font-semibold text-text-main flex items-center gap-2">
          <AlertCircle size={18} className="text-danger" />
          Recent Threat Alerts
        </h3>
        <button className="text-sm text-primary font-medium hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-border-color">
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Employee</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Department</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Risk Level</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Status</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-text-main">{alert.emp}</td>
                <td className="py-4 px-6 text-sm text-subtext">{alert.dept}</td>
                <td className="py-4 px-6 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${alert.color}`}>
                    {alert.risk}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-text-main">{alert.status}</td>
                <td className="py-4 px-6 text-sm text-subtext">{alert.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThreatTable;