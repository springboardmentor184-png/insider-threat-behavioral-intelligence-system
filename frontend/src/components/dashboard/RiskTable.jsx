import React from 'react';
import { Users } from 'lucide-react';

const RiskTable = () => {
  const employees = [
    { id: 1, name: 'David Thompson', score: 94, dept: 'Finance', activity: 'Mass File Download', status: 'Monitored' },
    { id: 2, name: 'Sarah Jenkins', score: 88, dept: 'Finance', activity: 'Off-hours Login', status: 'Investigating' },
    { id: 3, name: 'Robert Lee', score: 76, dept: 'IT Admin', activity: 'Privilege Escalation', status: 'Monitored' },
    { id: 4, name: 'Amanda Clarke', score: 72, dept: 'Engineering', activity: 'USB Device Connected', status: 'Normal' },
    { id: 5, name: 'Marcus Chen', score: 68, dept: 'Engineering', activity: 'Multiple Failed Logins', status: 'Normal' },
  ];

  return (
    <div className="bg-white rounded-[16px] shadow-sm border border-border-color overflow-hidden">
      <div className="p-6 border-b border-border-color flex items-center justify-between">
        <h3 className="font-heading font-semibold text-text-main flex items-center gap-2">
          <Users size={18} className="text-warning" />
          Employee Risk Ranking
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-border-color">
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Employee</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Risk Score</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Department</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Last Activity</th>
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-text-main">{emp.name}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[60px]">
                      <div 
                        className={`h-1.5 rounded-full ${emp.score > 80 ? 'bg-danger' : emp.score > 60 ? 'bg-warning' : 'bg-success'}`} 
                        style={{ width: `${emp.score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-text-main">{emp.score}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-subtext">{emp.dept}</td>
                <td className="py-4 px-6 text-sm text-text-main">{emp.activity}</td>
                <td className="py-4 px-6 text-sm text-subtext">{emp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskTable;