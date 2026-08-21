import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";


// =====================================================
// Department Risk Analytics
// =====================================================

function DepartmentRiskChart({ employees }) {

  // -----------------------------------------------------
  // Department Risk Calculation
  // -----------------------------------------------------

  const departmentData = {};


  employees.forEach((employee) => {

    const department =
      employee.department || "Unknown";

    const riskScore =
      Number(employee.risk_score || 0);


    if (!departmentData[department]) {

      departmentData[department] = {
        totalEmployees: 0,
        totalRisk: 0,
      };

    }


    departmentData[department].totalEmployees += 1;

    departmentData[department].totalRisk += riskScore;

  });


  // -----------------------------------------------------
  // Convert Department Data into Chart Data
  // -----------------------------------------------------

  const data = Object.keys(departmentData).map(
    (department) => {

      const departmentInfo =
        departmentData[department];


      const averageRisk =
        departmentInfo.totalEmployees > 0
          ? Math.round(
              departmentInfo.totalRisk /
              departmentInfo.totalEmployees
            )
          : 0;


      return {
        department,
        employees:
          departmentInfo.totalEmployees,
        averageRisk,
      };

    }
  );


  // -----------------------------------------------------
  // Sort Highest Risk Department First
  // -----------------------------------------------------

  data.sort(
    (a, b) =>
      b.averageRisk - a.averageRisk
  );


  // =====================================================
  // Render
  // =====================================================

  return (

    <div className="chart-card">


      <h4>
        Department Risk Analytics
      </h4>


      <p className="text-muted mb-3">

        Average employee risk score
        across departments.

      </p>


      <ResponsiveContainer
        width="100%"
        height={340}
      >

        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 10,
          }}
        >


          <CartesianGrid
            strokeDasharray="3 3"
          />


          <XAxis
            type="number"
            domain={[0, 100]}
            allowDecimals={false}
          />


          <YAxis
            type="category"
            dataKey="department"
            width={110}
          />


          <Tooltip />


          <Legend />


          <Bar
            dataKey="averageRisk"
            name="Average Risk Score"
            fill="#7C3AED"
            radius={[
              0,
              6,
              6,
              0,
            ]}
          />


        </BarChart>

      </ResponsiveContainer>


    </div>

  );

}


export default DepartmentRiskChart;