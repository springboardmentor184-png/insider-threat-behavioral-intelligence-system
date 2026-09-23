import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../utils/api";
import Layout from "../../components/Layout";
import AnomalySummaryCards from "../../components/AnomalySummaryCards";
import AnomalyTable from "../../components/AnomalyTable";
import ThreatsPanel from "../../components/ThreatsPanel";

export default function AnalystDashboard() {
  const [summary, setSummary] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [summaryData, anomalyData, threatData] = await Promise.all([
        apiFetch("/analytics/anomalies/summary"),
        apiFetch("/analytics/anomalies?status=open&limit=100"),
        apiFetch("/analytics/threats?status=open"),
      ]);
      setSummary(summaryData);
      setAnomalies(anomalyData);
      setThreats(threatData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (id, status) => {
    await apiFetch(`/analytics/anomalies/${id}/status?new_status=${status}`, { method: "PATCH" });
    loadData();
  };

  const handleEscalate = async (id) => {
    await apiFetch(`/analytics/threats/from-anomaly/${id}`, { method: "POST" });
    loadData();
  };

  return (
    <Layout title="Security overview" subtitle="Review and triage behavioral anomalies across the organization">
      {loading ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      ) : (
        <>
          <AnomalySummaryCards summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Open anomalies</h2>
              <AnomalyTable
                anomalies={anomalies}
                canEscalate={true}
                onStatusChange={handleStatusChange}
                onEscalate={handleEscalate}
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
                My escalated threats <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>({threats.length})</span>
              </h2>
              <ThreatsPanel threats={threats} />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}