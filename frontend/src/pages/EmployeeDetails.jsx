

// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";

// import Sidebar from "../components/Sidebar";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

// export default function EmployeeDetails() {
//   const { user } = useParams();

// const decodedUser = decodeURIComponent(user);

//   const [employee, setEmployee] = useState(null);

//   useEffect(() => {
//     fetch("/risk_scores.csv")
//       .then((res) => res.text())
//       .then((text) => {
//         const rows = text.trim().split("\n");
//         const headers = rows[0].split(",");

//         const data = rows.slice(1).map((row) => {
//           const values = row.split(",");
//           const obj = {};

//           headers.forEach((h, i) => {
//             obj[h] = values[i];
//           });

//           return obj;
//         });

//         const emp = data.find((e) => e.user === user);

//         setEmployee(emp);
//       });
//   }, [user]);

//   if (!employee)
//     return (
//       <div className="p-10 text-xl">
//         Loading Employee...
//       </div>
//     );

//   return (
//     <div className="flex bg-slate-100 min-h-screen">
//       <Sidebar />

//       <div className="flex-1">
//         <Navbar />

//         <div className="p-8">

//           <h1 className="text-3xl font-bold mb-8">
//             Employee Investigation
//           </h1>

//           {/* User Information */}

//           <div className="bg-white rounded-xl shadow p-6 mb-6">

//             <h2 className="text-xl font-bold mb-4">
//               User Information
//             </h2>

//             <div className="grid grid-cols-2 gap-5">

//               <div>
//                 <strong>User ID:</strong>
//                 <br />
//                 {employee.user}
//               </div>

//               <div>
//                 <strong>Risk Score:</strong>
//                 <br />
//                 {employee.risk_score}
//               </div>

//               <div>
//                 <strong>Risk Level:</strong>
//                 <br />
//                 {employee.risk_level}
//               </div>

//               <div>
//                 <strong>Anomaly:</strong>
//                 <br />
//                 {employee.anomaly}
//               </div>

//             </div>

//           </div>

//           {/* Reasons */}

//           <div className="bg-white rounded-xl shadow p-6 mb-6">

//             <h2 className="text-xl font-bold mb-4">
//               Risk Reasons
//             </h2>

//             <ul className="list-disc ml-6">

//               {[
//                 employee.reason_1,
//                 employee.reason_2,
//                 employee.reason_3,
//                 employee.reason_4,
//                 employee.reason_5,
//               ]
//                 .filter(
//                   (r) =>
//                     r &&
//                     r !== "" &&
//                     r !== "nan"
//                 )
//                 .map((r, i) => (
//                   <li key={i}>{r}</li>
//                 ))}

//             </ul>

//           </div>

//           {/* Behaviour */}

//           <div className="bg-white rounded-xl shadow p-6">

//             <h2 className="text-xl font-bold mb-4">
//               Behaviour Summary
//             </h2>

//             <div className="grid grid-cols-2 gap-5">

//               <div>
//                 <strong>Average Login:</strong>
//                 <br />
//                 {employee.avg_login_hour}
//               </div>

//               <div>
//                 <strong>Average Logout:</strong>
//                 <br />
//                 {employee.avg_logout_hour}
//               </div>

//               <div>
//                 <strong>Session Hours:</strong>
//                 <br />
//                 {employee.avg_session_hours}
//               </div>

//               <div>
//                 <strong>Unique PCs:</strong>
//                 <br />
//                 {employee.unique_pcs}
//               </div>

//               <div>
//                 <strong>Device Switches:</strong>
//                 <br />
//                 {employee.device_switches}
//               </div>

//               <div>
//                 <strong>Off-hour %:</strong>
//                 <br />
//                 {employee.offhour_percentage}
//               </div>

//               <div>
//                 <strong>Night Logins:</strong>
//                 <br />
//                 {employee.night_login_count}
//               </div>

//               <div>
//                 <strong>Working Days:</strong>
//                 <br />
//                 {employee.working_days}
//               </div>

//             </div>

//           </div>

//           <Footer />

//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function EmployeeDetails() {
  const { user } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/risk_scores.csv")
      .then((res) => res.text())
      .then((text) => {
        const rows = text.trim().split("\n");

        const headers = rows[0].split(",");

        const data = rows.slice(1).map((row) => {
          const values = row.split(",");

          const obj = {};

          headers.forEach((header, index) => {
            obj[header] = values[index];
          });

          return obj;
        });

        const emp = data.find((e) => e.user === decodeURIComponent(user));

        setEmployee(emp);
        setLoading(false);
      });
  }, [user]);

  if (loading)
    return (
      <div className="p-10 text-xl font-semibold">
        Loading...
      </div>
    );

  if (!employee)
    return (
      <div className="p-10 text-xl font-semibold">
        Employee Not Found
      </div>
    );

  const badgeColor = (risk) => {
    switch (risk) {
      case "Critical":
        return "bg-purple-600";
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const formatHour = (hour) => {
  if (!hour) return "-";

  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);

  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;

  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <div className="p-8">

          <h1 className="text-3xl font-bold mb-8">
            Employee Investigation
          </h1>

          {/* Top Section */}

          <div className="grid grid-cols-2 gap-6 mb-8">

            {/* User Information */}

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h2 className="text-2xl font-bold mb-5">
                👤 User Information
              </h2>

              <div className="space-y-3">

                <p>
                  <strong>User ID:</strong> {employee.user}
                </p>

                <p>
                  <strong>Risk Level:</strong>

                  <span
                    className={`ml-3 px-3 py-1 rounded-lg text-white ${badgeColor(
                      employee.risk_level
                    )}`}
                  >
                    {employee.risk_level}
                  </span>

                </p>

                <p>
                  <strong>Anomaly:</strong>{" "}

                  <span
                    className={
                      employee.anomaly === "Anomaly"
                        ? "text-red-600 font-semibold"
                        : "text-green-600 font-semibold"
                    }
                  >
                    {employee.anomaly}
                  </span>

                </p>

              </div>

            </div>

            {/* Risk Overview */}

            <div className="bg-white rounded-2xl shadow-lg p-6">

              <h2 className="text-2xl font-bold mb-5">
                🚨 Risk Overview
              </h2>

              <h1 className="text-6xl font-bold text-red-600">
                {employee.risk_score}
              </h1>

              <p className="text-gray-500 mb-4">
                Risk Score
              </p>

              <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">

                <div
                  className={`${badgeColor(employee.risk_level)} h-full`}
                  style={{
                    width: `${employee.risk_score}%`,
                  }}
                ></div>

              </div>

              <p className="mt-4 font-bold text-xl">
                {employee.risk_level}
              </p>

            </div>

          </div>

          {/* Risk Reasons */}

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">

            <h2 className="text-2xl font-bold mb-5">
              ⚠ Risk Reasons
            </h2>

            <ul className="list-disc ml-8 space-y-2">

              {[
                employee.reason_1,
                employee.reason_2,
                employee.reason_3,
                employee.reason_4,
                employee.reason_5,
              ]
                .filter(
                  (r) =>
                    r &&
                    r !== "" &&
                    r !== "nan"
                )
                .map((r, i) => (
                  <li key={i}>{r}</li>
                ))}

            </ul>

          </div>

          {/* Behaviour Cards */}

          <div className="grid grid-cols-4 gap-5">

            <Card title="Average Login" value={formatHour(employee.avg_login_hour)} />

            <Card title="Average Logout" value={formatHour(employee.avg_logout_hour)} />

            <Card title="Session Hours" value={formatHour(employee.avg_session_hours)} />

            <Card title="Working Days" value={employee.working_days} />

            <Card title="Unique PCs" value={employee.unique_pcs} />

            <Card title="Device Switches" value={employee.device_switches} />

            <Card title="Night Logins" value={employee.night_login_count} />

            <Card
              title="Off-hour %"
              value={`${Number(employee.offhour_percentage).toFixed(1)}%`}
            />

          </div>

          {/* Timeline */}

          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">

            <h2 className="text-2xl font-bold mb-6">
              📅 Investigation Timeline
            </h2>

            <div className="border-l-4 border-cyan-500 ml-3">

              <div className="ml-6 mb-6">

                <h3 className="font-bold">
                  First Login
                </h3>

                <p className="text-gray-600">
                  {employee.first_login}
                </p>

              </div>

              <div className="ml-6">

                <h3 className="font-bold">
                  Last Login
                </h3>

                <p className="text-gray-600">
                  {employee.last_login}
                </p>

              </div>

            </div>

          </div>

          <Footer />

        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5">

      <p className="text-gray-500">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>

    </div>
  );
}