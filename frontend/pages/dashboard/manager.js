import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import Layout from "../../components/Layout";
import AnomalySummaryCards from "../../components/AnomalySummaryCards";
import TrendChart from "../../components/TrendChart";
import SeverityPieChart from "../../components/SeverityPieChart";
import TopRiskyEmployees from "../../components/TopRiskyEmployees";

export default function ManagerDashboard() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [summaryData, trendData, topData] = await Promise.all([
          apiFetch("/analytics/anomalies/summary"),
          apiFetch("/analytics/anomalies/trend?days=14"),
          apiFetch("/analytics/anomalies/top-employees?limit=8"),
        ]);
        setSummary(summaryData);
        setTrend(trendData);
        setTopEmployees(topData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Layout title="Organizational risk posture" subtitle="Executive overview of insider-threat activity trends">
      {loading ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      ) : (
        <>
          <AnomalySummaryCards summary={summary} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5 lg:col-span-2">
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Anomaly trend (last 14 days)</h2>
              <TrendChart data={trend} />
            </div>
            <div className="card p-5">
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Severity mix</h2>
              <SeverityPieChart summary={summary} />
            </div>
          </div>
          <div className="card p-5 mt-4">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>Top at-risk employees</h2>
            <TopRiskyEmployees employees={topEmployees} />
          </div>
        </>
      )}
    </Layout>
  );
}