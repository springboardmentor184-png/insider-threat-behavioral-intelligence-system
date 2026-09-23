import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import Layout from "../components/Layout";
import Link from "next/link";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const load = () => apiFetch("/analytics/alerts").then(setAlerts).catch(console.error);
  useEffect(load, []);
  const acknowledge = async (id) => { await apiFetch(`/analytics/alerts/${id}`, {method:"PATCH", body: JSON.stringify({status:"acknowledged"})}); load(); };
  return <Layout title="Alerts" subtitle="Prioritized security signals requiring review">
    <div className="space-y-3">{alerts.length ? alerts.map((a) => <article key={a.id} className="card p-5 flex justify-between gap-4"><div><p className="text-xs uppercase font-semibold" style={{color:"var(--sev-high)"}}>{a.severity} · {a.status}</p><h2 className="font-semibold mt-1">{a.title}</h2><p className="text-sm mt-1" style={{color:"var(--color-text-muted)"}}>{a.description}</p><p className="text-xs mt-2" style={{color:"var(--color-text-faint)"}}>Flagged user: {a.employee_id}</p></div><div className="flex items-start gap-2 shrink-0"><Link href={`/investigations/${encodeURIComponent(a.employee_id)}`} className="btn-primary px-3 h-9 text-sm flex items-center">Investigate</Link>{a.status === "new" && <button className="btn-primary px-3 h-9 text-sm" onClick={() => acknowledge(a.id)}>Acknowledge</button>}</div></article>) : <div className="card p-6 text-sm" style={{color:"var(--color-text-muted)"}}>No alerts have been generated yet.</div>}</div>
  </Layout>;
}
