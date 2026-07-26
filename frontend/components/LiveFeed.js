import { useEffect, useRef, useState } from "react";

const severityMeta = {
  low: { color: "var(--sev-low)" },
  medium: { color: "var(--sev-medium)" },
  high: { color: "var(--sev-high)" },
  critical: { color: "var(--sev-critical)" },
};

export default function LiveFeed({ anomalies, onRefresh, intervalMs = 15000 }) {
  const [pulse, setPulse] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      setPulse(true);
      await onRefresh();
      setTimeout(() => setPulse(false), 600);
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [onRefresh, intervalMs]);

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: "#3DA35D", boxShadow: pulse ? "0 0 0 4px rgba(61,163,93,0.15)" : "none", transition: "box-shadow 0.3s ease" }}
        />
        <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
          Live · auto-refreshes every {intervalMs / 1000}s
        </p>
      </div>

      {(!anomalies || anomalies.length === 0) ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No recent events.</p>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto">
          {anomalies.map((a) => {
            const meta = severityMeta[a.severity] || severityMeta.low;
            return (
              <div key={a.id} className="flex items-start gap-3 pb-3 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                <span className="severity-dot mt-1.5" style={{ background: meta.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    {a.employee_id} <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>— {a.anomaly_type.replace(/_/g, " ")}</span>
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>{a.description}</p>
                </div>
                <span className="text-xs whitespace-nowrap" style={{ color: "var(--color-text-faint)" }}>
                  {a.event_timestamp ? new Date(a.event_timestamp).toLocaleTimeString() : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}