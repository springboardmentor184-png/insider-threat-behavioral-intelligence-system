import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


// =====================================================
// Risk Chart Colors
// =====================================================

const COLORS = [
  "#22C55E", // Low
  "#F59E0B", // Medium
  "#EF4444", // High
  "#111827", // Critical
];


// =====================================================
// Risk Distribution Chart
// =====================================================

function RiskChart({ employees }) {

  // -----------------------------------------------------
  // Low Risk: 0 - 39
  // -----------------------------------------------------

  const low = employees.filter(
    (emp) =>
      Number(emp.risk_score || 0) >= 0 &&
      Number(emp.risk_score || 0) <= 39
  ).length;


  // -----------------------------------------------------
  // Medium Risk: 40 - 69
  // -----------------------------------------------------

  const medium = employees.filter(
    (emp) =>
      Number(emp.risk_score || 0) >= 40 &&
      Number(emp.risk_score || 0) <= 69
  ).length;


  // -----------------------------------------------------
  // High Risk: 70 - 89
  // -----------------------------------------------------

  const high = employees.filter(
    (emp) =>
      Number(emp.risk_score || 0) >= 70 &&
      Number(emp.risk_score || 0) <= 89
  ).length;


  // -----------------------------------------------------
  // Critical Risk: 90 - 100
  // -----------------------------------------------------

  const critical = employees.filter(
    (emp) =>
      Number(emp.risk_score || 0) >= 90 &&
      Number(emp.risk_score || 0) <= 100
  ).length;


  // =====================================================
  // Chart Data
  // =====================================================

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
    {
      name: "Critical Risk",
      value: critical,
    },
  ];


  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="chart-card">

      <h4>
        Risk Distribution
      </h4>

      <ResponsiveContainer
        width="100%"
        height={320}
      >

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
                key={`risk-cell-${index}`}
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