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

          <div className="grid grid-cols-2 gap-6">

            {/* <EmployeeTable users={dashboardData.top_risky_users} /> */}
            <EmployeeTable employees={dashboardData.top_risky_users}/>

            <RiskChart data={dashboardData.risk_distribution} />

          </div>

          <Footer />

        </div>
      </div>
    </div>
  );
}