import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import Layout from "../../components/Layout";
import UserManagementTable from "../../components/UserManagementTable";

export default function AdminDashboard() {
  const [baselines, setBaselines] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [baselineData, userData] = await Promise.all([
          apiFetch("/analytics/baselines"),
          apiFetch("/analytics/admin/users"),
        ]);
        setBaselines(baselineData);
        setUsers(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalLogonEvents = baselines.reduce((sum, b) => sum + (b.total_logon_events || 0), 0);
  const totalDeviceEvents = baselines.reduce((sum, b) => sum + (b.total_device_events || 0), 0);

  return (
    <Layout title="Platform overview" subtitle="System health, data coverage, and console user management">
      {loading ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="card p-4">
              <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Employees profiled</p>
              <p className="text-2xl font-display font-bold mt-1" style={{ color: "var(--color-text)" }}>{baselines.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Console users</p>
              <p className="text-2xl font-display font-bold mt-1" style={{ color: "var(--color-text)" }}>{users.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Logon events ingested</p>
              <p className="text-2xl font-display font-bold mt-1" style={{ color: "var(--color-text)" }}>{totalLogonEvents.toLocaleString()}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Device events ingested</p>
              <p className="text-2xl font-display font-bold mt-1" style={{ color: "var(--color-text)" }}>{totalDeviceEvents.toLocaleString()}</p>
            </div>
          </div>

          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Console users</h2>
          <UserManagementTable users={users} />
        </>
      )}
    </Layout>
  );
}