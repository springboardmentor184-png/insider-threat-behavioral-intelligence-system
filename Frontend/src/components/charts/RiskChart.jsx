import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Low Risk", value: 45 },
  { name: "Medium Risk", value: 25 },
  { name: "High Risk", value: 20 },
  { name: "Critical", value: 10 }
];

const COLORS = [
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#6B7280"  // Gray
];

function RiskChart() {
  return (
    <div className="chart-card">
      <h4>Risk Distribution</h4>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>

          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            dataKey="value"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskChart;