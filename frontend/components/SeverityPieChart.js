import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = { critical: "#A8433D", high: "#B5622A", medium: "#A67C1E", low: "#6B7688" };

export default function SeverityPieChart({ summary }) {
  if (!summary) return null;

  const data = ["critical", "high", "medium", "low"]
    .map((level) => ({ name: level, value: summary.by_severity[level] ?? 0 }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No open anomalies.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E3E6EC", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}