// const employees = [
//   {
//     name: "John Doe",
//     department: "Finance",
//     risk: "Low",
//     status: "Active",
//   },
//   {
//     name: "Alice Smith",
//     department: "HR",
//     risk: "Medium",
//     status: "Monitoring",
//   },
//   {
//     name: "Robert Brown",
//     department: "IT",
//     risk: "High",
//     status: "Investigating",
//   },
//   {
//     name: "Emma Wilson",
//     department: "Security",
//     risk: "Low",
//     status: "Active",
//   },
// ];

// export default function EmployeeTable() {
//   return (
//     <div className="bg-white rounded-xl shadow p-5">
//       <h2 className="text-xl font-bold mb-4">Employees</h2>

//       <table className="w-full">
//         <thead>
//           <tr className="border-b">
//             <th className="text-left p-2">Name</th>
//             <th className="text-left p-2">Department</th>
//             <th className="text-left p-2">Risk</th>
//           </tr>
//         </thead>

//         <tbody>
//           {employees.map((emp) => (
//             <tr key={emp.id} className="border-b">
//               <td className="p-2">{emp.name}</td>
//               <td className="p-2">{emp.department}</td>
//               <td className="p-2">
//                 <span
//                   className={`px-2 py-1 rounded text-white
//                   ${
//                     emp.risk === "Low"
//                       ? "bg-green-500"
//                       : emp.risk === "Medium"
//                       ? "bg-yellow-500"
//                       : "bg-red-500"
//                   }`}
//                 >
//                   {emp.risk}
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

export default function EmployeeTable({ employees }) {

    return (

        <div className="bg-white rounded-xl shadow p-5">

            <h2 className="text-xl font-bold mb-4">
                Top Risky Employees
            </h2>

            <table className="w-full">

                <thead>

                    <tr className="border-b">

                        <th className="text-left p-2">
                            User
                        </th>

                        <th className="text-left p-2">
                            Risk Score
                        </th>

                        <th className="text-left p-2">
                            Risk Level
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {employees.map((emp, index) => (

                        <tr key={index} className="border-b">

                            <td className="p-2">
                                {emp.user}
                            </td>

                            <td className="p-2 font-semibold">
                                {emp.risk_score}
                            </td>

                            <td className="p-2">

                                <span
                                    className={`px-2 py-1 rounded text-white
                                    ${
                                        emp.risk_level === "Low"
                                            ? "bg-green-500"
                                            : emp.risk_level === "Medium"
                                            ? "bg-yellow-500"
                                            : emp.risk_level === "High"
                                            ? "bg-red-500"
                                            : "bg-purple-600"
                                    }`}
                                >

                                    {emp.risk_level}

                                </span>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    );

}