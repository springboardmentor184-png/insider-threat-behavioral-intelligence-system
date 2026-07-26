import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No trend data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="#E3E6EC" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9AA4B8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9AA4B8" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E3E6EC", fontSize: 12 }} />
        <Line type="monotone" dataKey="count" stroke="#3E5C8A" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}