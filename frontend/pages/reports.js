import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import Layout from "../components/Layout";
import SeverityPieChart from "../components/SeverityPieChart";
import RiskCategoryBadge from "../components/RiskCategoryBadge";
import Link from "next/link";

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportDetail, setExportDetail] = useState("summary");
  useEffect(() => { apiFetch("/analytics/reports/overview").then(setReport).catch(console.error); }, []);
  const exportPdf = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/analytics/reports/export.pdf?detail=${exportDetail}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error("PDF export failed");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url; link.download = `aegis-${exportDetail}-risk-report.pdf`; link.click(); URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setExporting(false);
    }
  };
  if (!report) return <Layout title="Reports" subtitle="Organizational risk snapshot"><p>Loading…</p></Layout>;
  return <Layout title="Reports" subtitle="Current operational and risk metrics"><div className="flex justify-end gap-2 mb-4"><select value={exportDetail} onChange={(event) => setExportDetail(event.target.value)} className="input-field w-auto py-2 text-sm" aria-label="PDF export detail"><option value="summary">Summary PDF</option><option value="detailed">Detailed PDF</option></select><button onClick={exportPdf} disabled={exporting} className="btn-primary px-4 py-2 text-sm">{exporting ? "Preparing PDF…" : "Export PDF"}</button></div><div className="grid md:grid-cols-3 gap-4 mb-4">{[["Open anomalies",report.open_anomalies],["Active alerts",report.active_alerts],["Active threats",report.active_threats]].map(([label,value])=><div key={label} className="card p-5"><p className="text-sm" style={{color:"var(--color-text-muted)"}}>{label}</p><p className="text-3xl font-bold mt-2">{value}</p></div>)}</div><div className="grid lg:grid-cols-2 gap-4"><div className="card p-5"><h2 className="text-sm font-semibold mb-4">Risk category breakdown</h2><SeverityPieChart summary={{by_severity:report.risk_levels}} /></div><div className="card p-5"><h2 className="text-sm font-semibold mb-4">Top flagged users</h2><div className="space-y-3">{report.top_flagged_users.map((user) => <div key={user.employee_id} className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="text-sm font-medium">{user.employee_id}</span><RiskCategoryBadge level={user.risk_level} label={user.risk_category} /></div><Link href={`/investigations/${encodeURIComponent(user.employee_id)}`} className="text-xs font-semibold" style={{color:"var(--color-primary)"}}>Investigate</Link></div>)}</div></div></div></Layout>;
}
