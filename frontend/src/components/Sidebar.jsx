import {
    LayoutDashboard,
    Users,
    ShieldAlert,
    Bell,
    SearchCheck,
    Building2,
    Laptop,
    KeyRound,
    FileBarChart2,
    Settings,
    Activity,
    LogOut,
    BarChart3,
    Network
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

function Sidebar({ role }) {

    const location = useLocation();

    const menus = {

        Admin: [
            { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
            { name: "Employee Management", path: "/employees", icon: Users },
            { name: "Threat Detection", path: "/threat-detection", icon: ShieldAlert },
            { name: "Threat Notifications", path: "/notifications", icon: Bell },
            { name: "Investigations", path: "/investigations", icon: SearchCheck },
            { name: "Departments", path: "#", icon: Building2 },
            { name: "Devices", path: "#", icon: Laptop },
            { name: "Access Privileges", path: "#", icon: KeyRound },
            { name: "Reports", path: "/reports", icon: FileBarChart2 },
            { name: "Settings", path: "#", icon: Settings },
            {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3
},
        ],

        "Security Analyst": [
            { name: "Dashboard", path: "/analyst", icon: LayoutDashboard },
            { name: "Threat Detection", path: "/threat-detection", icon: ShieldAlert },
            { name: "Investigations", path: "/investigations", icon: SearchCheck },
            { name: "Reports", path: "/reports", icon: FileBarChart2 },
            { name: "Activity Logs", path: "#", icon: Activity }
        ],

        "SOC Engineer": [
            { name: "Dashboard", path: "/soc", icon: LayoutDashboard },
            { name: "Devices", path: "#", icon: Laptop },
            { name: "System Events", path: "#", icon: Activity },
            { name: "Network Activity", path: "#", icon: Network }
        ],

        Employee: [
            { name: "Dashboard", path: "/employee", icon: LayoutDashboard },
            { name: "My Profile", path: "#", icon: Users },
            { name: "My Activity", path: "#", icon: Activity },
            { name: "My Devices", path: "#", icon: Laptop }
        ]

    };

    return (

        <aside className="w-72 min-h-screen bg-[#0F172A] border-r border-slate-700 flex flex-col">

            {/* Logo */}

            <div className="px-8 py-8 border-b border-slate-700">

                <h1 className="text-3xl font-bold text-white tracking-wide">

                    Insider Threat BI

                </h1>

                <p className="text-sm text-slate-400 mt-1">

                    Behavioral Intelligence System

                </p>

            </div>

            {/* Navigation */}

            <nav className="flex-1 px-4 py-6">

                <ul className="space-y-2">

                    {menus[role]?.map((item) => {

                        const Icon = item.icon;

                        const active = location.pathname === item.path;

                        return (

                            <li key={item.name}>

                                <Link

                                    to={item.path}

                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                                        active
                                            ? "bg-[#312E81] text-white border-l-4 border-indigo-400 shadow-md"
                                            : "text-slate-300 hover:bg-[#1E293B] hover:text-indigo-300"
                                    }`}

                                >

                                    <Icon size={20} />

                                    <span className="font-medium">

                                        {item.name}

                                    </span>

                                </Link>

                            </li>

                        );

                    })}

                </ul>

            </nav>

            {/* Footer */}

            <div className="border-t border-slate-700 p-5">

                <Link

                    to="/login"

                    className="flex items-center justify-center gap-3 rounded-xl py-3 bg-[#1E293B] text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-300"

                >

                    <LogOut size={18} />

                    Logout

                </Link>

            </div>

        </aside>

    );

}

export default Sidebar;