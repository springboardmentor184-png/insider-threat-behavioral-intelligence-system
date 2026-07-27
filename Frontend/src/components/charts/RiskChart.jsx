import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#22C55E",
  "#F59E0B",
  "#EF4444",
];

function RiskChart({ employees }) {

  const low = employees.filter(
    (emp) => emp.risk_score <= 20
  ).length;

  const medium = employees.filter(
    (emp) => emp.risk_score > 20 && emp.risk_score <= 60
  ).length;

  const high = employees.filter(
    (emp) => emp.risk_score > 60
  ).length;

  const data = [
    {
      name: "Low Risk",
      value: low,
    },
    {
      name: "Medium Risk",
      value: medium,
    },
    {
      name: "High Risk",
      value: high,
    },
  ];

  return (
    <div className="chart-card">

      <h4>Risk Distribution</h4>

      <ResponsiveContainer width="100%" height={320}>

        <PieChart>

          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >

            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
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