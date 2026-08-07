import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ActivityItem {
  _id?: string;
  employee_id: string;
  event_type: string;
  source_system: string;
  severity: string;
  ip_address?: string;
  metadata?: any;
  timestamp?: string;
}

const ActivitiesPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [logModalOpen, setLogModalOpen] = useState<boolean>(false);
  const [newLog, setNewLog] = useState({
    employee_id: '33901353-84ca-11f1-9e39-e4fd457b80cb',
    event_type: 'FILE_DOWNLOAD',
    source_system: 'SHAREPOINT',
    severity: 'INFO',
    ip_address: '192.168.1.45'
  });

  const token = localStorage.getItem('token');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:8000/activities/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.activities) {
        setActivities(res.data.activities);
      }
    } catch (e) {
      console.log('Using seeded activity telemetry list');
      setActivities([
        { _id: '1', employee_id: '33901353-84ca-11f1-9e39-e4fd457b80cb', event_type: 'UNUSUAL_LOGIN_TIME', source_system: 'VPN_GATEWAY', severity: 'CRITICAL', ip_address: '10.8.0.12', timestamp: new Date().toISOString() },
        { _id: '2', employee_id: '33901353-84ca-11f1-9e39-e4fd457b80cb', event_type: 'USB_INSERTION', source_system: 'ENDPOINT_AGENT', severity: 'WARNING', ip_address: '192.168.1.45', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { _id: '3', employee_id: '44801353-84ca-11f1-9e39-e4fd457b80cc', event_type: 'FILE_DOWNLOAD', source_system: 'SHAREPOINT', severity: 'INFO', ip_address: '192.168.1.88', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { _id: '4', employee_id: '55701353-84ca-11f1-9e39-e4fd457b80cd', event_type: 'PRIVILEGE_CHANGE', source_system: 'ACTIVE_DIRECTORY', severity: 'CRITICAL', ip_address: '192.168.1.99', timestamp: new Date(Date.now() - 10800000).toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/activities/', newLog, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      alert('Activity log ingested successfully!');
      setLogModalOpen(false);
      fetchActivities();
    } catch (e) {
      alert('Log ingested locally.');
      setActivities([newLog, ...activities]);
      setLogModalOpen(false);
    }
  };

  const filtered = activities.filter(act => {
    const matchesType = filterType === 'ALL' || act.event_type.includes(filterType);
    const matchesQuery = !searchQuery || 
      act.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.source_system.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const getSeverityBadge = (sev: string) => {
    if (sev === 'CRITICAL') return <span className="px-2 py-1 text-xs rounded font-bold bg-red-900 text-red-300">CRITICAL</span>;
    if (sev === 'WARNING') return <span className="px-2 py-1 text-xs rounded font-bold bg-yellow-900 text-yellow-300">WARNING</span>;
    return <span className="px-2 py-1 text-xs rounded font-bold bg-blue-900 text-blue-300">INFO</span>;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">📋 Activity Monitoring Engine</h1>
            <p className="text-gray-400 text-sm">Real-time log ingestion, network telemetry & activity tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLogModalOpen(true)}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 font-semibold text-sm transition"
            >
              + Ingest New Event
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by Employee ID, Event, or System..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <div className="flex items-center gap-2 overflow-x-auto col-span-2">
            {['ALL', 'LOGIN', 'FILE', 'USB', 'PRIVILEGE', 'NETWORK'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition ${
                  filterType === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900 text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Source System</th>
                  <th className="p-3">Employee ID</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">Loading activity streams...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">No activity logs found matching filter.</td>
                  </tr>
                ) : (
                  filtered.map((act, idx) => (
                    <tr key={act._id || idx} className="hover:bg-gray-750 transition">
                      <td className="p-3">{getSeverityBadge(act.severity)}</td>
                      <td className="p-3 font-semibold text-blue-400">{act.event_type}</td>
                      <td className="p-3 text-gray-300">{act.source_system}</td>
                      <td className="p-3 font-mono text-xs text-gray-400">{act.employee_id.slice(0, 18)}...</td>
                      <td className="p-3 font-mono text-xs text-gray-300">{act.ip_address || '192.168.1.1'}</td>
                      <td className="p-3 text-xs text-gray-400">{act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Just now'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Log Ingest Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Simulate Log Ingestion</h3>
            <form onSubmit={handleCreateLog} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={newLog.employee_id}
                  onChange={(e) => setNewLog({...newLog, employee_id: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Event Type</label>
                <select
                  value={newLog.event_type}
                  onChange={(e) => setNewLog({...newLog, event_type: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                >
                  <option value="FILE_DOWNLOAD">FILE_DOWNLOAD</option>
                  <option value="UNUSUAL_LOGIN_TIME">UNUSUAL_LOGIN_TIME</option>
                  <option value="USB_INSERTION">USB_INSERTION</option>
                  <option value="PRIVILEGE_CHANGE">PRIVILEGE_CHANGE</option>
                  <option value="FILE_UPLOAD">FILE_UPLOAD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Source System</label>
                <input
                  type="text"
                  value={newLog.source_system}
                  onChange={(e) => setNewLog({...newLog, source_system: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Severity</label>
                <select
                  value={newLog.severity}
                  onChange={(e) => setNewLog({...newLog, severity: e.target.value})}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                >
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm font-semibold"
                >
                  Ingest Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;