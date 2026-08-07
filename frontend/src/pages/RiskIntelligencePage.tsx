import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RiskIntelligencePage: React.FC = () => {
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const EMPLOYEE_ID = '33901353-84ca-11f1-9e39-e4fd457b80cb';

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/risk/score/${EMPLOYEE_ID}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRiskData(response.data);
      } catch (error) {
        console.error('Error fetching risk:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">🎯 Risk Intelligence</h1>
        {loading ? (
          <div className="text-gray-400">Loading risk data...</div>
        ) : !riskData ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No risk data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Risk Score</p>
              <p className="text-3xl font-bold text-blue-400">{riskData.risk_score}%</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Risk Level</p>
              <span className={`inline-block px-3 py-1 rounded text-sm ${
                riskData.risk_level.includes('Critical') ? 'bg-red-600 text-white' :
                riskData.risk_level.includes('High') ? 'bg-orange-500 text-white' :
                riskData.risk_level.includes('Medium') ? 'bg-yellow-500 text-white' :
                'bg-green-500 text-white'
              }`}>
                {riskData.risk_level}
              </span>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Anomaly Count</p>
              <p className="text-3xl font-bold text-red-400">{riskData.anomaly_count}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 col-span-3">
              <p className="text-gray-400 text-sm">Risk Factors</p>
              <ul className="list-disc pl-5 text-gray-300">
                {riskData.risk_factors?.map((factor: any, index: number) => (
                  <li key={index}>{factor.description} - <span className="text-yellow-400">{factor.weight}</span></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskIntelligencePage;