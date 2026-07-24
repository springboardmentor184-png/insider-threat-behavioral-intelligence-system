import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Type Definitions ---
interface RiskData {
  risk_score: number;
  risk_level: string;
  total_activities: number;
  total_anomalies: number;
  anomaly_percentage: number;
  risk_factors: string[];
  recommendations: string[];
  employee_name: string;
  employee_id: string;
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

// --- Component ---
const DashboardPage: React.FC = () => {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const EMPLOYEE_ID = '33901353-84ca-11f1-9e39-e4fd457b80cb';

  const fetchData = async (): Promise<void> => {
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [riskResponse, anomalyResponse] = await Promise.all([
        axios.get<RiskData>(
          `http://127.0.0.1:8000/activities/risk-score/${EMPLOYEE_ID}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get<ReportResponse>(
          `http://127.0.0.1:8000/activities/report/${EMPLOYEE_ID}?days=7`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);

      setRiskData(riskResponse.data);
      setAnomalies(anomalyResponse.data.report?.recent_anomalies || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setLoading(false);
      setError('Please login to view the dashboard');
    }
  }, [token]);

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchData();
  };

  const getRiskColor = (level: string | undefined): string => {
    if (!level) return 'bg-gray-400';
    if (level.includes('Critical')) return 'bg-red-600';
    if (level.includes('High')) return 'bg-orange-500';
    if (level.includes('Medium')) return 'bg-yellow-500';
    if (level.includes('Low')) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getSeverityColor = (severity: string | undefined): string => {
    if (severity === 'CRITICAL') return 'text-red-600 font-bold';
    if (severity === 'WARNING') return 'text-yellow-600 font-bold';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

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
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {riskData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm text-gray-500 mb-1">Risk Score</h3>
              <p className="text-3xl font-bold">{riskData.risk_score ?? 0}%</p>
              <span
                className={`inline-block px-2 py-1 text-sm rounded text-white ${getRiskColor(
                  riskData.risk_level
                )}`}
              >
                {riskData.risk_level || 'Unknown'}
              </span>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm text-gray-500 mb-1">Total Activities</h3>
              <p className="text-3xl font-bold">{riskData.total_activities ?? 0}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm text-gray-500 mb-1">Total Anomalies</h3>
              <p className="text-3xl font-bold">{riskData.total_anomalies ?? 0}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-sm text-gray-500 mb-1">Anomaly Rate</h3>
              <p className="text-3xl font-bold">{riskData.anomaly_percentage ?? 0}%</p>
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {riskData?.risk_factors && riskData.risk_factors.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-bold mb-3">⚠️ Risk Factors</h2>
            <ul className="list-disc pl-5">
              {riskData.risk_factors.map((factor: string, index: number) => (
                <li key={index} className="text-yellow-700">
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Anomalies */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
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

        {/* Recommendations */}
        {riskData?.recommendations && riskData.recommendations.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
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
      </div>
    </div>
  );
};

export default DashboardPage;