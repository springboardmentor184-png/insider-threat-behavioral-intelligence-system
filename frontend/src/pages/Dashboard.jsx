// import {
//   Users,
//   ShieldAlert,
//   Activity,
//   Bell
// } from "lucide-react";
// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";
// import StatCard from "../components/StatCard";
// import EmployeeTable from "../components/EmployeeTable";
// import RiskChart from "../components/RiskChart";
// import Footer from "../components/Footer";

// export default function Dashboard() {
//   return (
//     <div className="flex bg-gray-100 min-h-screen">
//       <Sidebar />

//       <div className="flex-1">
//         <Navbar />

//         <div className="p-6">

//           <div className="grid grid-cols-4 gap-5 mb-6">
//            <StatCard
//   title="Employees"
//   value="1,248"
//   color="#06B6D4"
//   icon={<Users size={28} />}
// />

// <StatCard
//   title="Threat Alerts"
//   value="18"
//   color="#EF4444"
//   icon={<ShieldAlert size={28} />}
// />

// <StatCard
//   title="Risk Score"
//   value="92%"
//   color="#22C55E"
//   icon={<Activity size={28} />}
// />

// <StatCard
//   title="Active Sessions"
//   value="384"
//   color="#F59E0B"
//   icon={<Bell size={28} />}
// />
//           </div>

//           <div className="grid grid-cols-2 gap-6">
//             <EmployeeTable />
//             <RiskChart />
//           </div>
// <Footer />
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import {
  Users,
  ShieldAlert,
  Activity,
  Bell
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import EmployeeTable from "../components/EmployeeTable";
import RiskChart from "../components/RiskChart";
import Footer from "../components/Footer";

export default function Dashboard() {

  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetch("/dashboard_data.json")
      .then((res) => res.json())
      .then((data) => {
        setDashboardData(data);
      })
      .catch((err) => console.error(err));
  }, []);

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading Dashboard...
      </div>
    );
  }

  const summary = dashboardData.summary;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-6">

          <div className="grid grid-cols-4 gap-5 mb-6">

            <StatCard
              title="Employees"
              value={summary.total_users}
              color="#06B6D4"
              icon={<Users size={28} />}
            />

            <StatCard
              title="Critical Users"
              value={summary.critical_users}
              color="#EF4444"
              icon={<ShieldAlert size={28} />}
            />

            <StatCard
              title="Average Risk"
              value={summary.average_risk_score}
              color="#22C55E"
              icon={<Activity size={28} />}
            />

            <StatCard
              title="Detected Anomalies"
              value={summary.detected_anomalies}
              color="#F59E0B"
              icon={<Bell size={28} />}
            />

          </div>
<div className="bg-white rounded-2xl shadow p-6 mb-6">

  <h2 className="text-2xl font-bold mb-4">
    Security Overview
  </h2>

  <div className="grid grid-cols-4 gap-4">

    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
      <p className="text-sm text-gray-500">Critical Threats</p>
      <h3 className="text-3xl font-bold text-red-600">
        {summary.critical_users}
      </h3>
    </div>

    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
      <p className="text-sm text-gray-500">Detected Anomalies</p>
      <h3 className="text-3xl font-bold text-yellow-600">
        {summary.detected_anomalies}
      </h3>
    </div>

    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
      <p className="text-sm text-gray-500">Average Risk Score</p>
      <h3 className="text-3xl font-bold text-green-600">
        {summary.average_risk_score}
      </h3>
    </div>

    <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
      <p className="text-sm text-gray-500">Security Status</p>
      <h3 className="text-lg font-bold text-cyan-700">
        Monitoring Active
      </h3>
    </div>

  </div>

</div>
          <div className="grid grid-cols-2 gap-6">

            {/* <EmployeeTable users={dashboardData.top_risky_users} /> */}
            <EmployeeTable employees={dashboardData.top_risky_users}/>

            <RiskChart data={dashboardData.risk_distribution} />

          </div>
          <div className="bg-white rounded-2xl shadow p-6 mt-6">

  <h2 className="text-xl font-bold mb-4">
    Recent Security Alerts
  </h2>

  <div className="space-y-3">

    <div className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
      High-risk employee detected with abnormal login behavior.
    </div>

    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded">
      Large file download activity identified.
    </div>

    <div className="border-l-4 border-cyan-500 bg-cyan-50 p-3 rounded">
      USB device connection recorded for monitoring.
    </div>

  </div>

</div>

          <Footer />

        </div>
      </div>
    </div>
  );
}