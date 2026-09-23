const categoryStyle = {
  low: { color: "var(--sev-low)", background: "var(--sev-low-bg)" },
  medium: { color: "var(--sev-medium)", background: "var(--sev-medium-bg)" },
  high: { color: "var(--sev-high)", background: "var(--sev-high-bg)" },
  critical: { color: "var(--sev-critical)", background: "var(--sev-critical-bg)" },
};

export default function RiskCategoryBadge({ level, label }) {
  const normalized = level || "low";
  const style = categoryStyle[normalized] || categoryStyle.low;
  return <span className="text-xs font-semibold px-2 py-1 rounded-full capitalize" style={style}>{label || normalized}</span>;
}
