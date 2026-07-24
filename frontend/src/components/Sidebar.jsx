
// import {
//   LayoutDashboard,
//   Users,
//   Activity,
//   ShieldAlert,
//   FileText,
//   Settings,
// } from "lucide-react";

// import { NavLink } from "react-router-dom";

// const menu = [
//   {
//     name: "Dashboard",
//     icon: <LayoutDashboard size={20} />,
//     path: "/dashboard",
//   },
//   {
//     name: "Employees",
//     icon: <Users size={20} />,
//     path: "/employees",
//   },
//   {
//     name: "Activity Logs",
//     icon: <Activity size={20} />,
//     path: "/activitylogs",
//   },
//   {
//     name: "Threats",
//     icon: <ShieldAlert size={20} />,
//     path: "/threats",
//   },
//   {
//     name: "Reports",
//     icon: <FileText size={20} />,
//     path: "/reports",
//   },
//   {
//     name: "Settings",
//     icon: <Settings size={20} />,
//     path: "/settings",
//   },
// ];

// export default function Sidebar() {
//   return (
//     <div className="w-64 bg-slate-900 text-white h-screen">

//       <div className="text-center py-8 border-b border-slate-700">

//         <h1 className="text-3xl font-bold text-cyan-400">
//           InsiderShield
//         </h1>

//         <p className="text-gray-400 text-sm mt-1">
//           Threat Intelligence
//         </p>

//       </div>

//       <div className="mt-8">

//         {menu.map((item) => (
//           <NavLink
//             key={item.name}
//             to={item.path}
//             className={({ isActive }) =>
//               `flex items-center gap-4 px-6 py-4 mx-3 rounded-xl transition
//               ${
//                 isActive
//                   ? "bg-cyan-500 text-white"
//                   : "hover:bg-slate-800 text-gray-300"
//               }`
//             }
            

//           >
//             {item.icon}
//             {item.name}
//           </NavLink>
//         ))}

//       </div>
//     </div>
//   );
// }


import {
  LayoutDashboard,
  Users,
  Activity,
  ShieldAlert,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/dashboard",
  },
  {
    name: "Employees",
    icon: <Users size={20} />,
    path: "/employees",
  },
  {
    name: "Activity Logs",
    icon: <Activity size={20} />,
    path: "/activitylogs",
  },
  {
    name: "Threats",
    icon: <ShieldAlert size={20} />,
    path: "/threats",
  },
  {
    name: "Reports",
    icon: <FileText size={20} />,
    path: "/reports",
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col justify-between">

      {/* Logo */}
      <div>

        <div className="text-center py-8 border-b border-slate-700">
          <h1 className="text-3xl font-bold text-cyan-400">
            InsiderShield
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Threat Intelligence
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-8">

          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 mx-3 mb-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-500 text-white shadow-lg font-semibold"
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}

        </div>

      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">

        <button
          className="flex items-center gap-4 w-full px-6 py-4 rounded-xl
                     text-gray-300 hover:bg-red-500 hover:text-white
                     transition-all duration-300"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>

    </div>
  );
}