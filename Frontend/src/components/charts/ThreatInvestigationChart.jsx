import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";


// =====================================================
// Threat & Investigation Analytics
// =====================================================

function ThreatInvestigationChart({ analytics }) {

  // -----------------------------------------------------
  // Safety check
  // -----------------------------------------------------

  if (!analytics) {
    return (
      <div className="chart-card">

        <h4>
          Threat & Investigation Summary
        </h4>

        <div className="text-center text-muted py-5">
          Loading security analytics...
        </div>

      </div>
    );
  }


  // =====================================================
  // Chart Data
  // =====================================================

  const data = [
    {
      category: "Critical",
      alerts: analytics.critical_alerts || 0,
      investigations:
        analytics.critical_investigations || 0,
    },

    {
      category: "High",
      alerts: analytics.high_alerts || 0,
      investigations:
        analytics.high_investigations || 0,
    },

    {
      category: "Medium",
      alerts: analytics.medium_alerts || 0,
      investigations: 0,
    },

    {
      category: "Low",
      alerts: analytics.low_alerts || 0,
      investigations: 0,
    },

    {
      category: "Active",
      alerts: analytics.open_alerts || 0,
      investigations:
        analytics.active_investigations || 0,
    },

    {
      category: "Resolved",
      alerts: analytics.resolved_alerts || 0,
      investigations:
        analytics.resolved_investigations || 0,
    },
  ];


  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="chart-card">

      <h4>
        Threat & Investigation Summary
      </h4>

      <p className="text-muted mb-3">
        Real-time overview of threat alerts and
        investigation activity.
      </p>


      <ResponsiveContainer
        width="100%"
        height={340}
      >

        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />


          <XAxis
            dataKey="category"
          />


          <YAxis
            allowDecimals={false}
          />


          <Tooltip />


          <Legend />


          <Bar
            dataKey="alerts"
            name="Threat Alerts"
            fill="#EF4444"
            radius={[6, 6, 0, 0]}
          />


          <Bar
            dataKey="investigations"
            name="Investigations"
            fill="#2563EB"
            radius={[6, 6, 0, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}


export default ThreatInvestigationChart;