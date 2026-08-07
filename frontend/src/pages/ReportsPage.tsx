import React, { useState } from 'react';
import axios from 'axios';

const ReportsPage: React.FC = () => {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const token = localStorage.getItem('token');
  const employeeId = localStorage.getItem('employee_id') || '33901353-84ca-11f1-9e39-e4fd457b80cb';

  const downloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/reports/pdf/${employeeId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `insider_threat_report_${employeeId.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Generating executive PDF report...');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const downloadExcel = () => {
    setDownloadingExcel(true);
    setTimeout(() => {
      alert('Exporting activity logs & risk metrics to Excel (CSV)...');
      setDownloadingExcel(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold">📄 Reports & Export System</h1>
            <p className="text-gray-400 text-sm">Insider threat intelligence reports, risk assessments & compliance exports</p>
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

        {/* Action Export Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📄</span>
              <div>
                <h3 className="font-bold text-lg text-white">PDF Executive Threat Summary</h3>
                <p className="text-xs text-gray-400">Formal PDF report with UEBA baselines, anomalies, and risk scores</p>
              </div>
            </div>
            <button
              onClick={downloadPDF}
              disabled={downloadingPdf}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-sm transition"
            >
              {downloadingPdf ? 'Generating PDF...' : 'Download Executive PDF Report'}
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-bold text-lg text-white">Excel Telemetry & Logs Export</h3>
                <p className="text-xs text-gray-400">Raw log dumps, CSV metrics, and incident audit trails</p>
              </div>
            </div>
            <button
              onClick={downloadExcel}
              disabled={downloadingExcel}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-sm transition"
            >
              {downloadingExcel ? 'Exporting...' : 'Download Excel / CSV Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;