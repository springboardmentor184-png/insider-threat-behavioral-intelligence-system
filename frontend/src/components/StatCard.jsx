// // import { TrendingUp } from "lucide-react";
// import { Users, ShieldAlert, Activity, Bell } from "lucide-react";

// export default function StatCard({ title, value, color }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center hover:shadow-lg transition">

//       <div>

//         <p className="text-gray-500">
//           {title}
//         </p>

//         <h1 className="text-4xl font-bold mt-2">
//           {value}
//         </h1>

//       </div>

//       <div
//         className="w-14 h-14 rounded-full flex items-center justify-center text-white"
//         style={{ backgroundColor: color }}
//       >
//         <TrendingUp size={28}/>
//       </div>

//     </div>
//   );
// }

export default function StatCard({ title, value, color, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex justify-between items-center hover:shadow-lg transition">

      <div>
        <p className="text-gray-500">{title}</p>

        <h1 className="text-4xl font-bold mt-2">
          {value}
        </h1>
      </div>

      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>

    </div>
  );
}