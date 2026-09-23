const riskMeta = {
  low: { color: "var(--sev-low)", bg: "var(--sev-low-bg)" },
  medium: { color: "var(--sev-medium)", bg: "var(--sev-medium-bg)" },
  high: { color: "var(--sev-high)", bg: "var(--sev-high-bg)" },
  critical: { color: "var(--sev-critical)", bg: "var(--sev-critical-bg)" },
};

export default function ThreatsPanel({ threats }) {
  if (!threats || threats.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>No escalated threats yet</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          Cases you escalate from the anomaly table will show up here for tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="card divide-y" style={{ borderColor: "var(--color-border)" }}>
      {threats.map((t) => {
        const meta = riskMeta[t.risk_level] || riskMeta.low;
        return (
          <div key={t.id} className="px-4 py-3 flex items-start justify-between gap-3" style={{ borderColor: "var(--color-border)" }}>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>{t.title}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>{t.employee_id}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: meta.bg, color: meta.color }}
              >
                <span className="severity-dot" style={{ background: meta.color }} />
                {t.risk_level}
              </span>
              <span className="text-xs capitalize" style={{ color: "var(--color-text-faint)" }}>{t.status}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}