import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import Layout from "../components/Layout";
import TrendChart from "../components/TrendChart";

export default function ActivityPage() {
  const [activity, setActivity] = useState([]);
  useEffect(() => { apiFetch("/analytics/activity-summary?days=14").then(setActivity).catch(console.error); }, []);
  return <Layout title="User activity" subtitle="Daily aggregate activity from company-managed systems">
    <div className="card p-5"><h2 className="text-sm font-semibold mb-4">Activity trend</h2><TrendChart data={activity.map((d) => ({ date: d.date, count: d.events }))} /></div>
    <div className="card p-5 mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left" style={{color:"var(--color-text-muted)"}}><th>Date</th><th>Events</th><th>Logons</th><th>Device connections</th><th>After hours</th></tr></thead><tbody>{activity.map((d) => <tr key={d.date} className="border-t" style={{borderColor:"var(--color-border)"}}><td className="py-3">{d.date}</td><td>{d.events}</td><td>{d.logons}</td><td>{d.device_connects}</td><td>{d.after_hours}</td></tr>)}</tbody></table></div>
  </Layout>;
}
