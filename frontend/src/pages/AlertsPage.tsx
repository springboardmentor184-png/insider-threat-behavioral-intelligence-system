import React, { useState } from 'react';

interface AlertItem {
  id: string;
  title: string;
  severity: 'Informational' | 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string;
  status: 'Open' | 'Investigating' | 'Escalated' | 'Resolved';
  timestamp: string;
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: 'ALT-1001', title: 'Off-Hours VPN Access Spike', severity: 'Critical', assignedTo: 'Alice Smith', status: 'Investigating', timestamp: '10 mins ago' },
    { id: 'ALT-1002', title: 'Unauthorized USB Device Mounted', severity: 'High', assignedTo: 'Bob Johnson', status: 'Open', timestamp: '45 mins ago' },
    { id: 'ALT-1003', title: 'Excessive Sharepoint PDF Download', severity: 'Medium', assignedTo: 'Carol Williams', status: 'Escalated', timestamp: '2 hours ago' },
    { id: 'ALT-1004', title: 'Active Directory Privilege Change', severity: 'Critical', assignedTo: 'Unassigned', status: 'Open', timestamp: '3 hours ago' },
    { id: 'ALT-1005', title: 'Repeated Failed Login Attempts', severity: 'Low', assignedTo: 'Alice Smith', status: 'Resolved', timestamp: 'Yesterday' }
  ]);

  const handleStatusChange = (id: string, newStatus: any) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const getSeverityBadge = (sev: string) => {
    if (sev === 'Critical') return <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-950 text-red-400 border border-red-800">Critical</span>;
    if (sev === 'High') return <span className="px-2 py-0.5 text-xs font-bold rounded bg-orange-950 text-orange-400 border border-orange-800">High</span>;
    if (sev === 'Medium') return <span className="px-2 py-0.5 text-xs font-bold rounded bg-yellow-950 text-yellow-400 border border-yellow-800">Medium</span>;
    return <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-950 text-blue-400 border border-blue-800">{sev}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">⚡ Alert & Incident Management System</h1>
            <p className="text-gray-400 text-sm">Real-time security alerts, analyst assignments & escalation workflows</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900 text-gray-400 border-b border-gray-700">
              <tr>
                <th className="p-3">Alert ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Assigned Analyst</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {alerts.map((alt) => (
                <tr key={alt.id} className="hover:bg-gray-750 transition">
                  <td className="p-3 font-mono text-xs text-blue-400 font-bold">{alt.id}</td>
                  <td className="p-3 font-semibold text-white">{alt.title}</td>
                  <td className="p-3">{getSeverityBadge(alt.severity)}</td>
                  <td className="p-3 text-xs text-gray-300">👤 {alt.assignedTo}</td>
                  <td className="p-3">
                    <select
                      value={alt.status}
                      onChange={(e) => handleStatusChange(alt.id, e.target.value)}
                      className="bg-gray-900 text-xs text-white border border-gray-700 rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="Investigating">Investigating</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => window.location.href = '/investigations'}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;