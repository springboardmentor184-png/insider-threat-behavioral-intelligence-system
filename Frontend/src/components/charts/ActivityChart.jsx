import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function ActivityChart({ employees }) {

  const departmentCount = {};

  employees.forEach((emp) => {

    if (departmentCount[emp.department]) {
      departmentCount[emp.department]++;
    } else {
      departmentCount[emp.department] = 1;
    }

  });

  const data = Object.keys(departmentCount).map((department) => ({
    department,
    employees: departmentCount[department],
  }));

  return (
    <div className="chart-card">

      <h4>Employees by Department</h4>

      <ResponsiveContainer width="100%" height={320}>

        <BarChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="department" />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="employees"
            fill="#2563EB"
            radius={[6, 6, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}

export default ActivityChart;