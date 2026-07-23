import React from 'react';
import { AlertCircle } from 'lucide-react';

const ThreatTable = ({ alerts = [] }) => {
  const defaultAlerts = [
    { id: 1, employee_name: 'Sarah Jenkins', risk_level: 'Critical', risk_score: 94, anomaly_detected: true, last_analyzed: '2026-01-01T10:40:00Z' },
    { id: 2, employee_name: 'Marcus Chen', risk_level: 'High', risk_score: 88, anomaly_detected: true, last_analyzed: '2026-01-01T09:15:00Z' },
    { id: 3, employee_name: 'Emily Watson', risk_level: 'Medium', risk_score: 76, anomaly_detected: false, last_analyzed: '2026-01-01T08:50:00Z' },
    { id: 4, employee_name: 'James Miller', risk_level: 'Low', risk_score: 62, anomaly_detected: false, last_analyzed: '2026-01-01T08:05:00Z' },
  ];

  const tableAlerts = alerts.length ? alerts : defaultAlerts;

  const getBadgeClasses = (level) => {
    if (level === 'Critical') return 'bg-danger/10 text-danger border border-danger/20';
    if (level === 'High') return 'bg-warning/10 text-warning border border-warning/20';
    if (level === 'Medium') return 'bg-primary/10 text-primary border border-primary/20';
    return 'bg-success/10 text-success border border-success/20';
  };

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
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Risk</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Score</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Anomaly</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Last Analyzed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {tableAlerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-text-main">{alert.employee_name}</td>
                <td className="py-4 px-6 text-sm">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClasses(alert.risk_level)}`}>
                    {alert.risk_level}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-text-main">{alert.risk_score}</td>
                <td className="py-4 px-6 text-sm text-text-main">{alert.anomaly_detected ? 'Yes' : 'No'}</td>
                <td className="py-4 px-6 text-sm text-subtext">{alert.last_analyzed ? new Date(alert.last_analyzed).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ThreatTable;
