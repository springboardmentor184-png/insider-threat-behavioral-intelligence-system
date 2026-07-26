import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../../utils/api";
import Layout from "../../components/Layout";
import AnomalySummaryCards from "../../components/AnomalySummaryCards";
import LiveFeed from "../../components/LiveFeed";

export default function SocDashboard() {
  const [summary, setSummary] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const summaryData = await apiFetch("/analytics/anomalies/summary");
      const anomalyData = await apiFetch("/analytics/anomalies?status=open&limit=25");
      setSummary(summaryData);
      setAnomalies(anomalyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <Layout title="Live monitoring" subtitle="Real-time feed of behavioral events as they're detected">
      {loading ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      ) : (
        <>
          <AnomalySummaryCards summary={summary} />
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Recent activity</h2>
          <LiveFeed anomalies={anomalies} onRefresh={loadData} intervalMs={15000} />
        </>
      )}
    </Layout>
  );
}