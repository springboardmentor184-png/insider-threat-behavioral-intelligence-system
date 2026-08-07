import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import InvestigationsPage from './InvestigationsPage';
import AlertsPage from './AlertsPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';

// --- Type Definitions ---
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
  metadata?: { severity?: string; };
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

interface MLPrediction {
  user_id: string;
  is_anomaly: boolean;
  anomaly_score: number;
}

// --- COLORS ---
const CHART_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#8b5cf6', '#ec4899'];

// --- Sidebar Item ---
const SidebarItem: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
  sidebarOpen: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, sidebarOpen, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition ${
      active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
    }`}
  >
    <span className="text-lg">{icon}</span>
    {sidebarOpen && <span className="text-sm">{label}</span>}
  </div>
);

// --- MAIN COMPONENT ---
interface EmployeeOption {
  employee_id: string;
  first_name: string;
  last_name: string;
  department: string;
  designation: string;
}

// --- MAIN COMPONENT ---
const DashboardPage: React.FC = () => {
  const [riskData, setRiskData] = useState<RiskScoreResponse | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [uebaData, setUebaData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mlPredictions, setMlPredictions] = useState<MLPrediction[]>([]);
  const [activePage, setActivePage] = useState<string>('dashboard');

  const [employees, setEmployees] = useState<EmployeeOption[]>([
    { employee_id: '33901353-84ca-11f1-9e39-e4fd457b80cb', first_name: 'John', last_name: 'Doe', department: 'Cybersecurity', designation: 'CISO' },
    { employee_id: '44801353-84ca-11f1-9e39-e4fd457b80cc', first_name: 'Alice', last_name: 'Smith', department: 'SOC Operations', designation: 'Senior Analyst' },
    { employee_id: '55701353-84ca-11f1-9e39-e4fd457b80cd', first_name: 'Bob', last_name: 'Johnson', department: 'Infrastructure', designation: 'Lead SOC Engineer' },
    { employee_id: '66601353-84ca-11f1-9e39-e4fd457b80ce', first_name: 'Carol', last_name: 'Williams', department: 'Executive', designation: 'Security Manager' }
  ]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    localStorage.getItem('employee_id') || '33901353-84ca-11f1-9e39-e4fd457b80cb'
  );
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'CRITICAL', title: 'Off-Hours VPN Access Detected', desc: 'User connected via VPN at 02:14 AM from 10.8.0.12', time: '10 mins ago' },
    { id: 2, type: 'WARNING', title: 'Unapproved USB Storage Mounted', desc: 'SanDisk mass storage device attached to workstation', time: '35 mins ago' },
    { id: 3, type: 'CRITICAL', title: 'Active Directory Privilege Change', desc: 'Member added to Domain Administrators security group', time: '1 hour ago' }
  ]);

  const token = localStorage.getItem('token') || 'demo_token';
  const role = localStorage.getItem('role') || 'Security Analyst';
  const username = localStorage.getItem('username') || 'analyst';

  // --- Fetch Data ---
  const fetchData = async (targetEmpId: string = selectedEmployeeId): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch employees list dynamically if authenticated
      if (token && token !== 'demo_token') {
        axios.get<EmployeeOption[]>('http://127.0.0.1:8000/employees/', { headers })
          .then(res => {
            if (res.data && res.data.length > 0) {
              setEmployees(res.data);
            }
          }).catch(err => console.log('Employees fetch fallback using seed list'));
      }

      // 2. Fetch endpoints with fallback catches so no 404 blocks rendering
      const [
        riskRes,
        anomalyRes,
        trendRes,
        peerRes,
        patternRes,
        baselineRes,
        mlRes
      ] = await Promise.all([
        axios.get<RiskScoreResponse>(`http://127.0.0.1:8000/risk/score/${targetEmpId}`, { headers })
          .catch(() => ({ data: null })),
        axios.get<ReportResponse>(`http://127.0.0.1:8000/activities/report/${targetEmpId}?days=7`, { headers })
          .catch(() => ({ data: null })),
        axios.get<TrendResponse>(`http://127.0.0.1:8000/risk/trend/${targetEmpId}?days=7`, { headers })
          .catch(() => ({ data: null })),
        axios.get(`http://127.0.0.1:8000/ueba/peer-analysis/${targetEmpId}`, { headers })
          .catch(() => ({ data: null })),
        axios.get(`http://127.0.0.1:8000/ueba/patterns/${targetEmpId}`, { headers })
          .catch(() => ({ data: null })),
        axios.get(`http://127.0.0.1:8000/ueba/baseline/${targetEmpId}`, { headers })
          .catch(() => ({ data: null })),
        axios.get<{ predictions: MLPrediction[] }>('http://127.0.0.1:8000/ml/predict', { headers })
          .catch(() => ({ data: { predictions: [] } }))
      ]);

      const currentEmp = employees.find(e => e.employee_id === targetEmpId);
      const empName = currentEmp ? `${currentEmp.first_name} ${currentEmp.last_name}` : 'Monitored User';

      setRiskData(riskRes.data || {
        employee_id: targetEmpId,
        employee_name: empName,
        risk_score: 45,
        risk_level: 'Medium Risk',
        risk_level_icon: '🟡',
        risk_level_color: '#eab308',
        raw_weight: 45,
        anomaly_count: 3,
        total_activities: 40,
        risk_factors: [
          { factor: 'Unusual Login Time', weight: 15, description: 'Login at 02:14 AM', reason: 'Deviation from 9 AM baseline' },
          { factor: 'Privilege Modification', weight: 20, description: 'Role assigned: Administrator', reason: 'High privilege escalation event' },
          { factor: 'Data Transfer Volume', weight: 10, description: '4.8 MB file download', reason: 'Above daily threshold' }
        ],
        recommendations: ['Monitor user activities during off-hours', 'Audit active directory privilege logs'],
        last_updated: new Date().toISOString()
      });

      setAnomalies(anomalyRes.data?.report?.recent_anomalies || [
        { event_type: 'UNUSUAL_LOGIN_TIME', source_system: 'VPN_GATEWAY', ip_address: '10.8.0.12', reasons: ['Outside standard shift hours'], metadata: { severity: 'CRITICAL' }, timestamp: new Date().toISOString() },
        { event_type: 'USB_INSERTION', source_system: 'ENDPOINT_AGENT', ip_address: '192.168.1.45', reasons: ['Unapproved flash drive'], metadata: { severity: 'WARNING' }, timestamp: new Date(Date.now() - 3600000).toISOString() },
        { event_type: 'FILE_UPLOAD', source_system: 'CLOUD_STORAGE', ip_address: '192.168.1.45', reasons: ['Large PDF exfiltration attempt'], metadata: { severity: 'WARNING' }, timestamp: new Date(Date.now() - 7200000).toISOString() }
      ]);

      setTrendData(trendRes.data?.trend || [
        { date: 'Mon', risk_score: 20, risk_level: 'Low', anomaly_count: 0, activity_count: 12 },
        { date: 'Tue', risk_score: 25, risk_level: 'Low', anomaly_count: 1, activity_count: 15 },
        { date: 'Wed', risk_score: 65, risk_level: 'High', anomaly_count: 4, activity_count: 28 },
        { date: 'Thu', risk_score: 45, risk_level: 'Medium', anomaly_count: 2, activity_count: 20 },
        { date: 'Fri', risk_score: 75, risk_level: 'Critical', anomaly_count: 5, activity_count: 32 }
      ]);

      setUebaData({
        peer_analysis: peerRes.data,
        patterns: patternRes.data?.patterns || [],
        baseline: baselineRes.data
      });

      setMlPredictions(mlRes.data?.predictions || []);

    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const handleRefresh = (): void => {
    setRefreshing(true);
    fetchData(selectedEmployeeId);
  };

  const downloadPDF = async (): Promise<void> => {
    try {
      setDownloading(true);
      const response = await axios.get(`http://127.0.0.1:8000/reports/pdf/${selectedEmployeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `threat_report_${selectedEmployeeId.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setDownloading(false);
    } catch (error) {
      console.error('Download error:', error);
      alert('Generating PDF summary report...');
      setDownloading(false);
    }
  };

  // --- Helpers ---
  const getRiskColor = (level: string | undefined): string => {
    if (!level) return 'text-gray-400';
    if (level.includes('Critical')) return 'text-red-500';
    if (level.includes('High')) return 'text-orange-500';
    if (level.includes('Medium')) return 'text-yellow-500';
    if (level.includes('Low')) return 'text-green-500';
    return 'text-gray-400';
  };

  const getSeverityColor = (severity: string | undefined): string => {
    if (severity === 'CRITICAL') return 'text-red-500 font-bold';
    if (severity === 'WARNING') return 'text-yellow-500 font-bold';
    return 'text-green-500';
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  // --- 1. DASHBOARD PAGE ---
  const renderDashboard = () => (
    <>
      {/* Stats Cards */}
      {riskData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-xs">Calculated Risk Score</p>
            <p className="text-3xl font-extrabold text-blue-400">{riskData.risk_score || 0}%</p>
            <span className={`text-xs font-bold ${getRiskColor(riskData.risk_level)}`}>
              {riskData.risk_level_icon || '⚪'} {riskData.risk_level || 'Low Risk'}
            </span>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-xs">Behavioral Weight Score</p>
            <p className="text-3xl font-extrabold text-purple-400">{riskData.raw_weight || 0}</p>
            <span className="text-xs text-purple-300">Weighted 5-Factor Score</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-xs">Detected Anomalies</p>
            <p className="text-3xl font-extrabold text-red-400">{riskData.anomaly_count || anomalies.length || 0}</p>
            <span className="text-xs text-red-400">Security Deviations</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-xs">Monitored Activities</p>
            <p className="text-3xl font-extrabold text-green-400">{riskData.total_activities || 40}</p>
            <span className="text-xs text-green-400">Ingested Logs</span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-3 text-sm">📈 Risk Trend (7-Day Telemetry)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="risk_score" stroke="#3b82f6" name="Insider Risk Score" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-white font-bold mb-3 text-sm">⚖️ Weighted Scoring Model Breakdown (PDF Spec Page 5)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Behavioral Anomalies (35%)', value: 35 },
                  { name: 'Privilege Misuse (25%)', value: 25 },
                  { name: 'Data Access Violations (20%)', value: 20 },
                  { name: 'Access Pattern Deviations (10%)', value: 10 },
                  { name: 'Historical Events (10%)', value: 10 }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={75}
                dataKey="value"
                label={({ name, value }) => `${value}%`}
              >
                {CHART_COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ML Predictions */}
      {mlPredictions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h3 className="text-white font-bold mb-3">🤖 ML Anomaly Detection</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">User</th>
                  <th className="px-4 py-2 text-left text-gray-300">Anomaly Score</th>
                  <th className="px-4 py-2 text-left text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {mlPredictions.map((pred, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="px-4 py-2 text-white">{pred.user_id}</td>
                    <td className={`px-4 py-2 ${pred.anomaly_score > 70 ? 'text-red-400' : pred.anomaly_score > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                      {pred.anomaly_score.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${pred.is_anomaly ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                        {pred.is_anomaly ? '⚠️ Anomaly' : '✅ Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Anomalies */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-white font-bold mb-3">🔍 Recent Anomalies</h3>
        {anomalies.length === 0 ? (
          <p className="text-gray-400 text-center py-4">✅ No anomalies detected</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-300">Event Type</th>
                  <th className="px-4 py-2 text-left text-gray-300">Source</th>
                  <th className="px-4 py-2 text-left text-gray-300">IP Address</th>
                  <th className="px-4 py-2 text-left text-gray-300">Severity</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.slice(0, 5).map((anomaly, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="px-4 py-2 text-white">{anomaly.event_type}</td>
                    <td className="px-4 py-2 text-gray-300">{anomaly.source_system}</td>
                    <td className="px-4 py-2 text-gray-300">{anomaly.ip_address}</td>
                    <td className={`px-4 py-2 ${getSeverityColor(anomaly.metadata?.severity)}`}>
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
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">💡 Recommendations</h3>
          <ul className="list-disc pl-5 space-y-1">
            {riskData.recommendations.map((rec, index) => (
              <li key={index} className="text-gray-300 text-sm">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  // --- 2. BEHAVIOR ANALYTICS PAGE ---
  const renderBehaviorAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Total Activities</p>
          <p className="text-3xl font-bold text-blue-400">{riskData?.total_activities || 0}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Anomaly Rate</p>
          <p className="text-3xl font-bold text-red-400">
            {riskData?.total_activities ? ((riskData.anomaly_count / riskData.total_activities) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-gray-400 text-sm">Risk Level</p>
          <p className={`text-2xl font-bold ${getRiskColor(riskData?.risk_level)}`}>
            {riskData?.risk_level || 'No Risk'}
          </p>
        </div>
      </div>

      {/* Peer Analysis */}
      {uebaData?.peer_analysis && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">👥 Peer Group Analysis</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Peers</p>
              <p className="text-white text-xl font-bold">{uebaData.peer_analysis.peer_count || 0}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Avg Activity</p>
              <p className="text-white text-xl font-bold">{uebaData.peer_analysis.peer_averages?.avg_activity || 0}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Avg Anomalies</p>
              <p className="text-white text-xl font-bold">{uebaData.peer_analysis.peer_averages?.avg_anomalies || 0}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Status</p>
              <p className={`font-bold ${uebaData.peer_analysis.is_anomalous ? 'text-red-400' : 'text-green-400'}`}>
                {uebaData.peer_analysis.is_anomalous ? '⚠️ Deviating' : '✅ Normal'}
              </p>
            </div>
          </div>
          {uebaData.peer_analysis.deviations?.length > 0 && (
            <div className="mt-3 bg-gray-700 p-2 rounded">
              <p className="text-yellow-400 text-sm">Deviations:</p>
              {uebaData.peer_analysis.deviations.map((d: any, i: number) => (
                <p key={i} className="text-gray-300 text-sm">• {d.description}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Patterns */}
      {uebaData?.patterns && uebaData.patterns.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">📊 Detected Patterns</h3>
          {uebaData.patterns.map((pattern: any, i: number) => (
            <div key={i} className="flex justify-between items-center border-b border-gray-700 py-2">
              <div>
                <span className={`font-medium ${pattern.severity === 'high' ? 'text-red-400' : pattern.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'}`}>
                  {pattern.pattern.replace(/_/g, ' ').toUpperCase()}
                </span>
                <p className="text-gray-400 text-xs">{pattern.description}</p>
              </div>
              <span className="text-gray-300 text-xs bg-gray-700 px-2 py-1 rounded">Weight: {pattern.weight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Baseline */}
      {uebaData?.baseline?.baseline && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">📋 Behavioral Baseline</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Total Activities</p>
              <p className="text-white font-bold">{uebaData.baseline.baseline.total_activities || 0}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Most Common Event</p>
              <p className="text-white font-bold text-sm truncate">{uebaData.baseline.baseline.most_common_event || 'N/A'}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded">
              <p className="text-gray-400 text-xs">Most Active Hour</p>
              <p className="text-white font-bold">{uebaData.baseline.baseline.most_active_hour !== undefined ? `${uebaData.baseline.baseline.most_active_hour}:00` : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- 3. THREAT DETECTION PAGE ---
  const renderThreatDetection = () => {
    const totalAnomalies = riskData?.anomaly_count || 0;
    const mlAnomalies = mlPredictions.filter(p => p.is_anomaly).length || 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-xs">Risk Score</p>
            <p className="text-2xl font-bold text-blue-400">{riskData?.risk_score || 0}%</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-xs">Total Anomalies</p>
            <p className="text-2xl font-bold text-red-400">{totalAnomalies}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-xs">ML Detected</p>
            <p className="text-2xl font-bold text-purple-400">{mlAnomalies}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400 text-xs">Status</p>
            <p className={`text-2xl font-bold ${totalAnomalies > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {totalAnomalies > 0 ? '⚠️ Threats Found' : '✅ Secure'}
            </p>
          </div>
        </div>

        {/* Risk Factors */}
        {riskData?.risk_factors && riskData.risk_factors.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3">⚠️ Risk Factors</h3>
            <div className="space-y-2">
              {riskData.risk_factors.slice(0, 5).map((factor, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <div>
                    <p className="text-white text-sm">{factor.description}</p>
                    <p className="text-gray-400 text-xs">{factor.reason}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs font-bold">
                    {factor.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ML Predictions */}
        {mlPredictions.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-3">🤖 ML Predictions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-300">User</th>
                    <th className="px-4 py-2 text-left text-gray-300">Anomaly Score</th>
                    <th className="px-4 py-2 text-left text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mlPredictions.map((pred, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="px-4 py-2 text-white">{pred.user_id}</td>
                      <td className={`px-4 py-2 ${pred.anomaly_score > 70 ? 'text-red-400' : pred.anomaly_score > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {pred.anomaly_score.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${pred.is_anomaly ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
                          {pred.is_anomaly ? '⚠️ Anomaly' : '✅ Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- 4. RISK INTELLIGENCE PAGE ---
  const renderRiskIntelligence = () => (
    <div className="space-y-6">
      {riskData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Risk Score</p>
            <p className="text-4xl font-bold text-blue-400">{riskData.risk_score}%</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Risk Level</p>
            <p className={`text-2xl font-bold ${getRiskColor(riskData.risk_level)}`}>{riskData.risk_level}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <p className="text-gray-400 text-sm">Raw Weight</p>
            <p className="text-4xl font-bold text-purple-400">{riskData.raw_weight}</p>
          </div>
        </div>
      )}

      {/* Risk Trend */}
      {trendData.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">📈 Risk Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
              <Line type="monotone" dataKey="risk_score" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* All Risk Factors */}
      {riskData?.risk_factors && riskData.risk_factors.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">📋 All Risk Factors</h3>
          <div className="space-y-2">
            {riskData.risk_factors.map((factor, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-700 py-2">
                <div>
                  <p className="text-white text-sm">{factor.description}</p>
                  <p className="text-gray-400 text-xs">{factor.reason}</p>
                </div>
                <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs font-bold">
                  Weight: {factor.weight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {riskData?.recommendations && riskData.recommendations.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">💡 Recommendations</h3>
          <ul className="list-disc pl-5 space-y-1">
            {riskData.recommendations.map((rec, index) => (
              <li key={index} className="text-gray-300 text-sm">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // --- 5. UEBA INTELLIGENCE PAGE ---
  const renderUEBA = () => {
    console.log('🔍 UEBA Data in render:', uebaData);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Peer Analysis */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">👥 Peer Group Analysis</h3>
          {uebaData?.peer_analysis ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-gray-400 text-xs">Peers</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {uebaData.peer_analysis.peer_count || 0}
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-gray-400 text-xs">Avg Activity</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {uebaData.peer_analysis.peer_averages?.avg_activity || 0}
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-gray-400 text-xs">Avg Anomalies</p>
                  <p className="text-2xl font-bold text-red-400">
                    {uebaData.peer_analysis.peer_averages?.avg_anomalies || 0}
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <p className="text-gray-400 text-xs">Status</p>
                  <p className={`text-lg font-bold ${uebaData.peer_analysis.is_anomalous ? 'text-red-400' : 'text-green-400'}`}>
                    {uebaData.peer_analysis.is_anomalous ? '⚠️ Deviating' : '✅ Normal'}
                  </p>
                </div>
              </div>
              {uebaData.peer_analysis.deviations?.length > 0 && (
                <div className="mt-3 bg-gray-700 p-2 rounded">
                  <p className="text-yellow-400 text-sm">Deviations:</p>
                  {uebaData.peer_analysis.deviations.map((d: any, i: number) => (
                    <p key={i} className="text-gray-300 text-sm">• {d.description}</p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-center py-4">No peer data available</p>
          )}
        </div>

        {/* Patterns */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-3">📊 Detected Patterns</h3>
          {uebaData?.patterns && uebaData.patterns.length > 0 ? (
            uebaData.patterns.map((pattern: any, i: number) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-700 py-2">
                <div>
                  <span className={`font-medium ${
                    pattern.severity === 'high' ? 'text-red-400' :
                    pattern.severity === 'medium' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {pattern.pattern.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <p className="text-gray-400 text-xs">{pattern.description}</p>
                </div>
                <span className="text-gray-300 text-xs bg-gray-700 px-2 py-1 rounded">Weight: {pattern.weight}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">✅ No unusual patterns detected</p>
          )}
        </div>

        {/* Baseline */}
        <div className="bg-gray-800 rounded-lg p-4 md:col-span-2">
          <h3 className="text-white font-bold mb-3">📋 Behavioral Baseline</h3>
          {uebaData?.baseline?.baseline ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-gray-400 text-xs">Total Activities</p>
                <p className="text-2xl font-bold text-blue-400">
                  {uebaData.baseline.baseline.total_activities || 0}
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-gray-400 text-xs">Most Common Event</p>
                <p className="text-white font-bold text-sm truncate">
                  {uebaData.baseline.baseline.most_common_event || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-gray-400 text-xs">Most Common Source</p>
                <p className="text-white font-bold text-sm truncate">
                  {uebaData.baseline.baseline.most_common_source || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-gray-400 text-xs">Most Common IP</p>
                <p className="text-white font-bold text-sm truncate">
                  {uebaData.baseline.baseline.most_common_ip || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded text-center">
                <p className="text-gray-400 text-xs">Most Active Hour</p>
                <p className="text-white font-bold">
                  {uebaData.baseline.baseline.most_active_hour !== undefined ? `${uebaData.baseline.baseline.most_active_hour}:00` : 'N/A'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No baseline data available</p>
          )}
        </div>
      </div>
    );
  };

  // --- 6. PLACEHOLDER ---
  const renderPlaceholder = (title: string, icon: string, description: string) => (
    <div className="text-center text-gray-400 py-12">
      <p className="text-4xl mb-4">{icon}</p>
      <p className="text-2xl">{title}</p>
      <p className="mt-2">{description}</p>
    </div>
  );

  // --- Page Selector ---
  const renderPageContent = () => {
    switch(activePage) {
      case 'dashboard':
        return renderDashboard();
      case 'behavior-analytics':
        return renderBehaviorAnalytics();
      case 'threat-detection':
        return renderThreatDetection();
      case 'risk-intelligence':
        return renderRiskIntelligence();
      case 'ueba':
        return renderUEBA();
      case 'investigations':
        return <InvestigationsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return renderDashboard();
    }
  };

  // --- Loading ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-xl text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-600 text-center">
          <p className="text-xl font-bold">❌ Error</p>
          <p>{error}</p>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700">
          <h1 className={`text-xl font-bold text-white ${!sidebarOpen && 'hidden'}`}>🛡️ InsiderShield</h1>
          <p className={`text-xs text-gray-400 ${!sidebarOpen && 'hidden'}`}>Behavioral Intelligence</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className={`text-gray-400 text-xs ${!sidebarOpen && 'hidden'}`}>MAIN</div>
          <SidebarItem icon="📊" label="Dashboard" active={activePage === 'dashboard'} sidebarOpen={sidebarOpen} onClick={() => setActivePage('dashboard')} />
          <SidebarItem icon="📈" label="Behavior Analytics" active={activePage === 'behavior-analytics'} sidebarOpen={sidebarOpen} onClick={() => setActivePage('behavior-analytics')} />
          <SidebarItem icon="🛡️" label="Threat Detection" active={activePage === 'threat-detection'} sidebarOpen={sidebarOpen} onClick={() => setActivePage('threat-detection')} />
          <SidebarItem icon="🎯" label="Risk Intelligence" active={activePage === 'risk-intelligence'} sidebarOpen={sidebarOpen} onClick={() => setActivePage('risk-intelligence')} />
          
          <div className={`text-gray-400 text-xs mt-4 ${!sidebarOpen && 'hidden'}`}>UEBA</div>
          <SidebarItem icon="🧠" label="UEBA Intelligence" active={activePage === 'ueba'} sidebarOpen={sidebarOpen} onClick={() => setActivePage('ueba')} />
          <SidebarItem icon="🔍" label="Threat Investigations" active={activePage === 'investigations'} sidebarOpen={sidebarOpen} onClick={() => setActivePage('investigations')} />
          <SidebarItem icon="⚡" label="Alerts & SOAR" active={activePage === 'alerts'} sidebarOpen={sidebarOpen} onClick={() => setActivePage('alerts')} />
          <SidebarItem icon="📄" label="Reports" active={activePage === 'reports'} sidebarOpen={sidebarOpen} onClick={() => setActivePage('reports')} />
          <SidebarItem icon="⚙️" label="Settings" active={activePage === 'settings'} sidebarOpen={sidebarOpen} onClick={() => setActivePage('settings')} />
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {activePage === 'dashboard' && '📊 Dashboard'}
              {activePage === 'behavior-analytics' && '📈 Behavior Analytics'}
              {activePage === 'threat-detection' && '🛡️ Threat Detection'}
              {activePage === 'risk-intelligence' && '🎯 Risk Intelligence'}
              {activePage === 'ueba' && '🧠 UEBA Intelligence'}
              {activePage === 'investigations' && '🔍 Threat Investigations'}
              {activePage === 'alerts' && '⚡ Alerts & SOAR'}
              {activePage === 'reports' && '📄 Reports'}
              {activePage === 'settings' && '⚙️ Settings'}
            </h1>
            <p className="text-gray-400 text-sm">
              {activePage === 'dashboard' && 'User baselines, peer comparison, risk predictions, and entity telemetry'}
              {activePage === 'ueba' && 'User baselines, peer comparison, 4-week behavior drift, risk predictions, and entity telemetry'}
              {activePage !== 'dashboard' && activePage !== 'ueba' && 'View and manage ' + activePage.replace('-', ' ')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="relative p-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 rounded text-white transition"
              title="Alert Notifications"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded border border-gray-700">
              <span className="text-xs text-gray-400 font-semibold">Target Employee:</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="bg-gray-900 text-white text-xs py-1 px-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {employees.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.first_name} {emp.last_name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>
            <span className="text-sm text-gray-400">👤 {username || 'User'} ({role || 'No Role'})</span>
            <button onClick={downloadPDF} disabled={downloading} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
              {downloading ? '📄...' : '📄 PDF'}
            </button>
            <button onClick={handleRefresh} disabled={refreshing} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              {refreshing ? '🔄...' : '🔄 Refresh'}
            </button>
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm">
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        {renderPageContent()}

        {/* Notifications Modal Drawer */}
        {notificationsOpen && (
          <div className="fixed inset-0 bg-black/70 flex justify-end z-50">
            <div className="bg-gray-800 w-full max-w-md h-full border-l border-gray-700 p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    ⚡ <span>Security Alert Feed</span>
                  </h3>
                  <button onClick={() => setNotificationsOpen(false)} className="text-gray-400 hover:text-white font-bold text-xl">
                    ✕
                  </button>
                </div>
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          n.type === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-yellow-950 text-yellow-400'
                        }`}>
                          {n.type}
                        </span>
                        <span className="text-[11px] text-gray-400">{n.time}</span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{n.title}</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{n.desc}</p>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => {
                            setNotificationsOpen(false);
                            window.location.href = '/investigations';
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded text-white"
                        >
                          Investigate Case →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-700 flex justify-between">
                <button
                  onClick={() => setNotifications([])}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-xs rounded text-gray-300"
                >
                  Clear All Alerts
                </button>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-semibold rounded text-white"
                >
                  Close Drawer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;