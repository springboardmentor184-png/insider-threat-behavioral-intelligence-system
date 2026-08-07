import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">⚙️ System & Platform Administration</h1>
            <p className="text-gray-400 text-sm">System monitoring, API status, role control & platform analytics</p>
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

        {/* Monitoring Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-2">
            <span className="text-xs text-gray-400 font-semibold">FastAPI Engine</span>
            <p className="text-xl font-bold text-green-400">🟢 Online (127.0.0.1:8000)</p>
            <p className="text-xs text-gray-400">Response time: 14ms</p>
          </div>

          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-2">
            <span className="text-xs text-gray-400 font-semibold">SQL Relational DB</span>
            <p className="text-xl font-bold text-blue-400">🟢 SQLite / MySQL Active</p>
            <p className="text-xs text-gray-400">Database connected cleanly</p>
          </div>

          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-2">
            <span className="text-xs text-gray-400 font-semibold">Activity Telemetry Collection</span>
            <p className="text-xl font-bold text-purple-400">🟢 Ingesting Activity Streams</p>
            <p className="text-xs text-gray-400">160 telemetry documents active</p>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
          <h3 className="text-lg font-bold border-b border-gray-700 pb-2">System Controls & Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Risk Weight: Behavioral Anomalies</label>
              <input type="number" defaultValue={35} className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Risk Weight: Privilege Misuse</label>
              <input type="number" defaultValue={25} className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Risk Weight: Data Access Violations</label>
              <input type="number" defaultValue={20} className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Risk Weight: Access Pattern Deviations</label>
              <input type="number" defaultValue={10} className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;