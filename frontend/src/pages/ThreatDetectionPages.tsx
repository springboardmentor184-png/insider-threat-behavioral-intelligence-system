import React, { useState } from 'react';

const ThreatDetectionPages: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const anomalyCategories = [
    { title: 'Unusual Login Time', count: 3, severity: 'CRITICAL', desc: 'Remote login sessions initiated outside 09:00 - 18:00 shift hours' },
    { title: 'Abnormal Data Download', count: 5, severity: 'HIGH', desc: 'Large volume PDF and ZIP archive downloads exceeding baseline limits' },
    { title: 'Unauthorized Access Attempts', count: 2, severity: 'CRITICAL', desc: 'Repeated 403 Forbidden responses on restricted admin endpoints' },
    { title: 'Excessive File Transfers', count: 4, severity: 'MEDIUM', desc: 'Multiple file upload events targeted to cloud storage mirrors' },
    { title: 'Suspicious Device Usage', count: 1, severity: 'HIGH', desc: 'Removable USB mass storage device attached to corporate endpoint' }
  ];

  const filtered = selectedCategory === 'ALL'
    ? anomalyCategories
    : anomalyCategories.filter(c => c.severity === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">🛡️ Anomaly Detection Engine</h1>
            <p className="text-gray-400 text-sm">Behavioral anomaly detection, data exfiltration & privilege abuse rules</p>
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

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-2">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
            <button
              key={sev}
              onClick={() => setSelectedCategory(sev)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                selectedCategory === sev ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <div key={idx} className="bg-gray-800 p-5 rounded-lg border border-gray-700 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-base text-white">{item.title}</h3>
                <span className={`px-2 py-0.5 text-xs rounded font-bold ${
                  item.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                  item.severity === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                  'bg-yellow-950 text-yellow-400 border border-yellow-800'
                }`}>
                  {item.severity}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              <div className="border-t border-gray-700 pt-3 flex justify-between items-center text-xs">
                <span className="text-gray-400">Detections: <strong className="text-white">{item.count}</strong></span>
                <button
                  onClick={() => window.location.href = '/investigations'}
                  className="text-blue-400 hover:underline font-semibold"
                >
                  Investigate Threat →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreatDetectionPages;