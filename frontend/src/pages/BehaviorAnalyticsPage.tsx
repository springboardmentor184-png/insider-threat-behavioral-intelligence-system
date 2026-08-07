import React, { useState } from 'react';

const BehaviorAnalyticsPage: React.FC = () => {
  const [selectedBaseline, setSelectedBaseline] = useState('John Doe (CISO)');

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">📈 Behavioral Profiling Engine</h1>
            <p className="text-gray-400 text-sm">User baseline generation, work patterns & productivity drift monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedBaseline}
              onChange={(e) => setSelectedBaseline(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="John Doe (CISO)">John Doe (CISO)</option>
              <option value="Alice Smith (Senior Analyst)">Alice Smith (Senior Analyst)</option>
              <option value="Bob Johnson (Lead SOC)">Bob Johnson (Lead SOC)</option>
              <option value="Carol Williams (Security Manager)">Carol Williams (Security Manager)</option>
            </select>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Profiling Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-2">
            <span className="text-xs text-gray-400 font-semibold">Standard Shift Hours</span>
            <p className="text-xl font-bold text-blue-400">09:00 AM – 06:00 PM</p>
            <p className="text-xs text-green-400">92% adherence over 30-day baseline</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-2">
            <span className="text-xs text-gray-400 font-semibold">Avg Daily Data Download</span>
            <p className="text-xl font-bold text-yellow-400">1.45 MB / day</p>
            <p className="text-xs text-yellow-400">⚠️ Spiked to 4.8 MB on Wed</p>
          </div>
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-2">
            <span className="text-xs text-gray-400 font-semibold">Primary Device IP</span>
            <p className="text-xl font-bold text-purple-400">192.168.1.45</p>
            <p className="text-xs text-purple-400">HQ Office Workstation 04</p>
          </div>
        </div>

        {/* Behavioral Indicators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-4">
            <h3 className="font-bold text-base text-gray-200 border-b border-gray-700 pb-2">⏰ Access Pattern Analysis</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                <div>
                  <p className="font-semibold text-white">Login Time Regularity</p>
                  <p className="text-xs text-gray-400">Usually logs in between 08:45 AM and 09:15 AM</p>
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-950 px-2 py-1 rounded">NORMAL</span>
              </div>
              <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                <div>
                  <p className="font-semibold text-white">Off-Hours VPN Access</p>
                  <p className="text-xs text-gray-400">Detected 02:14 AM remote VPN login</p>
                </div>
                <span className="text-xs font-bold text-red-400 bg-red-950 px-2 py-1 rounded">DEVIATION</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-4">
            <h3 className="font-bold text-base text-gray-200 border-b border-gray-700 pb-2">📂 Application & File Access Baseline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                <div>
                  <p className="font-semibold text-white">SharePoint Document Access</p>
                  <p className="text-xs text-gray-400">Regular access to /Cybersecurity/Policies/</p>
                </div>
                <span className="text-xs font-bold text-green-400 bg-green-950 px-2 py-1 rounded">BASELINE MATCH</span>
              </div>
              <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                <div>
                  <p className="font-semibold text-white">External USB Usage</p>
                  <p className="text-xs text-gray-400">Unregistered USB device mounted on Workstation</p>
                </div>
                <span className="text-xs font-bold text-yellow-400 bg-yellow-950 px-2 py-1 rounded">WARNING</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehaviorAnalyticsPage;