export default function TopRiskyEmployees({ employees }) {
  if (!employees || employees.length === 0) {
    return <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>No data available.</p>;
  }

  const max = Math.max(...employees.map((e) => e.anomaly_count));

  return (
    <div className="space-y-3">
      {employees.map((e) => (
        <div key={e.employee_id}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium" style={{ color: "var(--color-text)" }}>{e.employee_id}</span>
            <span style={{ color: "var(--color-text-muted)" }}>{e.anomaly_count}</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "var(--color-surface-muted)" }}>
            <div
              className="h-1.5 rounded-full"
              style={{ width: `${(e.anomaly_count / max) * 100}%`, background: "var(--color-primary)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}