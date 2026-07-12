import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { day: "Mon", activity: 40 },
  { day: "Tue", activity: 55 },
  { day: "Wed", activity: 68 },
  { day: "Thu", activity: 90 },
  { day: "Fri", activity: 78 },
  { day: "Sat", activity: 35 },
  { day: "Sun", activity: 50 }
];

function ActivityChart() {
  return (
    <div className="chart-card">

      <h4>Employee Activity</h4>

      <ResponsiveContainer width="100%" height={300}>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="activity"
            stroke="#2563eb"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}

export default ActivityChart;