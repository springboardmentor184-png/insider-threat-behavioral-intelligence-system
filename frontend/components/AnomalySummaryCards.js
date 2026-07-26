import { ShieldAlert, Flame, AlertTriangle, AlertCircle, Info } from "lucide-react";

const severityMeta = {
  critical: { label: "Critical", color: "var(--sev-critical)", bg: "var(--sev-critical-bg)", Icon: Flame },
  high: { label: "High", color: "var(--sev-high)", bg: "var(--sev-high-bg)", Icon: AlertTriangle },
  medium: { label: "Medium", color: "var(--sev-medium)", bg: "var(--sev-medium-bg)", Icon: AlertCircle },
  low: { label: "Low", color: "var(--sev-low)", bg: "var(--sev-low-bg)", Icon: Info },
};

export default function AnomalySummaryCards({ summary }) {
  if (!summary) return null;
  const levels = ["critical", "high", "medium", "low"];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
      <div className="card p-4 flex items-center gap-3">
        <div className="stat-icon" style={{ background: "var(--color-primary-soft)" }}>
          <ShieldAlert size={18} color="var(--color-primary)" strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Open cases</p>
          <p className="text-xl font-bold tabular-nums" style={{ color: "var(--color-text)" }}>{summary.total_open}</p>
        </div>
      </div>
      {levels.map((level) => {
        const meta = severityMeta[level];
        const Icon = meta.Icon;
        return (
          <div key={level} className="card p-4 flex items-center gap-3">
            <div className="stat-icon" style={{ background: meta.bg }}>
              <Icon size={18} color={meta.color} strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{meta.label}</p>
              <p className="text-xl font-bold tabular-nums" style={{ color: "var(--color-text)" }}>
                {summary.by_severity[level] ?? 0}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}