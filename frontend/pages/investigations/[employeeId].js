import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/Layout";
import { apiFetch } from "../../utils/api";
import RiskCategoryBadge from "../../components/RiskCategoryBadge";

const eventLabels = { logon: "Logon", logoff: "Logoff", device_connect: "Device connected", device_disconnect: "Device disconnected" };

export default function InvestigationPage() {
  const router = useRouter();
  const employeeId = typeof router.query.employeeId === "string" ? router.query.employeeId : null;
  const [investigation, setInvestigation] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (employeeId) apiFetch(`/analytics/investigations/${encodeURIComponent(employeeId)}`).then(setInvestigation).catch(console.error);
  }, [employeeId]);
  const updateStatus = async (status) => {
    setSaving(true);
    try { setInvestigation(await apiFetch(`/analytics/investigations/${encodeURIComponent(employeeId)}`, { method: "PATCH", body: JSON.stringify({ status }) })); }
    finally { setSaving(false); }
  };
  if (!investigation) return <Layout title="Threat investigation" subtitle="Loading investigation evidence…"><p>Loading…</p></Layout>;
  const currentRisk = investigation.risk_history[investigation.risk_history.length - 1];
  return <Layout title={`Investigation: ${investigation.employee_id}`} subtitle="Chronological activity, risk context, and related indicators">
    <div className="flex flex-wrap justify-between items-center gap-3 mb-5"><Link href="/alerts" className="text-sm font-medium" style={{color:"var(--color-primary)"}}>← Back to alerts</Link><label className="text-sm font-medium flex items-center gap-2">Incident status <select aria-label="Incident status" value={investigation.status} disabled={saving} onChange={(e) => updateStatus(e.target.value)} className="input-field w-auto py-2"><option>Open</option><option>In Progress</option><option>Resolved</option></select></label></div>
    <div className="grid lg:grid-cols-3 gap-4 mb-4"><section className="card p-5"><h2 className="font-semibold">Employee profile</h2>{investigation.profile ? <div className="mt-3 space-y-2 text-sm"><p><span style={{color:"var(--color-text-muted)"}}>Department: </span>{investigation.profile.department}</p><p><span style={{color:"var(--color-text-muted)"}}>Designation: </span>{investigation.profile.designation}</p><p><span style={{color:"var(--color-text-muted)"}}>Manager: </span>{investigation.profile.manager}</p><p className="text-xs pt-1" style={{color:"var(--color-text-faint)"}}>Synthetic/demo profile data</p></div> : <p className="mt-3 text-sm" style={{color:"var(--color-text-muted)"}}>No profile context is available.</p>}</section><section className="card p-5"><h2 className="font-semibold">User risk history</h2>{currentRisk ? <div className="mt-4 flex items-center justify-between"><div><p className="text-3xl font-bold tabular-nums">{currentRisk.risk_score.toFixed(1)}<span className="text-base font-medium"> / 100</span></p><p className="text-xs mt-1" style={{color:"var(--color-text-muted)"}}>Computed {new Date(currentRisk.computed_at).toLocaleString()}</p></div><RiskCategoryBadge level={currentRisk.risk_level} label={currentRisk.risk_category} /></div> : <p className="mt-3 text-sm" style={{color:"var(--color-text-muted)"}}>No risk score has been computed for this user yet.</p>}{investigation.risk_history_note && <p className="mt-4 text-sm" style={{color:"var(--color-text-muted)"}}>{investigation.risk_history_note}</p>}</section><section className="card p-5"><h2 className="font-semibold">Event correlation</h2><p className="mt-3 text-sm" style={{color: investigation.correlation.correlated ? "var(--sev-high)" : "var(--color-text-muted)"}}>{investigation.correlation.summary}</p>{investigation.correlation.indicators.length > 0 && <ul className="mt-3 text-sm list-disc pl-5" style={{color:"var(--color-text-muted)"}}>{investigation.correlation.indicators.map((indicator) => <li key={indicator}>{indicator}</li>)}</ul>}</section></div>
    <section className="card overflow-hidden"><div className="p-5 border-b" style={{borderColor:"var(--color-border)"}}><h2 className="font-semibold">Activity timeline</h2><p className="text-sm mt-1" style={{color:"var(--color-text-muted)"}}>Real logon and removable-device activity, newest first.</p></div>{investigation.timeline.length ? <ol className="divide-y" style={{borderColor:"var(--color-border)"}}>{investigation.timeline.map((event) => <li key={event.id} className="p-4 flex gap-4"><div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{background:"var(--color-primary)"}} /><div className="min-w-0"><p className="font-medium text-sm">{eventLabels[event.event_type] || event.event_type}</p><p className="text-sm mt-1" style={{color:"var(--color-text-muted)"}}>{new Date(event.timestamp).toLocaleString()} · {event.pc || "PC unavailable"}</p></div></li>)}</ol> : <p className="p-5 text-sm" style={{color:"var(--color-text-muted)"}}>No ingested activity was found for this user.</p>}</section>
  </Layout>;
}
