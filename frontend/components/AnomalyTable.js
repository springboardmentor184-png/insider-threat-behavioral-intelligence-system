import { Eye, ArrowUpCircle } from "lucide-react";

const severityMeta = {
  low: { label: "Low", color: "var(--sev-low)", bg: "var(--sev-low-bg)" },
  medium: { label: "Medium", color: "var(--sev-medium)", bg: "var(--sev-medium-bg)" },
  high: { label: "High", color: "var(--sev-high)", bg: "var(--sev-high-bg)" },
  critical: { label: "Critical", color: "var(--sev-critical)", bg: "var(--sev-critical-bg)" },
};

export default function AnomalyTable({ anomalies, onEscalate, onStatusChange, canEscalate }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>No anomalies to show</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          New behavioral deviations will appear here as they're detected.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ background: "var(--color-surface-muted)" }}>
              <th className="text-left font-semibold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Employee</th>
              <th className="text-left font-semibold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Type</th>
              <th className="text-left font-semibold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Severity</th>
              <th className="text-left font-semibold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Description</th>
              <th className="text-left font-semibold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Detected</th>
              <th className="text-left font-semibold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Status</th>
              {canEscalate && <th className="text-left font-semibold px-4 py-3" style={{ color: "var(--color-text-muted)" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {anomalies.map((a) => {
              const meta = severityMeta[a.severity] || severityMeta.low;
              return (
                <tr
                  key={a.id}
                  className="border-t transition-colors"
                  style={{ borderColor: "var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-muted)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text)" }}>{a.employee_id}</td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>{a.anomaly_type.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <span className="severity-dot" style={{ background: meta.color }} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={a.description} style={{ color: "var(--color-text-muted)" }}>
                    {a.description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                    {a.event_timestamp ? new Date(a.event_timestamp).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 capitalize" style={{ color: "var(--color-text-muted)" }}>{a.status}</td>
                  {canEscalate && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onStatusChange(a.id, "reviewed")}
                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md"
                          style={{ background: "var(--color-surface-muted)", color: "var(--color-text)" }}
                        >
                          <Eye size={13} /> Review
                        </button>
                        <button
                          onClick={() => onEscalate(a.id)}
                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md"
                          style={{ background: "var(--sev-critical-bg)", color: "var(--sev-critical)" }}
                        >
                          <ArrowUpCircle size={13} /> Escalate
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}