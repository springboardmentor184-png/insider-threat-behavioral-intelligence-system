import React from 'react';
import { Users } from 'lucide-react';

const RiskTable = ({ entries = [] }) => {
  const defaultEntries = [
    { id: 1, full_name: 'David Thompson', risk_score: 94, risk_level: 'Critical' },
    { id: 2, full_name: 'Sarah Jenkins', risk_score: 88, risk_level: 'High' },
    { id: 3, full_name: 'Robert Lee', risk_score: 76, risk_level: 'High' },
    { id: 4, full_name: 'Amanda Clarke', risk_score: 72, risk_level: 'Medium' },
    { id: 5, full_name: 'Marcus Chen', risk_score: 68, risk_level: 'Medium' },
  ];

  const tableEntries = entries.length ? entries : defaultEntries;

  const getBarColor = (score) => {
    if (score > 80) return 'bg-danger';
    if (score > 60) return 'bg-warning';
    return 'bg-success';
  };

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
              <th className="py-3 px-6 text-xs font-semibold text-subtext uppercase tracking-wider">Risk Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {tableEntries.map((emp, index) => (
              <tr key={emp.employee_id || emp.id || index} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-medium text-text-main">{emp.full_name}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[80px]">
                      <div
                        className={`h-1.5 rounded-full ${getBarColor(emp.risk_score)}`}
                        style={{ width: `${emp.risk_score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-text-main">{emp.risk_score}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-subtext">{emp.risk_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskTable;
