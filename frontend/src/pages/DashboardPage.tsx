import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Type Definitions for New Risk Engine ---
interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
  reason: string;
}

interface RiskScoreResponse {
  employee_id: string;
  employee_name: string;
  risk_score: number;
  risk_level: string;
  risk_level_icon: string;
  risk_level_color: string;
  raw_weight: number;
  anomaly_count: number;
  total_activities?: number;
  risk_factors: RiskFactor[];
  recommendations: string[];
  last_updated: string;
}

interface Anomaly {
  event_type: string;
  source_system: string;
  ip_address: string;
  reasons: string[];
  metadata?: {
    severity?: string;
  };
  timestamp?: string;
}

interface ReportResponse {
  report?: {
    recent_anomalies?: Anomaly[];
    total_activities?: number;
    total_anomalies?: number;
  };
}

interface TrendData {
  date: string;
  risk_score: number;
  risk_level: string;
  anomaly_count: number;
  activity_count: number;
}

interface TrendResponse {
  employee_id: string;
  employee_name: string;
  days: number;
  trend: TrendData[];
}

// --- Component ---
const DashboardPage: React.FC = () => {
  const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const EMPLOYEE_ID = '33901353-84ca-11f1-9e39-e4fd457b80cb';

  // --- PDF Download Function ---
  const downloadPDF = async (): Promise<void> => {
    try {
      setDownloading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://127.0.0.1:8000/reports/pdf/${EMPLOYEE_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `threat_report_${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloading(false);
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      alert('Failed to download PDF report. Please try again.');
      setDownloading(false);
    }
  };

  // --- Fetch Data Function ---
  const fetchData = async (): Promise<void> => {
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch from new Risk Engine
      const [riskResponse, anomalyResponse, trendResponse] = await Promise.all([
        axios.get<RiskScoreResponse>(
          `http://127.0.0.1:8000/risk/score/${EMPLOYEE_ID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get<ReportResponse>(
          `http://127.0.0.1:8000/activities/report/${EMPLOYEE_ID}?days=7`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get<TrendResponse>(
          `http://127.0.0.1:8000/risk/trend/${EMPLOYEE_ID}?days=7`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      setRiskData(riskResponse.data);
      setAnomalies(anomalyResponse.data.report?.recent_anomalies || []);
      setTrendData(trendResponse.data.trend || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- Initial Fetch ---
  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setLoading(false);
      setError('Please login to view the dashboard');
    }
  }, [token]);

  // --- Refresh Handler ---
  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchData();
  };

  // --- Helper: Risk Color ---
  const getRiskColor = (level: string | undefined): string => {
    if (!level) return 'bg-gray-400';
    if (level.includes('Critical')) return 'bg-red-600';
    if (level.includes('High')) return 'bg-orange-500';
    if (level.includes('Medium')) return 'bg-yellow-500';
    if (level.includes('Low')) return 'bg-green-500';
    return 'bg-gray-400';
  };

  // --- Helper: Severity Color ---
  const getSeverityColor = (severity: string | undefined): string => {
    if (severity === 'CRITICAL') return 'text-red-600 font-bold';
    if (severity === 'WARNING') return 'text-yellow-600 font-bold';
    return 'text-green-600';
  };

  // --- Helper: Get Risk Level Badge ---
  const getRiskBadge = (level: string): string => {
    const map: Record<string, string> = {
      'Critical Risk': '🔴',
      'High Risk': '🟠',
      'Medium Risk': '🟡',
      'Low Risk': '🟢',
      'No Risk': '⚪'
    };
    return map[level] || '⚪';
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-red-600 text-center">
          <p className="text-xl font-bold">❌ Error</p>
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🛡️ Insider Threat Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600">
              👤 {username || 'User'} ({role || 'No Role'})
            </span>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className={`px-4 py-2 text-white rounded transition ${
                downloading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {downloading ? '📄 Generating...' : '📄 Download PDF'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2 text-white rounded transition ${
                refreshing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* NEW: Risk Score Card (Using New Risk Engine) */}
        {/* ============================================ */}
        {riskData && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm text-gray-500 mb-1">Risk Score</h3>
                <p className="text-3xl font-bold">{riskData.risk_score}%</p>
                <span
                  className={`inline-block px-2 py-1 text-sm rounded text-white ${getRiskColor(
                    riskData.risk_level
                  )}`}
                >
                  {riskData.risk_level_icon} {riskData.risk_level}
                </span>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm text-gray-500 mb-1">Raw Weight</h3>
                <p className="text-3xl font-bold">{riskData.raw_weight}</p>
                <span className="text-xs text-gray-400">Total risk weight</span>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm text-gray-500 mb-1">Total Anomalies</h3>
                <p className="text-3xl font-bold">{riskData.anomaly_count}</p>
                <span className="text-xs text-gray-400">Detected anomalies</span>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm text-gray-500 mb-1">Activities</h3>
                <p className="text-3xl font-bold">{riskData.total_activities || 0}</p>
                <span className="text-xs text-gray-400">Total logged</span>
              </div>
            </div>

            {/* ============================================ */}
            {/* NEW: Risk Factors Section */}
            {/* ============================================ */}
            {riskData.risk_factors && riskData.risk_factors.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-bold mb-3">⚠️ Top Risk Factors</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2">Risk Factor</th>
                        <th className="text-left p-2">Weight</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riskData.risk_factors.map((factor: RiskFactor, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-2 font-medium">{factor.factor.replace(/_/g, ' ').toUpperCase()}</td>
                          <td className="p-2">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
                              {factor.weight}
                            </span>
                          </td>
                          <td className="p-2">{factor.description}</td>
                          <td className="p-2 text-xs text-gray-500">{factor.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* NEW: Risk Trend Section */}
            {/* ============================================ */}
            {trendData && trendData.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-bold mb-3">📈 Risk Trend (Last {trendData.length} Days)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendData.map((day: TrendData, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-600">{day.date}</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-bold ${getRiskColor(day.risk_level)}`}>
                          {day.risk_score}%
                        </span>
                        <span className="text-xs">{getRiskBadge(day.risk_level)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {day.anomaly_count} anomalies · {day.activity_count} activities
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* Recommendations Section */}
            {/* ============================================ */}
            {riskData.recommendations && riskData.recommendations.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-lg font-bold mb-3">💡 Recommendations</h2>
                <ul className="list-disc pl-5 space-y-1">
                  {riskData.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-gray-700">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* ============================================ */}
        {/* Recent Anomalies (Unchanged) */}
        {/* ============================================ */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-3">🔍 Recent Anomalies</h2>
          {anomalies.length === 0 ? (
            <p className="text-gray-500">✅ No anomalies detected</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2">Event Type</th>
                    <th className="text-left p-2">Source</th>
                    <th className="text-left p-2">IP Address</th>
                    <th className="text-left p-2">Reasons</th>
                    <th className="text-left p-2">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalies.map((anomaly: Anomaly, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{anomaly.event_type}</td>
                      <td className="p-2">{anomaly.source_system}</td>
                      <td className="p-2">{anomaly.ip_address}</td>
                      <td className="p-2">
                        <ul className="list-disc pl-4 text-xs text-gray-600">
                          {anomaly.reasons?.map((reason: string, i: number) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </td>
                      <td className={`p-2 ${getSeverityColor(anomaly.metadata?.severity)}`}>
                        {anomaly.metadata?.severity || 'INFO'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;